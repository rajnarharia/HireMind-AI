import os
import json
import uuid
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, database
from ..services.auth import get_current_user
from ..services.pdf_service import extract_text_from_pdf
from ..services.ai_service import analyze_resume

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...), 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # 1. Save file locally
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Extract Text
    with open(file_path, "rb") as f:
        pdf_bytes = f.read()
        
    extracted_text = extract_text_from_pdf(pdf_bytes)
    
    if not extracted_text:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="Could not extract text from PDF. Ensure the PDF is not an image.")

    # 3. Call Groq AI
    ai_analysis = analyze_resume(extracted_text)
    
    # 4. Save to DB
    # Create Resume record
    db_resume = models.Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        parsed_text=extracted_text,
    )
    db.add(db_resume)
    db.flush() # Flush to get the ID for the analysis table
    
    # Create Analysis record
    db_analysis = models.ResumeAnalysis(
        resume_id=db_resume.id,
        ats_score=ai_analysis.get("ats_score", 0),
        resume_score=ai_analysis.get("resume_score", 0),
        skills=json.dumps(ai_analysis.get("skills", [])),
        strengths=json.dumps(ai_analysis.get("strengths", [])),
        weaknesses=json.dumps(ai_analysis.get("weaknesses", [])),
        missing_skills=json.dumps(ai_analysis.get("missing_skills", [])),
        suggestions=json.dumps(ai_analysis.get("suggestions", [])),
        summary=ai_analysis.get("summary", "")
    )
    db.add(db_analysis)
    
    db.commit()
    db.refresh(db_resume)
    
    # The response schema handles parsing the JSON via from_attributes, 
    # but we need to manually deserialize the JSON strings for the response since Pydantic expects lists.
    # A cleaner way is returning a custom dict matching the schema for the immediate response.
    
    response_data = {
        "id": db_resume.id,
        "user_id": db_resume.user_id,
        "filename": db_resume.filename,
        "created_at": db_resume.created_at,
        "analysis": {
            "id": db_analysis.id,
            "ats_score": db_analysis.ats_score,
            "resume_score": db_analysis.resume_score,
            "skills": json.loads(db_analysis.skills),
            "strengths": json.loads(db_analysis.strengths),
            "weaknesses": json.loads(db_analysis.weaknesses),
            "missing_skills": json.loads(db_analysis.missing_skills),
            "suggestions": json.loads(db_analysis.suggestions),
            "summary": db_analysis.summary,
            "created_at": db_analysis.created_at
        }
    }
    
    return response_data

@router.get("/history", response_model=list[schemas.ResumeResponse])
def get_resume_history(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    resumes = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.created_at.desc()).all()
    
    # Deserialize JSON strings for Pydantic response
    result = []
    for r in resumes:
        data = {
            "id": r.id,
            "user_id": r.user_id,
            "filename": r.filename,
            "created_at": r.created_at,
            "analysis": None
        }
        if r.analysis:
            data["analysis"] = {
                "id": r.analysis.id,
                "ats_score": r.analysis.ats_score,
                "resume_score": r.analysis.resume_score,
                "skills": json.loads(r.analysis.skills),
                "strengths": json.loads(r.analysis.strengths),
                "weaknesses": json.loads(r.analysis.weaknesses),
                "missing_skills": json.loads(r.analysis.missing_skills),
                "suggestions": json.loads(r.analysis.suggestions),
                "summary": r.analysis.summary,
                "created_at": r.analysis.created_at
            }
        result.append(data)
        
    return result

@router.get("/latest", response_model=schemas.ResumeResponse)
def get_latest_resume(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.created_at.desc()).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found")
        
    data = {
        "id": resume.id,
        "user_id": resume.user_id,
        "filename": resume.filename,
        "created_at": resume.created_at,
        "analysis": None
    }
    
    if resume.analysis:
        data["analysis"] = {
            "id": resume.analysis.id,
            "ats_score": resume.analysis.ats_score,
            "resume_score": resume.analysis.resume_score,
            "skills": json.loads(resume.analysis.skills),
            "strengths": json.loads(resume.analysis.strengths),
            "weaknesses": json.loads(resume.analysis.weaknesses),
            "missing_skills": json.loads(resume.analysis.missing_skills),
            "suggestions": json.loads(resume.analysis.suggestions),
            "summary": resume.analysis.summary,
            "created_at": resume.analysis.created_at
        }
        
    return data
