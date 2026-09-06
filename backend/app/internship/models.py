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


class InternshipSubmission(Base):
    __tablename__ = "internship_submissions"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, index=True, nullable=True)
    student_email = Column(String(255), index=True, nullable=False)
    task_key = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    project_topic = Column(String(255), nullable=True)
    github_url = Column(String(500), nullable=True)
    live_url = Column(String(500), nullable=True)
    documentation_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    tools_used = Column(JSON, nullable=False, default=[])
    is_unlocked = Column(Integer, default=0)  # 0 or 1 / boolean
    status = Column(String(50), default="submitted")  # submitted, approved, changes_requested
    admin_feedback = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TaskUnlockRequest(Base):
    __tablename__ = "task_unlock_requests"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, index=True, nullable=True)
    student_email = Column(String(255), index=True, nullable=False)
    student_name = Column(String(255), nullable=False)
    task_key = Column(String(100), nullable=False)
    task_title = Column(String(255), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="pending")  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class StudentDoubt(Base):
    __tablename__ = "student_doubts"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, index=True, nullable=True)
    student_email = Column(String(255), index=True, nullable=False)
    student_name = Column(String(255), nullable=False)
    domain_track = Column(String(255), nullable=False)
    module_name = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    question = Column(Text, nullable=False)
    code_snippet = Column(Text, nullable=True)
    status = Column(String(50), default="open")  # open, answered
    admin_reply = Column(Text, nullable=True)
    answered_by = Column(String(255), nullable=True)
    answered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

