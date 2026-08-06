from sqlalchemy.orm import Session
from app import models
from app.database import engine, SessionLocal
from datetime import datetime, timedelta
import bcrypt

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def seed_db():
    print("Seeding database for Demo Mode...")
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Create Recruiter
    demo_recruiter = models.User(
        email="recruiter@demo.com",
        name="Demo Recruiter",
        hashed_password=get_password_hash("demo123"),
        role="recruiter"
    )
    db.add(demo_recruiter)
    
    # Create Candidate
    demo_candidate = models.User(
        email="candidate@demo.com",
        name="Alex Candidate",
        hashed_password=get_password_hash("demo123"),
        role="candidate"
    )
    db.add(demo_candidate)
    
    db.commit()
    db.refresh(demo_recruiter)
    db.refresh(demo_candidate)
    
    # Demo Candidate Profile
    profile = models.CandidateProfile(
        user_id=demo_candidate.id,
        xp=450,
        streak_days=5
    )
    db.add(profile)
    
    # Demo Job
    demo_job = models.JobPosting(
        recruiter_id=demo_recruiter.id,
        title="Senior AI Engineer",
        department="Engineering",
        location="San Francisco (Hybrid)",
        description="We are looking for a Senior AI Engineer to build LLM infrastructure.",
        required_skills='["Python", "FastAPI", "RAG", "React"]',
        experience="5+ years experience",
        status="active",
        openings=3
    )
    db.add(demo_job)
    db.commit()
    db.refresh(demo_job)
    
    # Demo Application
    demo_app = models.JobApplication(
        job_id=demo_job.id,
        candidate_id=demo_candidate.id,
        status="Interview"
    )
    db.add(demo_app)
    db.commit()
    db.refresh(demo_app)
    
    # Demo Resume
    demo_resume = models.Resume(
        user_id=demo_candidate.id,
        filename="Alex_Resume.pdf",
        file_path="/uploads/Alex_Resume.pdf",
        parsed_text="Senior Software Engineer with 5 years of Python and React experience. Built scalable RAG systems."
    )
    db.add(demo_resume)
    db.commit()
    db.refresh(demo_resume)

    # Demo Resume Analysis
    demo_analysis = models.ResumeAnalysis(
        resume_id=demo_resume.id,
        ats_score=92.5,
        resume_score=92.5,
        skills='["Python", "FastAPI", "React"]',
        strengths='["Strong backend engineering", "RAG Experience"]',
        weaknesses='["No cloud deployment listed"]',
        missing_skills='["Docker"]',
        suggestions='["Add Docker and AWS to resume"]',
        summary="Strong candidate with good backend experience."
    )
    db.add(demo_analysis)
    db.commit()
    
    # Demo Hiring Report
    # We need a JobDescription for the report
    demo_jd = models.JobDescription(
        user_id=demo_candidate.id,
        title="Senior AI Engineer Job Description",
        raw_text="Senior AI Engineer Job Description",
        required_skills='["Python", "FastAPI", "RAG", "React"]'
    )
    db.add(demo_jd)
    db.commit()
    db.refresh(demo_jd)

    demo_report = models.HiringReport(
        user_id=demo_candidate.id,
        job_id=demo_jd.id,
        resume_id=demo_resume.id,
        resume_score=92.5,
        interview_score=88.0,
        coding_score=95.0,
        overall_score=91.8,
        hiring_recommendation="Hire",
        strengths='["RAG", "Python"]',
        weaknesses='["Cloud Deployment"]',
        risks='["None"]',
        positive_observations='["Excellent problem solver"]',
        improvement_suggestions='["Learn Docker"]',
        recommended_roles='["Senior Backend Engineer", "AI Engineer"]',
        salary_readiness="Ready for $150k+",
        confidence_level="High"
    )
    db.add(demo_report)
    db.commit()
    
    # Demo Interview Schedule
    demo_schedule = models.ScheduledInterview(
        application_id=demo_app.id,
        candidate_id=demo_candidate.id,
        interview_type="Technical Interview",
        meeting_mode="Google Meet",
        meeting_link="https://meet.hiremind.ai/demo",
        start_time=datetime.utcnow() + timedelta(days=1),
        end_time=datetime.utcnow() + timedelta(days=1, hours=1),
        duration_minutes=60,
        timezone="America/Los_Angeles",
        status="Scheduled",
        notes="Please prepare to discuss your previous RAG experience."
    )
    db.add(demo_schedule)
    
    # Demo Copilot Chat
    demo_chat = models.CopilotChat(
        user_id=demo_candidate.id,
        title="Career Advice"
    )
    db.add(demo_chat)
    db.commit()
    db.refresh(demo_chat)
    
    demo_msg = models.CopilotMessage(
        chat_id=demo_chat.id,
        role="assistant",
        content="Hello Alex! I see you scored 95% on your coding round for the Senior AI Engineer role. How can I help you prepare for the final technical interview tomorrow?"
    )
    db.add(demo_msg)
    
    db.commit()
    db.close()
    
    print("Database seeded successfully! Try logging in with recruiter@demo.com / demo123 or candidate@demo.com / demo123")

if __name__ == "__main__":
    seed_db()
