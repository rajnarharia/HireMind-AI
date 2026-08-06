from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
import uuid

router = APIRouter()

@router.post("/interviews", response_model=schemas.ScheduledInterviewResponse)
def schedule_interview(
    interview: schemas.ScheduledInterviewCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can schedule interviews")
        
    # Check for conflicts for the candidate
    conflict = db.query(models.ScheduledInterview).filter(
        models.ScheduledInterview.candidate_id == interview.candidate_id,
        models.ScheduledInterview.status.in_(["Scheduled", "Confirmed"]),
        models.ScheduledInterview.start_time < interview.end_time,
        models.ScheduledInterview.end_time > interview.start_time
    ).first()
    
    if conflict:
        raise HTTPException(status_code=400, detail="Candidate already has an interview during this time.")

    # Generate custom meeting link if not provided and it's a virtual meeting
    link = interview.meeting_link
    if not link:
        if interview.meeting_mode == "Google Meet":
            link = f"https://meet.google.com/{uuid.uuid4().hex[:3]}-{uuid.uuid4().hex[:4]}-{uuid.uuid4().hex[:3]}"
        elif interview.meeting_mode == "Zoom":
            link = f"https://zoom.us/j/1{uuid.uuid4().int % 1000000000}"
        elif interview.meeting_mode == "Microsoft Teams":
            link = f"https://teams.microsoft.com/l/meetup-join/19:meeting_{uuid.uuid4().hex}"
        elif interview.meeting_mode != "In Person":
            link = f"https://meet.hiremind.ai/{uuid.uuid4().hex[:10]}"
        
    db_int = models.ScheduledInterview(
        recruiter_id=current_user.id,
        candidate_id=interview.candidate_id,
        application_id=interview.application_id,
        interview_type=interview.interview_type,
        meeting_mode=interview.meeting_mode,
        meeting_link=link,
        start_time=interview.start_time,
        end_time=interview.end_time,
        duration_minutes=interview.duration_minutes,
        timezone=interview.timezone,
        notes=interview.notes
    )
    db.add(db_int)
    db.commit()
    db.refresh(db_int)
    
    # Create notification for candidate
    notif = models.InterviewNotification(
        interview_id=db_int.id,
        user_id=interview.candidate_id,
        title=f"New Interview Scheduled: {interview.interview_type}",
        message=f"You have been scheduled for a {interview.duration_minutes}-minute {interview.meeting_mode} interview on {interview.start_time.strftime('%b %d, %Y at %I:%M %p')}."
    )
    db.add(notif)
    db.commit()
    
    return db_int

@router.get("/interviews", response_model=List[schemas.ScheduledInterviewResponse])
def get_interviews(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role == "recruiter":
        return db.query(models.ScheduledInterview).filter(models.ScheduledInterview.recruiter_id == current_user.id).order_by(models.ScheduledInterview.start_time).all()
    else:
        return db.query(models.ScheduledInterview).filter(models.ScheduledInterview.candidate_id == current_user.id).order_by(models.ScheduledInterview.start_time).all()

@router.put("/interviews/{interview_id}/status")
def update_interview_status(
    interview_id: int, 
    status: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    interview = db.query(models.ScheduledInterview).filter(models.ScheduledInterview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404)
        
    if current_user.role != "recruiter" and current_user.id != interview.candidate_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    interview.status = status
    db.commit()
    
    # Notify the OTHER party
    target_id = interview.recruiter_id if current_user.role == "candidate" else interview.candidate_id
    notif = models.InterviewNotification(
        interview_id=interview.id,
        user_id=target_id,
        title=f"Interview Status Updated: {status}",
        message=f"The {interview.interview_type} interview has been marked as {status} by {current_user.name}."
    )
    db.add(notif)
    db.commit()
    
    return {"status": "success", "new_status": status}

@router.get("/notifications", response_model=List[schemas.InterviewNotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.InterviewNotification).filter(
        models.InterviewNotification.user_id == current_user.id
    ).order_by(models.InterviewNotification.created_at.desc()).all()

@router.put("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    notif = db.query(models.InterviewNotification).filter(models.InterviewNotification.id == notif_id, models.InterviewNotification.user_id == current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}
