from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import shutil

from backend.app.ai.resume_analyzer import analyze_resume

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)

UPLOAD_DIR = "backend/uploads"


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    # Only PDF files allowed
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    analysis = analyze_resume(file_path)

    return {
        "status": "success",
        "filename": file.filename,
        "analysis": analysis
    }