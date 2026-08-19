from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr

class ApplicationCreate(BaseModel):
    # Applicant identity
    google_email: Optional[str] = None

    # Personal
    full_name: str
    email: EmailStr
    phone: str

    # Professional links
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None

    # Academic
    college: str
    degree: str
    year_of_study: str

    # Skills & experience
    skills: list[str]
    experience_description: Optional[str] = None
    cover_letter: Optional[str] = None

    # Internship preferences
    duration: str
    role_preference: Optional[str] = None

    # Resume (filename set after upload)
    resume_filename: Optional[str] = None

class ApplicationResponse(ApplicationCreate):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Site User (Google-authenticated public users) ────────────────────────────

class SiteUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    picture: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
