from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from .. import models
from ..database import get_db
from .auth import get_current_user

router = APIRouter()

class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    projects: Optional[str] = None
    certificates: Optional[str] = None
    avatar_url: Optional[str] = None

@router.get("/profile")
def get_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = db.query(models.CandidateProfile).filter(
        models.CandidateProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        profile = models.CandidateProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "bio": profile.bio if hasattr(profile, 'bio') else "",
        "github_url": profile.github_url or "",
        "linkedin_url": profile.linkedin_url or "",
        "portfolio_url": profile.portfolio_url or "",
        "skills": profile.skills or "",
        "experience": profile.experience or "",
        "education": profile.education or "",
        "projects": profile.projects or "",
        "certificates": profile.certificates or "",
        "avatar_url": profile.avatar_url or "",
        "xp": profile.xp,
        "streak_days": profile.streak_days
    }

@router.put("/profile")
def update_profile(
    profile_update: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    profile = db.query(models.CandidateProfile).filter(
        models.CandidateProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        profile = models.CandidateProfile(user_id=current_user.id)
        db.add(profile)
    
    if profile_update.github_url is not None: profile.github_url = profile_update.github_url
    if profile_update.linkedin_url is not None: profile.linkedin_url = profile_update.linkedin_url
    if profile_update.portfolio_url is not None: profile.portfolio_url = profile_update.portfolio_url
    if profile_update.bio is not None and hasattr(profile, 'bio'): profile.bio = profile_update.bio
    if profile_update.skills is not None: profile.skills = profile_update.skills
    if profile_update.experience is not None: profile.experience = profile_update.experience
    if profile_update.education is not None: profile.education = profile_update.education
    if profile_update.projects is not None: profile.projects = profile_update.projects
    if profile_update.certificates is not None: profile.certificates = profile_update.certificates
    if profile_update.avatar_url is not None: profile.avatar_url = profile_update.avatar_url

    db.commit()
    return {"status": "success", "message": "Profile updated successfully"}
