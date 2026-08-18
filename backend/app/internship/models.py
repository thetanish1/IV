from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.shared.database import Base

class InternshipApplication(Base):
    __tablename__ = "internship_applications"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), index=True, nullable=False)
    phone = Column(String(50), nullable=False)
    college = Column(String(255), nullable=False)
    degree = Column(String(100), nullable=False)
    year_of_study = Column(String(50), nullable=False)
    skills = Column(JSON, nullable=False, default=[])
    duration = Column(String(50), nullable=False) # '1 Month', '3 Months', '6 Months'
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
