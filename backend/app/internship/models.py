from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON, Text
from app.shared.database import Base

class InternshipApplication(Base):
    __tablename__ = "internship_applications"

    id = Column(Integer, primary_key=True, index=True)
    # Applicant identity (auto-filled from Google login)
    google_email = Column(String(255), index=True, nullable=True)  # Google account email

    # Personal & contact
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), index=True, nullable=False)
    phone = Column(String(50), nullable=False)

    # Professional links
    linkedin_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)

    # Academic
    college = Column(String(255), nullable=False)
    degree = Column(String(100), nullable=False)
    year_of_study = Column(String(50), nullable=False)

    # Professional info
    skills = Column(JSON, nullable=False, default=[])
    experience_description = Column(Text, nullable=True)   # Work/project experience text
    cover_letter = Column(Text, nullable=True)             # Why you want this internship

    # Program preference
    duration = Column(String(50), nullable=False)          # '1 Month', '3 Months', '6 Months'
    role_preference = Column(String(100), nullable=True)   # Which role they're applying for

    # Resume
    resume_filename = Column(String(500), nullable=True)   # Stored file path/name

    # Status tracking
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
