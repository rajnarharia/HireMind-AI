from sqlalchemy import Boolean, Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    role = Column(String, default="candidate") # candidate, recruiter, admin
    company = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    file_path = Column(String)
    parsed_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User")
    analysis = relationship("ResumeAnalysis", back_populates="resume", uselist=False, cascade="all, delete-orphan")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    ats_score = Column(Float)
    resume_score = Column(Float)
    skills = Column(Text) # JSON list
    strengths = Column(Text) # JSON list
    weaknesses = Column(Text) # JSON list
    missing_skills = Column(Text) # JSON list
    suggestions = Column(Text) # JSON list
    summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="analysis")

class Interview(Base):
    __tablename__ = "interviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    target_role = Column(String, default="Software Engineer")
    status = Column(String, default="in_progress") # in_progress, completed
    final_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    questions = relationship("InterviewQuestion", back_populates="interview", cascade="all, delete-orphan")

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    question_text = Column(Text)
    category = Column(String) # technical, behavioral, project, problem_solving
    difficulty = Column(String) # easy, medium, hard
    skill_tag = Column(String, nullable=True) # e.g. "React", "Python"
    order_index = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    interview = relationship("Interview", back_populates="questions")
    answer = relationship("InterviewAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")

class InterviewAnswer(Base):
    __tablename__ = "interview_answers"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("interview_questions.id"))
    answer_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    question = relationship("InterviewQuestion", back_populates="answer")
    evaluation = relationship("InterviewEvaluation", back_populates="answer", uselist=False, cascade="all, delete-orphan")

class InterviewEvaluation(Base):
    __tablename__ = "interview_evaluations"
    id = Column(Integer, primary_key=True, index=True)
    answer_id = Column(Integer, ForeignKey("interview_answers.id"))
    score = Column(Float)
    strengths = Column(Text) # JSON list
    weaknesses = Column(Text) # JSON list
    suggestions = Column(Text) # JSON list
    ideal_answer = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    answer = relationship("InterviewAnswer", back_populates="evaluation")

class CodingRound(Base):
    __tablename__ = "coding_rounds"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    target_role = Column(String, default="Software Engineer")
    difficulty = Column(String, default="medium")
    status = Column(String, default="in_progress") # in_progress, completed
    final_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    questions = relationship("CodingQuestion", back_populates="coding_round", cascade="all, delete-orphan")

class CodingQuestion(Base):
    __tablename__ = "coding_questions"
    id = Column(Integer, primary_key=True, index=True)
    round_id = Column(Integer, ForeignKey("coding_rounds.id"))
    title = Column(String)
    problem_statement = Column(Text)
    topic_tag = Column(String) # e.g. Arrays, Strings, Hash Maps
    difficulty = Column(String) # easy, medium, hard
    constraints = Column(Text) # JSON list
    examples = Column(Text) # JSON list of dicts
    visible_test_cases = Column(Text) # JSON list of dicts
    hidden_test_cases = Column(Text) # JSON list of dicts
    hints = Column(Text) # JSON list
    created_at = Column(DateTime, default=datetime.utcnow)
    
    coding_round = relationship("CodingRound", back_populates="questions")
    submissions = relationship("CodingSubmission", back_populates="question", cascade="all, delete-orphan")

class CodingSubmission(Base):
    __tablename__ = "coding_submissions"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("coding_questions.id"))
    language = Column(String)
    code = Column(Text)
    status = Column(String) # passed, failed, error
    passed_cases = Column(Integer, default=0)
    total_cases = Column(Integer, default=0)
    execution_time_ms = Column(Float, default=0.0)
    memory_kb = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    question = relationship("CodingQuestion", back_populates="submissions")
    review = relationship("CodingReview", back_populates="submission", uselist=False, cascade="all, delete-orphan")

class CodingReview(Base):
    __tablename__ = "coding_reviews"
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("coding_submissions.id"))
    score = Column(Float)
    time_complexity = Column(String)
    space_complexity = Column(String)
    correctness = Column(String)
    code_quality = Column(String)
    optimization_suggestions = Column(Text) # JSON list
    security_issues = Column(Text) # JSON list
    alternative_solution = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    submission = relationship("CodingSubmission", back_populates="review")

class JobDescription(Base):
    __tablename__ = "job_descriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    raw_text = Column(Text)
    required_skills = Column(Text) # JSON List
    experience = Column(String)
    education = Column(String)
    responsibilities = Column(Text) # JSON List
    soft_skills = Column(Text) # JSON List
    created_at = Column(DateTime, default=datetime.utcnow)

class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analysis"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("job_descriptions.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    
    skill_match_percent = Column(Float)
    technical_match_percent = Column(Float)
    soft_skill_match_percent = Column(Float)
    experience_match_percent = Column(Float)
    education_match_percent = Column(Float)
    
    matching_skills = Column(Text) # JSON List
    missing_skills = Column(Text) # JSON List
    weak_skills = Column(Text) # JSON List
    strong_skills = Column(Text) # JSON List
    recommended_skills = Column(Text) # JSON List
    
    created_at = Column(DateTime, default=datetime.utcnow)

