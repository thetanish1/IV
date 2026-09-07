from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from app.shared.database import Base

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String(50), default="super_admin")  # "super_admin", "internship_manager", "technical_mentor", "course_coordinator", "support_desk", "custom"
    permissions = Column(JSON, default=list)  # ["overview", "applications", "submissions", "unlocks", "doubts", "users", "enrollments", "payments", "certificates", "contacts", "mailer", "settings"]
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

