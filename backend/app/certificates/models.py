from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from app.shared.database import Base

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    certificate_id = Column(String(64), unique=True, index=True, nullable=False)
    student_name = Column(String(128), nullable=False)
    student_email = Column(String(128), nullable=False)
    program_title = Column(String(255), nullable=False)
    track_type = Column(String(64), default="Internship")  # "Internship" or "Bootcamp"
    duration = Column(String(64), nullable=False)          # e.g., "3 Months", "8 Weeks"
    issue_date = Column(String(64), nullable=False)        # e.g., "August 15, 2026"
    grade = Column(String(64), default="Excellence")       # e.g., "Distinction", "Grade A+"
    skills_acquired = Column(JSON, default=list)           # list of strings
    instructor_name = Column(String(128), default="InternVision Tech Academic Council")
    credential_url = Column(String(255), nullable=True)
    is_valid = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