class HiringReport(Base):
    __tablename__ = "hiring_reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("job_descriptions.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    
    resume_score = Column(Float)
    interview_score = Column(Float)
    coding_score = Column(Float)
    overall_score = Column(Float)
    
    strengths = Column(Text) # JSON List
    weaknesses = Column(Text) # JSON List
    risks = Column(Text) # JSON List
    positive_observations = Column(Text) # JSON List
    improvement_suggestions = Column(Text) # JSON List
    recommended_roles = Column(Text) # JSON List
    
    salary_readiness = Column(String)
    hiring_recommendation = Column(String) # Hire, Maybe, Reject
    confidence_level = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    bio = Column(Text, nullable=True)
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    xp = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    skills = Column(Text, nullable=True) # JSON list
    experience = Column(Text, nullable=True) # JSON list
    education = Column(Text, nullable=True) # JSON list
    projects = Column(Text, nullable=True) # JSON list
    certificates = Column(Text, nullable=True) # JSON list
    avatar_url = Column(String, nullable=True)
    last_active = Column(DateTime, default=datetime.utcnow)

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    badge_name = Column(String)
    description = Column(String)
    earned_at = Column(DateTime, default=datetime.utcnow)

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    report_id = Column(Integer, ForeignKey("hiring_reports.id")) # Source report
    overall_progress = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    weeks = relationship("RoadmapWeek", back_populates="roadmap")
    report = relationship("HiringReport")

class RoadmapWeek(Base):
    __tablename__ = "roadmap_weeks"
    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("learning_roadmaps.id"))
    week_number = Column(Integer)
    topics = Column(String)
    mini_project = Column(String)
    progress = Column(Float, default=0.0)
    
    roadmap = relationship("LearningRoadmap", back_populates="weeks")
    tasks = relationship("RoadmapTask", back_populates="week")

class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"
    id = Column(Integer, primary_key=True, index=True)
    week_id = Column(Integer, ForeignKey("roadmap_weeks.id"))
    title = Column(String)
    resource_link = Column(String)
    resource_type = Column(String) # Video, Article, Book, Practice
    is_completed = Column(Boolean, default=False)
    
    week = relationship("RoadmapWeek", back_populates="tasks")

class JobPosting(Base):
    __tablename__ = "job_postings"
    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    department = Column(String)
    location = Column(String)
    employment_type = Column(String)
    salary_range = Column(String)
    description = Column(Text)
    required_skills = Column(Text) # JSON List
    experience = Column(String)
    openings = Column(Integer, default=1)
    status = Column(String, default="active") # active, closed, draft
    created_at = Column(DateTime, default=datetime.utcnow)
    
    applications = relationship("JobApplication", back_populates="job")

class JobApplication(Base):
    __tablename__ = "job_applications"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_postings.id"))
    candidate_id = Column(Integer, ForeignKey("users.id"))
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    
    status = Column(String, default="Applied") # Applied, Screening, Interview, Coding, HR Round, Offer, Hired, Rejected
    applied_at = Column(DateTime, default=datetime.utcnow)
    
    job = relationship("JobPosting", back_populates="applications")
    notes = relationship("RecruiterNote", back_populates="application")

class RecruiterNote(Base):
    __tablename__ = "recruiter_notes"
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("job_applications.id"))
    recruiter_id = Column(Integer, ForeignKey("users.id"))
    note_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    application = relationship("JobApplication", back_populates="notes")

class ScheduledInterview(Base):
    __tablename__ = "scheduled_interviews"
    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"))
    candidate_id = Column(Integer, ForeignKey("users.id"))
    application_id = Column(Integer, ForeignKey("job_applications.id"))
    
    interview_type = Column(String) # HR, Technical, Coding, System Design
    meeting_mode = Column(String) # Google Meet, Teams, Zoom, Phone, In-Person
    meeting_link = Column(String)
    
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration_minutes = Column(Integer)
    timezone = Column(String)
    
    status = Column(String, default="Scheduled") # Scheduled, Confirmed, Cancelled, Rescheduled, Completed, No Show
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    notifications = relationship("InterviewNotification", back_populates="interview")

class InterviewNotification(Base):
    __tablename__ = "interview_notifications"
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("scheduled_interviews.id"))
    user_id = Column(Integer, ForeignKey("users.id")) # Target user
    title = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    interview = relationship("ScheduledInterview", back_populates="notifications")

class CopilotChat(Base):
    __tablename__ = "copilot_chats"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, default="New Chat")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    messages = relationship("CopilotMessage", back_populates="chat", cascade="all, delete-orphan")

class CopilotMessage(Base):
    __tablename__ = "copilot_messages"
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("copilot_chats.id"))
    role = Column(String) # "user", "assistant", "system"
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    chat = relationship("CopilotChat", back_populates="messages")
