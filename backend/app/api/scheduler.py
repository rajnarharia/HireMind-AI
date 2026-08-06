from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.auth import get_current_user

router = APIRouter()

class ScheduleRequest(BaseModel):
    date: str
    time: str
    interviewer_id: int

@router.post("/book")
async def book_interview(request: ScheduleRequest, current_user: dict = Depends(get_current_user)):
    return {
        "status": "success",
        "message": f"Interview scheduled successfully for {request.date} at {request.time}",
        "interview_id": 101
    }

@router.get("/upcoming")
async def get_upcoming_interviews(current_user: dict = Depends(get_current_user)):
    return {
        "interviews": [
            {"id": 101, "date": "2026-08-01", "time": "10:00 AM", "interviewer": "AI HR"}
        ]
    }
