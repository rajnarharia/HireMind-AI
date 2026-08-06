from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
from ..services.auth import RequireRole

router = APIRouter()

# --- JOB MANAGEMENT ---

@router.post("/jobs", response_model=schemas.JobPostingResponse)
def create_job(job: schemas.JobPostingCreate, db: Session = Depends(get_db), current_user: models.User = Depends(RequireRole(["recruiter"]))):
        
    db_job = models.JobPosting(
        recruiter_id=current_user.id,
        title=job.title,
        department=job.department,
        location=job.location,
        employment_type=job.employment_type,
        salary_range=job.salary_range,
        description=job.description,
        required_skills=json.dumps(job.required_skills),
        experience=job.experience,
        openings=job.openings,
        status=job.status
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    return _format_job(db_job)

@router.get("/jobs", response_model=List[schemas.JobPostingResponse])
def get_jobs(db: Session = Depends(get_db), current_user: models.User = Depends(RequireRole(["recruiter"]))):
    jobs = db.query(models.JobPosting).filter(models.JobPosting.recruiter_id == current_user.id).order_by(models.JobPosting.created_at.desc()).all()
    return [_format_job(j) for j in jobs]

@router.put("/jobs/{job_id}/status")
def update_job_status(job_id: int, status: str, db: Session = Depends(get_db), current_user: models.User = Depends(RequireRole(["recruiter"]))):
    job = db.query(models.JobPosting).filter(models.JobPosting.id == job_id, models.JobPosting.recruiter_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404)
    job.status = status
    db.commit()
    return {"status": "success", "new_status": status}

@router.put("/jobs/{job_id}", response_model=schemas.JobPostingResponse)
def update_job(job_id: int, job_update: schemas.JobPostingCreate, db: Session = Depends(get_db), current_user: models.User = Depends(RequireRole(["recruiter"]))):
    job = db.query(models.JobPosting).filter(models.JobPosting.id == job_id, models.JobPosting.recruiter_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404)
    job.title = job_update.title
    job.department = job_update.department
    job.location = job_update.location
    job.employment_type = job_update.employment_type
    job.salary_range = job_update.salary_range
    job.description = job_update.description
    job.required_skills = json.dumps(job_update.required_skills)
    job.experience = job_update.experience
    job.openings = job_update.openings
    db.commit()
    db.refresh(job)
    return _format_job(job)

@router.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(RequireRole(["recruiter"]))):
    job = db.query(models.JobPosting).filter(models.JobPosting.id == job_id, models.JobPosting.recruiter_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404)
    db.delete(job)
    db.commit()
    return {"status": "success"}


# --- PIPELINE & APPLICATIONS ---

@router.get("/applications/{job_id}", response_model=List[schemas.CandidateDetailResponse])
def get_job_applications(job_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(RequireRole(["recruiter"]))):
        
    apps = db.query(models.JobApplication).filter(models.JobApplication.job_id == job_id).all()
    
    result = []
    for app in apps:
        candidate_user = db.query(models.User).filter(models.User.id == app.candidate_id).first()
        profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == app.candidate_id).first()
        report = db.query(models.HiringReport).filter(models.HiringReport.resume_id == app.resume_id).order_by(models.HiringReport.created_at.desc()).first()
        gap = db.query(models.SkillGapAnalysis).filter(models.SkillGapAnalysis.resume_id == app.resume_id).order_by(models.SkillGapAnalysis.created_at.desc()).first()
        
        # Ensure profile exists for response format
        if not profile:
            profile = models.CandidateProfile(user_id=app.candidate_id, xp=0, streak_days=0)
            
        result.append({
            "application": {
                "id": app.id,
                "job_id": app.job_id,
                "candidate_id": app.candidate_id,
                "resume_id": app.resume_id,
                "status": app.status,
                "applied_at": app.applied_at
            },
            "profile": {
                "id": profile.id or 0,
                "user_id": profile.user_id,
                "github_url": profile.github_url,
                "linkedin_url": profile.linkedin_url,
                "portfolio_url": profile.portfolio_url,
                "xp": profile.xp,
                "streak_days": profile.streak_days
            },
            "resume_score": report.resume_score if report else 0,
            "interview_score": report.interview_score if report else 0,
            "coding_score": report.coding_score if report else 0,
            "overall_readiness": report.overall_score if report else 0,
            "skill_match": gap.skill_match_percent if gap else 0,
            "hiring_recommendation": report.hiring_recommendation if report else "Unknown",
            "name": candidate_user.name,
            "email": candidate_user.email
        })
    return result

@router.put("/applications/{app_id}/status")
def update_application_status(app_id: int, new_status: str, db: Session = Depends(get_db), current_user: models.User = Depends(RequireRole(["recruiter"]))):
        
    app = db.query(models.JobApplication).filter(models.JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404)
        
    app.status = new_status
    db.commit()
    return {"status": "success", "new_status": new_status}


# --- OVERVIEW DASHBOARD ---

@router.get("/dashboard")
def get_recruiter_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    jobs = db.query(models.JobPosting).filter(models.JobPosting.recruiter_id == current_user.id).all()
    job_ids = [j.id for j in jobs]
    
    apps = db.query(models.JobApplication).filter(models.JobApplication.job_id.in_(job_ids)).all()
    
    active_jobs = sum(1 for j in jobs if j.status == 'active')
    total_candidates = len(apps)
    hired = sum(1 for a in apps if a.status == 'Hired')
    interviews = sum(1 for a in apps if a.status == 'Interview')
    
    return {
        "active_jobs": active_jobs,
        "total_candidates": total_candidates,
        "hired": hired,
        "interviews_scheduled": interviews
    }


def _format_job(job: models.JobPosting) -> dict:
    return {
        "id": job.id,
        "recruiter_id": job.recruiter_id,
        "title": job.title,
        "department": job.department,
        "location": job.location,
        "employment_type": job.employment_type,
        "salary_range": job.salary_range,
        "description": job.description,
        "required_skills": json.loads(job.required_skills) if job.required_skills else [],
        "experience": job.experience,
        "openings": job.openings,
        "status": job.status,
        "created_at": job.created_at
    }
