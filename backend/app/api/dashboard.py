from fastapi import APIRouter, Depends
from app.services.auth import get_current_user

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    return {
        "status": "success",
        "data": {
            "interviews_completed": 3,
            "coding_challenges_passed": 5,
            "upcoming_interviews": 1,
            "overall_score": 85
        }
    }
