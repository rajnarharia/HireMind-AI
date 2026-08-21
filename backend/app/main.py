from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .api import auth, resume, interview, coding, report, roadmap, profile, recruiter, schedule, copilot, candidate, analytics, notifications

from .core.exceptions import global_exception_handler
from .core.logger import logger

# Create DB tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="HireMind AI Backend API", version="2.0.0")

app.add_exception_handler(Exception, global_exception_handler)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "HireMind AI API is running natively."}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(candidate.router, prefix="/api/candidate", tags=["candidate"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
app.include_router(coding.router, prefix="/api/coding", tags=["coding"])
app.include_router(report.router, prefix="/api/report", tags=["report"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["roadmap"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(recruiter.router, prefix="/api/recruiter", tags=["recruiter"])
app.include_router(schedule.router, prefix="/api/schedule", tags=["schedule"])
app.include_router(copilot.router, prefix="/api/copilot", tags=["copilot"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])