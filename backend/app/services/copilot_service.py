import os
from groq import Groq
from sqlalchemy.orm import Session
from .. import models
import json

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "gsk_placeholder_do_not_use_in_prod")
client = Groq(api_key=GROQ_API_KEY)

def _gather_candidate_context(db: Session, user_id: int) -> str:
    """Gathers all available platform context for a candidate for RAG."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    profile = db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == user_id).first()
    resumes = db.query(models.Resume).filter(models.Resume.user_id == user_id).all()
    reports = []
    for r in resumes:
        report = db.query(models.HiringReport).filter(models.HiringReport.resume_id == r.id).first()
        if report: reports.append(report)
        
    interviews = db.query(models.ScheduledInterview).filter(models.ScheduledInterview.candidate_id == user_id).all()
    
    context = f"Candidate Name: {user.name}\nEmail: {user.email}\n"
    if profile:
        context += f"XP: {profile.xp}, Streak: {profile.streak_days}\n"
    
    context += f"Total Resumes Uploaded: {len(resumes)}\n"
    for idx, rep in enumerate(reports):
        context += f"\n--- Hiring Report {idx+1} ---\n"
        context += f"Resume Score: {rep.resume_score}\nInterview Score: {rep.interview_score}\nCoding Score: {rep.coding_score}\n"
        context += f"Overall Score: {rep.overall_score}\nRecommendation: {rep.hiring_recommendation}\n"
        
    context += f"\n--- Scheduled Interviews: {len(interviews)} ---\n"
    for i in interviews:
        context += f"- {i.interview_type} ({i.status}) on {i.start_time}\n"
        
    return context

def _gather_recruiter_context(db: Session, user_id: int) -> str:
    """Gathers ATS context for a recruiter for RAG."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    jobs = db.query(models.JobPosting).filter(models.JobPosting.recruiter_id == user_id).all()
    job_ids = [j.id for j in jobs]
    apps = db.query(models.JobApplication).filter(models.JobApplication.job_id.in_(job_ids)).all()
    
    context = f"Recruiter Name: {user.name}\nEmail: {user.email}\n"
    context += f"Total Active Jobs: {len(jobs)}\n"
    for j in jobs:
        context += f"- {j.title} (Status: {j.status}, Openings: {j.openings})\n"
        
    context += f"Total Candidates in Pipeline: {len(apps)}\n"
    return context

def process_copilot_query(db: Session, user: models.User, chat_history: list, new_query: str) -> str:
    """
    Multi-Agent Coordinator Logic using Groq.
    Acts as Coordinator Agent that routes and answers based on RAG context.
    """
    if user.role == "candidate":
        context_data = _gather_candidate_context(db, user.id)
        system_prompt = f"""You are the HireMind AI Candidate Assistant, a specialized HR Copilot.
You have access to the candidate's entire platform history and data (RAG context).
Use this data to give highly personalized, accurate advice.
Format your output cleanly in Markdown, using bolding, lists, and code blocks where appropriate.

RAG CONTEXT DATABASE:
{context_data}

Rules:
1. If asked about their ATS score, interview performance, or coding performance, reference the RAG context.
2. If asked to recommend jobs, skills, or projects, use their weak points from the context.
3. Be professional, encouraging, and highly analytical.
"""
    else:
        context_data = _gather_recruiter_context(db, user.id)
        system_prompt = f"""You are the HireMind AI Recruiter Assistant, an enterprise-grade ATS Copilot.
You have access to the recruiter's entire active job pipeline and candidates (RAG context).
Use this data to help them make hiring decisions, write job descriptions, or draft emails.
Format your output cleanly in Markdown, using tables, lists, and code blocks where appropriate.

RAG CONTEXT DATABASE:
{context_data}

Rules:
1. If asked about pipeline metrics or active jobs, reference the RAG context.
2. Draft professional rejection/offer emails if requested.
3. Help identify hiring risks or bottlenecks.
"""

    messages = [{"role": "system", "content": system_prompt}]
    
    # Append history (limit to last 10 for context window safety)
    for msg in chat_history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})
        
    messages.append({"role": "user", "content": new_query})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
        max_tokens=2048
    )

    return response.choices[0].message.content
