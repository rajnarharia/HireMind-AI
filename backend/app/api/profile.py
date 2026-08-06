from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
from datetime import datetime
import json

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Get or create profile
    profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.CandidateProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    # Get latest data
    latest_resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.created_at.desc()).first()
    latest_interview = db.query(models.Interview).filter(models.Interview.user_id == current_user.id, models.Interview.status == "completed").order_by(models.Interview.created_at.desc()).first()
    latest_coding = db.query(models.CodingRound).filter(models.CodingRound.user_id == current_user.id, models.CodingRound.status == "completed").order_by(models.CodingRound.created_at.desc()).first()
    latest_report = db.query(models.HiringReport).filter(models.HiringReport.user_id == current_user.id).order_by(models.HiringReport.created_at.desc()).first()
    latest_roadmap = db.query(models.LearningRoadmap).filter(models.LearningRoadmap.user_id == current_user.id).order_by(models.LearningRoadmap.created_at.desc()).first()
    
    # Calculate chart trends (last 5 rounds)
    coding_history = db.query(models.CodingRound).filter(models.CodingRound.user_id == current_user.id, models.CodingRound.status == "completed").order_by(models.CodingRound.created_at.asc()).limit(5).all()
    interview_history = db.query(models.Interview).filter(models.Interview.user_id == current_user.id, models.Interview.status == "completed").order_by(models.Interview.created_at.asc()).limit(5).all()
    
    coding_trend = [{"name": f"Round {i+1}", "score": r.final_score or 0} for i, r in enumerate(coding_history)]
    interview_trend = [{"name": f"Mock {i+1}", "score": r.final_score or 0} for i, r in enumerate(interview_history)]
    
    # Skills Radar Data
    base_tech = (latest_coding.final_score if latest_coding and latest_coding.final_score else 0)
    base_comm = (latest_interview.final_score if latest_interview and latest_interview.final_score else 0)
    base_resume = (latest_resume.analysis.ats_score if latest_resume and latest_resume.analysis and latest_resume.analysis.ats_score else 0)
    skills = [
        {"subject": "Algorithms", "A": base_tech, "fullMark": 100},
        {"subject": "System Design", "A": max(0, base_tech - 10), "fullMark": 100},
        {"subject": "Communication", "A": base_comm, "fullMark": 100},
        {"subject": "Experience", "A": base_resume, "fullMark": 100},
        {"subject": "Culture Fit", "A": base_comm, "fullMark": 100},
    ]

    # Recent Roadmap Tasks
    recent_roadmap = []
    if latest_roadmap and latest_roadmap.weeks:
        first_week = latest_roadmap.weeks[0]
        if first_week.tasks:
            recent_roadmap = [{"title": t.title, "resource_type": t.resource_type, "week_number": first_week.week_number, "is_completed": t.is_completed} for t in first_week.tasks[:3]]
    
    
    return {
        "profile": {
            "xp": profile.xp,
            "streak": profile.streak_days,
            "github": profile.github_url,
            "linkedin": profile.linkedin_url
        },
        "scores": {
            "resume_ats": latest_resume.analysis.ats_score if latest_resume and latest_resume.analysis else 0,
            "interview": latest_interview.final_score if latest_interview else 0,
            "coding": latest_coding.final_score if latest_coding else 0,
            "overall_readiness": latest_report.overall_score if latest_report else 0
        },
        "roadmap_progress": latest_roadmap.overall_progress if latest_roadmap else 0,
        "active_roadmap_id": latest_roadmap.id if latest_roadmap else None,
        "charts": {
            "coding_trend": coding_trend,
            "interview_trend": interview_trend,
            "skills": skills
        },
        "recent_roadmap": recent_roadmap,
        "recent_activity": [
            {"type": "Resume Analyzed", "date": latest_resume.created_at if latest_resume else None},
            {"type": "Interview Completed", "date": latest_interview.created_at if latest_interview else None},
            {"type": "Coding Completed", "date": latest_coding.created_at if latest_coding else None},
            {"type": "Report Generated", "date": latest_report.created_at if latest_report else None}
        ]
    }
