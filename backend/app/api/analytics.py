from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime, timedelta
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter()

@router.get("/recruiter/dashboard")
def get_recruiter_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Aggregate data
    total_jobs = db.query(models.JobPosting).filter(models.JobPosting.recruiter_id == current_user.id).count()
    total_apps = db.query(models.JobApplication).join(models.JobPosting).filter(models.JobPosting.recruiter_id == current_user.id).count()
    
    # Status distribution for pipeline
    status_counts = db.query(
        models.JobApplication.status, 
        func.count(models.JobApplication.id)
    ).join(models.JobPosting).filter(
        models.JobPosting.recruiter_id == current_user.id
    ).group_by(models.JobApplication.status).all()
    
    pipeline_data = []
    # Force strict order for funnel
    order = ["Applied", "Screening", "Interview", "Coding", "Offer", "Hired", "Rejected"]
    status_dict = {status: count for status, count in status_counts}
    
    for stage in order:
        pipeline_data.append({
            "name": stage,
            "value": status_dict.get(stage, 0)
        })
        
    # If no data, provide fallback empty lists instead of mock data so it's accurate
    if total_apps == 0:
        pipeline_data = [{"name": stage, "value": 0} for stage in order]
        
    # Application trends over time (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    apps_by_date = db.query(
        func.date(models.JobApplication.created_at).label('date'),
        func.count(models.JobApplication.id)
    ).join(models.JobPosting).filter(
        models.JobPosting.recruiter_id == current_user.id,
        models.JobApplication.created_at >= seven_days_ago
    ).group_by(func.date(models.JobApplication.created_at)).all()
    
    interviews_by_date = db.query(
        func.date(models.Interview.created_at).label('date'),
        func.count(models.Interview.id)
    ).join(models.JobApplication).join(models.JobPosting).filter(
        models.JobPosting.recruiter_id == current_user.id,
        models.Interview.created_at >= seven_days_ago
    ).group_by(func.date(models.Interview.created_at)).all()
    
    app_dict = {str(d[0]): d[1] for d in apps_by_date}
    int_dict = {str(d[0]): d[1] for d in interviews_by_date}
    
    trends_data = []
    for i in range(7):
        d = (seven_days_ago + timedelta(days=i)).date()
        trends_data.append({
            "date": d.strftime("%a"),
            "applications": app_dict.get(str(d), 0),
            "interviews": int_dict.get(str(d), 0)
        })
    
    # Candidate Sources (Assuming all from Platform since we don't track external sources yet)
    source_data = [
        {"name": "Direct Platform", "value": total_apps if total_apps > 0 else 1},
    ]
    # Calculate actual interviews scheduled
    interviews_scheduled = db.query(models.ScheduledInterview).filter(
        models.ScheduledInterview.recruiter_id == current_user.id,
        models.ScheduledInterview.status == "Scheduled"
    ).count()

    # Time to hire
    # Mocking as 0 since it requires complex tracking of 'Applied' to 'Hired' dates
    time_to_hire_days = 0 

    return {
        "metrics": {
            "total_jobs": total_jobs,
            "total_candidates": total_apps,
            "interviews_scheduled": interviews_scheduled,
            "time_to_hire_days": time_to_hire_days,
        },
        "pipeline_data": pipeline_data,
        "trends_data": trends_data,
        "source_data": source_data
    }
