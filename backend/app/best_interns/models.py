from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float
from app.shared.database import Base

class BestIntern(Base):
    __tablename__ = "best_interns"

    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String(255), nullable=False)
    student_email = Column(String(255), nullable=True)
    course = Column(String(255), nullable=False)           # Track/Domain e.g. "Full Stack Web Development"
    month_year = Column(String(100), nullable=False)        # e.g. "September 2026", "October 2026"
    award_title = Column(String(255), default="Best Intern of the Month") # e.g. "Star Intern of the Month"
    image_url = Column(Text, nullable=True)                 # Uploaded candidate image path or URL
    college = Column(String(255), nullable=True)            # College / University
    duration = Column(String(100), default="1 Month")       # Duration: 1 Month / 2 Months / 3 Months
    project_name = Column(String(255), nullable=True)       # High-impact project submitted
    project_url = Column(String(500), nullable=True)        # Live Project Demo / Vercel link
    github_url = Column(String(500), nullable=True)         # GitHub Profile or Repo
    linkedin_url = Column(String(500), nullable=True)       # LinkedIn Profile
    achievement_summary = Column(Text, nullable=True)       # Highlights of performance & mentor review
    testimonial = Column(Text, nullable=True)               # Student quote/experience
    grade = Column(String(50), default="Distinction (A+)")  # Grade/Performance level
    rating = Column(Float, default=5.0)                     # 5-star rating
    is_featured = Column(Boolean, default=False)            # Featured on homepage spotlight
    is_published = Column(Boolean, default=True)            # Published visibility
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
