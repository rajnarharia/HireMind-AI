from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[schemas.InterviewNotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Using InterviewNotification as a generic notification table for now to avoid migration
    return db.query(models.InterviewNotification).filter(
        models.InterviewNotification.user_id == current_user.id
    ).order_by(models.InterviewNotification.created_at.desc()).all()

@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db.query(models.InterviewNotification).filter(
        models.InterviewNotification.user_id == current_user.id,
        models.InterviewNotification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "success"}

@router.put("/{notif_id}/read")
def mark_notification_read(notif_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    notif = db.query(models.InterviewNotification).filter(
        models.InterviewNotification.id == notif_id, 
        models.InterviewNotification.user_id == current_user.id
    ).first()
    
    if notif:
        notif.is_read = True
        db.commit()
        return {"status": "success", "id": notif.id}
    raise HTTPException(status_code=404, detail="Notification not found")

@router.delete("/{notif_id}")
def delete_notification(notif_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    notif = db.query(models.InterviewNotification).filter(
        models.InterviewNotification.id == notif_id, 
        models.InterviewNotification.user_id == current_user.id
    ).first()
    
    if notif:
        db.delete(notif)
        db.commit()
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Notification not found")
