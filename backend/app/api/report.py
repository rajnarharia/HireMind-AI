from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
from ..services.ai_service import analyze_job_description, generate_hiring_report

router = APIRouter()

@router.post("/generate", response_model=schemas.HiringReportResponse)
def generate_report(
    request: schemas.JobDescriptionCreate,
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Verify Resume
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    # 2. Get latest Interview
    interview = db.query(models.Interview).filter(
        models.Interview.resume_id == resume_id, 
        models.Interview.user_id == current_user.id,
        models.Interview.status == "completed"
    ).order_by(models.Interview.created_at.desc()).first()
    
    # 3. Get latest Coding Round
    coding = db.query(models.CodingRound).filter(
        models.CodingRound.resume_id == resume_id,
        models.CodingRound.user_id == current_user.id,
        models.CodingRound.status == "completed"
    ).order_by(models.CodingRound.created_at.desc()).first()
    
    # if not interview or not coding:
    #     raise HTTPException(status_code=400, detail="Candidate must complete an Interview and Coding round first.")

    # 4. Save Job Description & Analyze
    jd_analysis = analyze_job_description(request.raw_text)
    jd = models.JobDescription(
        user_id=current_user.id,
        title=request.title,
        raw_text=request.raw_text,
        required_skills=json.dumps(jd_analysis.get("required_skills", [])),
        experience=jd_analysis.get("experience", "Unknown"),
        education=jd_analysis.get("education", "Unknown"),
        responsibilities=json.dumps(jd_analysis.get("responsibilities", [])),
        soft_skills=json.dumps(jd_analysis.get("soft_skills", []))
    )
    db.add(jd)
    db.commit()
    db.refresh(jd)

    # 5. Compile Contexts for AI
    resume_context = {
        "summary": resume.analysis.summary if resume.analysis else "",
        "skills": eval(resume.analysis.skills) if resume.analysis and resume.analysis.skills else [],
        "score": resume.analysis.ats_score if resume.analysis else 0
    }
    
    interview_context = {
        "final_score": interview.final_score if interview else 0,
        "target_role": interview.target_role if interview else "Unknown"
    }
    
    coding_context = {
        "final_score": coding.final_score if coding else 0,
        "target_role": coding.target_role if coding else "Unknown",
        "difficulty": coding.difficulty if coding else "Unknown"
    }

    
    # 6. Generate Master Report
    ai_report = generate_hiring_report(resume_context, interview_context, coding_context, jd_analysis)
    
    sg = ai_report.get("skill_gap", {})
    rep = ai_report.get("report", {})
    
    # 7. Save Skill Gap Analysis
    skill_gap = models.SkillGapAnalysis(
        user_id=current_user.id,
        job_id=jd.id,
        resume_id=resume_id,
        skill_match_percent=sg.get("skill_match_percent", 0),
        technical_match_percent=sg.get("technical_match_percent", 0),
        soft_skill_match_percent=sg.get("soft_skill_match_percent", 0),
        experience_match_percent=sg.get("experience_match_percent", 0),
        education_match_percent=sg.get("education_match_percent", 0),
        matching_skills=json.dumps(sg.get("matching_skills", [])),
        missing_skills=json.dumps(sg.get("missing_skills", [])),
        weak_skills=json.dumps(sg.get("weak_skills", [])),
        strong_skills=json.dumps(sg.get("strong_skills", [])),
        recommended_skills=json.dumps(sg.get("recommended_skills", []))
    )
    db.add(skill_gap)
    
    # 8. Save Hiring Report
    hiring_report = models.HiringReport(
        user_id=current_user.id,
        job_id=jd.id,
        resume_id=resume_id,
        resume_score=rep.get("resume_score", 0),
        interview_score=rep.get("interview_score", 0),
        coding_score=rep.get("coding_score", 0),
        overall_score=rep.get("overall_score", 0),
        strengths=json.dumps(rep.get("strengths", [])),
        weaknesses=json.dumps(rep.get("weaknesses", [])),
        risks=json.dumps(rep.get("risks", [])),
        positive_observations=json.dumps(rep.get("positive_observations", [])),
        improvement_suggestions=json.dumps(rep.get("improvement_suggestions", [])),
        recommended_roles=json.dumps(rep.get("recommended_roles", [])),
        salary_readiness=rep.get("salary_readiness", "Unknown"),
        hiring_recommendation=rep.get("hiring_recommendation", "Maybe"),
        confidence_level=rep.get("confidence_level", "Medium")
    )
    db.add(hiring_report)
    db.commit()
    db.refresh(hiring_report)
    db.refresh(skill_gap)
    
    return {
        "id": hiring_report.id,
        "job_id": hiring_report.job_id,
        "resume_id": hiring_report.resume_id,
        "resume_score": hiring_report.resume_score,
        "interview_score": hiring_report.interview_score,
        "coding_score": hiring_report.coding_score,
        "overall_score": hiring_report.overall_score,
        "strengths": json.loads(hiring_report.strengths),
        "weaknesses": json.loads(hiring_report.weaknesses),
        "risks": json.loads(hiring_report.risks),
        "positive_observations": json.loads(hiring_report.positive_observations),
        "improvement_suggestions": json.loads(hiring_report.improvement_suggestions),
        "recommended_roles": json.loads(hiring_report.recommended_roles),
        "salary_readiness": hiring_report.salary_readiness,
        "hiring_recommendation": hiring_report.hiring_recommendation,
        "confidence_level": hiring_report.confidence_level,
        "created_at": hiring_report.created_at
    }

@router.get("/history", response_model=List[schemas.HiringReportResponse])
def get_reports(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    reports = db.query(models.HiringReport).filter(models.HiringReport.user_id == current_user.id).all()
    result = []
    for r in reports:
        result.append({
            "id": r.id,
            "job_id": r.job_id,
            "resume_id": r.resume_id,
            "resume_score": r.resume_score,
            "interview_score": r.interview_score,
            "coding_score": r.coding_score,
            "overall_score": r.overall_score,
            "strengths": json.loads(r.strengths),
            "weaknesses": json.loads(r.weaknesses),
            "risks": json.loads(r.risks),
            "positive_observations": json.loads(r.positive_observations),
            "improvement_suggestions": json.loads(r.improvement_suggestions),
            "recommended_roles": json.loads(r.recommended_roles),
            "salary_readiness": r.salary_readiness,
            "hiring_recommendation": r.hiring_recommendation,
            "confidence_level": r.confidence_level,
            "created_at": r.created_at
        })
    return result

@router.get("/{report_id}/gap", response_model=schemas.SkillGapAnalysisResponse)
def get_skill_gap(report_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    report = db.query(models.HiringReport).filter(models.HiringReport.id == report_id, models.HiringReport.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404)
        
    sg = db.query(models.SkillGapAnalysis).filter(
        models.SkillGapAnalysis.job_id == report.job_id,
        models.SkillGapAnalysis.resume_id == report.resume_id
    ).first()
    
    return {
        "id": sg.id,
        "job_id": sg.job_id,
        "resume_id": sg.resume_id,
        "skill_match_percent": sg.skill_match_percent,
        "technical_match_percent": sg.technical_match_percent,
        "soft_skill_match_percent": sg.soft_skill_match_percent,
        "experience_match_percent": sg.experience_match_percent,
        "education_match_percent": sg.education_match_percent,
        "matching_skills": json.loads(sg.matching_skills),
        "missing_skills": json.loads(sg.missing_skills),
        "weak_skills": json.loads(sg.weak_skills),
        "strong_skills": json.loads(sg.strong_skills),
        "recommended_skills": json.loads(sg.recommended_skills),
        "created_at": sg.created_at
    }
