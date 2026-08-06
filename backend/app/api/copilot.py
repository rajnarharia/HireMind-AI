from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
from ..services.copilot_service import process_copilot_query

router = APIRouter()

@router.get("/chats", response_model=List[schemas.CopilotChatResponse])
def get_chats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.CopilotChat).filter(models.CopilotChat.user_id == current_user.id).order_by(models.CopilotChat.created_at.desc()).all()

@router.post("/chats", response_model=schemas.CopilotChatResponse)
def create_chat(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    chat = models.CopilotChat(user_id=current_user.id)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

@router.delete("/chats/{chat_id}")
def delete_chat(chat_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    chat = db.query(models.CopilotChat).filter(models.CopilotChat.id == chat_id, models.CopilotChat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404)
    db.delete(chat)
    db.commit()
    return {"status": "deleted"}

@router.post("/chats/{chat_id}/message", response_model=schemas.CopilotMessageResponse)
def send_message(chat_id: int, message: schemas.CopilotMessageCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    chat = db.query(models.CopilotChat).filter(models.CopilotChat.id == chat_id, models.CopilotChat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(status_code=404)
        
    # Save User Message
    user_msg = models.CopilotMessage(chat_id=chat_id, role="user", content=message.content)
    db.add(user_msg)
    db.commit()
    
    # Auto-title chat on first message
    chat_history = db.query(models.CopilotMessage).filter(models.CopilotMessage.chat_id == chat_id).order_by(models.CopilotMessage.created_at).all()
    if len(chat_history) == 1:
        chat.title = message.content[:30] + "..."
        db.commit()
        
    # Call Copilot RAG Service
    ai_response_content = process_copilot_query(db, current_user, chat_history, message.content)
    
    # Save Assistant Message
    ai_msg = models.CopilotMessage(chat_id=chat_id, role="assistant", content=ai_response_content)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    
    return ai_msg
