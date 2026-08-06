from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.auth import get_current_user

router = APIRouter()

class JobCreate(BaseModel):
    title: str
    description: str
    requirements: list[str]

@router.get("/")
async def get_jobs():
    return {
        "jobs": [
            {"id": 1, "title": "Senior Frontend Engineer", "department": "Engineering"},
            {"id": 2, "title": "Backend Python Developer", "department": "Engineering"}
        ]
    }

@router.post("/")
async def create_job(job: JobCreate, current_user: dict = Depends(get_current_user)):
    return {
        "status": "success",
        "message": "Job created successfully",
        "job_id": 3
    }
