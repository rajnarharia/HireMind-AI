from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
from ..services.ai_service import generate_learning_roadmap

router = APIRouter()

@router.post("/generate/{report_id}", response_model=schemas.LearningRoadmapResponse)
def generate_roadmap(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Get report and gap analysis
    report = db.query(models.HiringReport).filter(models.HiringReport.id == report_id, models.HiringReport.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Hiring report not found")
        
    gap = db.query(models.SkillGapAnalysis).filter(models.SkillGapAnalysis.job_id == report.job_id, models.SkillGapAnalysis.user_id == current_user.id).first()
    if not gap:
        raise HTTPException(status_code=404, detail="Skill gap analysis not found")
        
    # Check if roadmap already exists for this report
    existing = db.query(models.LearningRoadmap).filter(models.LearningRoadmap.report_id == report_id).first()
    if existing:
        return _format_roadmap(existing)
        
    # Generate via AI
    rep_data = {
        "overall_score": report.overall_score,
        "strengths": json.loads(report.strengths),
        "weaknesses": json.loads(report.weaknesses)
    }
    gap_data = {
        "missing_skills": json.loads(gap.missing_skills),
        "weak_skills": json.loads(gap.weak_skills),
        "recommended_skills": json.loads(gap.recommended_skills)
    }
    
    weeks_data = generate_learning_roadmap(rep_data, gap_data)
    
    roadmap = models.LearningRoadmap(
        user_id=current_user.id,
        report_id=report_id
    )
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)
    
    for w in weeks_data:
        week = models.RoadmapWeek(
            roadmap_id=roadmap.id,
            week_number=w.get("week_number", 1),
            topics=w.get("topics", ""),
            mini_project=w.get("mini_project", "")
        )
        db.add(week)
        db.commit()
        db.refresh(week)
        
        for t in w.get("tasks", []):
            task = models.RoadmapTask(
                week_id=week.id,
                title=t.get("title", ""),
                resource_link=t.get("resource_link", ""),
                resource_type=t.get("resource_type", "")
            )
            db.add(task)
    db.commit()
    
    # Reload with relationships
    roadmap = db.query(models.LearningRoadmap).filter(models.LearningRoadmap.id == roadmap.id).first()
    return _format_roadmap(roadmap)

@router.get("/my", response_model=List[schemas.LearningRoadmapResponse])
def get_my_roadmaps(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    roadmaps = db.query(models.LearningRoadmap).filter(models.LearningRoadmap.user_id == current_user.id).order_by(models.LearningRoadmap.created_at.desc()).all()
    return [_format_roadmap(r) for r in roadmaps]

@router.post("/task/{task_id}/toggle")
def toggle_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.RoadmapTask).join(models.RoadmapWeek).join(models.LearningRoadmap).filter(
        models.RoadmapTask.id == task_id,
        models.LearningRoadmap.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404)
        
    task.is_completed = not task.is_completed
    db.commit()
    
    # Update progress
    week = db.query(models.RoadmapWeek).filter(models.RoadmapWeek.id == task.week_id).first()
    total_tasks = len(week.tasks)
    completed = sum(1 for t in week.tasks if t.is_completed)
    week.progress = (completed / total_tasks) * 100 if total_tasks > 0 else 0
    
    roadmap = db.query(models.LearningRoadmap).filter(models.LearningRoadmap.id == week.roadmap_id).first()
    total_weeks = len(roadmap.weeks)
    overall = sum(w.progress for w in roadmap.weeks) / total_weeks if total_weeks > 0 else 0
    roadmap.overall_progress = overall
    db.commit()
    
    # Add XP
    if task.is_completed:
        profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == current_user.id).first()
        if profile:
            profile.xp += 10
            db.commit()
            
    return {"status": "success", "is_completed": task.is_completed, "week_progress": week.progress, "overall_progress": roadmap.overall_progress}

def _format_roadmap(roadmap: models.LearningRoadmap) -> dict:
    return {
        "id": roadmap.id,
        "user_id": roadmap.user_id,
        "report_id": roadmap.report_id,
        "overall_progress": roadmap.overall_progress,
        "created_at": roadmap.created_at,
        "weeks": [
            {
                "id": w.id,
                "week_number": w.week_number,
                "topics": w.topics,
                "mini_project": w.mini_project,
                "progress": w.progress,
                "tasks": [
                    {
                        "id": t.id,
                        "title": t.title,
                        "resource_link": t.resource_link,
                        "resource_type": t.resource_type,
                        "is_completed": t.is_completed
                    } for t in w.tasks
                ]
            } for w in sorted(roadmap.weeks, key=lambda x: x.week_number)
        ]
    }
