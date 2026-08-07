from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "candidate"
    company: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ResumeAnalysisResponse(BaseModel):
    id: int
    ats_score: float
    resume_score: float
    skills: List[str]
    strengths: List[str]
    weaknesses: List[str]
    missing_skills: List[str]
    suggestions: List[str]
    summary: str
    created_at: datetime
    class Config:
        from_attributes = True

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    created_at: datetime
    analysis: Optional[ResumeAnalysisResponse] = None
    class Config:
        from_attributes = True

class InterviewEvaluationResponse(BaseModel):
    id: int
    score: float
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    ideal_answer: str
    class Config:
        from_attributes = True

class InterviewAnswerResponse(BaseModel):
    id: int
    answer_text: str
    evaluation: Optional[InterviewEvaluationResponse] = None
    class Config:
        from_attributes = True

class InterviewQuestionResponse(BaseModel):
    id: int
    question_text: str
    category: str
    difficulty: str
    skill_tag: Optional[str] = None
    order_index: int
    answer: Optional[InterviewAnswerResponse] = None
    class Config:
        from_attributes = True

class InterviewResponse(BaseModel):
    id: int
    user_id: int
    resume_id: int
    target_role: str
    status: str
    final_score: Optional[float] = None
    created_at: datetime
    questions: List[InterviewQuestionResponse] = []
    class Config:
        from_attributes = True

class InterviewStartRequest(BaseModel):
    resume_id: int
    target_role: str = "Software Engineer"

class InterviewAnswerRequest(BaseModel):
    answer_text: str

class CodingStartRequest(BaseModel):
    resume_id: int
    target_role: str = "Software Engineer"
    difficulty: str = "medium"

class CodingRunRequest(BaseModel):
    language: str
    code: str

class CodingSubmitRequest(BaseModel):
    language: str
    code: str

class CodingReviewResponse(BaseModel):
    id: int
    score: float
    time_complexity: str
    space_complexity: str
    correctness: str
    code_quality: str
    optimization_suggestions: List[str]
    security_issues: List[str]
    alternative_solution: str
    class Config:
        from_attributes = True

class CodingSubmissionResponse(BaseModel):
    id: int
    language: str
    code: str
    status: str
    passed_cases: int
    total_cases: int
    execution_time_ms: float
    memory_kb: float
    error: Optional[str] = None
    review: Optional[CodingReviewResponse] = None
    created_at: datetime
    class Config:
        from_attributes = True

class CodingQuestionResponse(BaseModel):
    id: int
    title: str
    problem_statement: str
    topic_tag: str
    difficulty: str
    constraints: List[str]
    examples: List[dict]
    visible_test_cases: List[dict]
    hints: List[str]
    submissions: List[CodingSubmissionResponse] = []
    class Config:
        from_attributes = True

class CodingRoundResponse(BaseModel):
    id: int
    user_id: int
    resume_id: int
    target_role: str
    difficulty: str
    status: str
    final_score: Optional[float] = None
    created_at: datetime
    questions: List[CodingQuestionResponse] = []
    class Config:
        from_attributes = True

class JobDescriptionBase(BaseModel):
    title: str
    raw_text: str

class JobDescriptionCreate(JobDescriptionBase):
    pass

class JobDescriptionResponse(JobDescriptionBase):
    id: int
    user_id: int
    required_skills: List[str]
    experience: str
    education: str
    responsibilities: List[str]
    soft_skills: List[str]
    created_at: datetime
    class Config:
        from_attributes = True

class SkillGapAnalysisResponse(BaseModel):
    id: int
    job_id: int
    resume_id: int
    skill_match_percent: float
    technical_match_percent: float
    soft_skill_match_percent: float
    experience_match_percent: float
    education_match_percent: float
    matching_skills: List[str]
    missing_skills: List[str]
    weak_skills: List[str]
    strong_skills: List[str]
    recommended_skills: List[str]
    created_at: datetime
    class Config:
        from_attributes = True

class HiringReportResponse(BaseModel):
    id: int
    job_id: int
    resume_id: int
    resume_score: float
    interview_score: float
    coding_score: float
    overall_score: float
    strengths: List[str]
    weaknesses: List[str]
    risks: List[str]
    positive_observations: List[str]
    improvement_suggestions: List[str]
    recommended_roles: List[str]
    salary_readiness: str
    hiring_recommendation: str
    confidence_level: str
    created_at: datetime
    class Config:
        from_attributes = True

class RoadmapTaskResponse(BaseModel):
    id: int
    title: str
    resource_link: str
    resource_type: str
    is_completed: bool
    class Config:
        from_attributes = True

class RoadmapWeekResponse(BaseModel):
    id: int
    week_number: int
    topics: str
    mini_project: str
    progress: float
    tasks: List[RoadmapTaskResponse] = []
    class Config:
        from_attributes = True

class LearningRoadmapResponse(BaseModel):
    id: int
    user_id: int
    report_id: int
    overall_progress: float
    target_role: Optional[str] = None
    created_at: datetime
    weeks: List[RoadmapWeekResponse] = []
    class Config:
        from_attributes = True

class CandidateProfileResponse(BaseModel):
    id: int
    user_id: int
    github_url: Optional[str]
    linkedin_url: Optional[str]
    portfolio_url: Optional[str]
    xp: int
    streak_days: int
    class Config:
        from_attributes = True

class JobPostingCreate(BaseModel):
    title: str
    department: str
    location: str
    employment_type: Optional[str] = None
    salary_range: Optional[str] = None
    description: str
    required_skills: List[str]
    experience: str
    openings: int
    status: str = "active"

class JobPostingResponse(JobPostingCreate):
    id: int
    recruiter_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class JobApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    resume_id: int
    status: str
    applied_at: datetime
    class Config:
        from_attributes = True

class CandidateDetailResponse(BaseModel):
    application: JobApplicationResponse
    profile: CandidateProfileResponse
    resume_score: float
    interview_score: float
    coding_score: float
    overall_readiness: float
    skill_match: float
    hiring_recommendation: str
    name: str
    email: str
    class Config:
        from_attributes = True

class ScheduledInterviewCreate(BaseModel):
    candidate_id: int
    application_id: int
    interview_type: str
    meeting_mode: str
    meeting_link: Optional[str] = None
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    timezone: str
    notes: Optional[str] = None

class ScheduledInterviewResponse(ScheduledInterviewCreate):
    id: int
    recruiter_id: Optional[int] = None
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class InterviewNotificationResponse(BaseModel):
    id: int
    interview_id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

class CopilotMessageCreate(BaseModel):
    content: str
    role: str = "user"

class CopilotMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    class Config:
        from_attributes = True

class CopilotChatResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    messages: List[CopilotMessageResponse] = []
    class Config:
        from_attributes = True
