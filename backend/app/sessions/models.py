from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.shared.database import Base

class LiveSession(Base):
    __tablename__ = "live_sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    key_takeaways = Column(JSON, default=list)  # List of bullet points / takeaways
    
    session_date = Column(String(100), nullable=False)  # e.g., "2026-10-25" or "Oct 25, 2026"
    session_time = Column(String(100), nullable=False)  # e.g., "06:00 PM IST"
    duration = Column(String(100), nullable=False)      # e.g., "90 Mins" or "2 Hours"
    
    is_free = Column(Boolean, default=True)
    price_inr = Column(Integer, default=0)              # 0 if free, e.g. 99, 199 if paid
    
    thumbnail_url = Column(Text, nullable=True)         # Uploaded image path or external URL
    
    instructor_name = Column(String(255), nullable=True, default="InternVision Mentorship Team")
    instructor_role = Column(String(255), nullable=True, default="Senior Technical Mentor")
    instructor_avatar = Column(Text, nullable=True)
    
    meeting_platform = Column(String(100), nullable=True, default="Google Meet")
    meeting_link = Column(Text, nullable=True)
    max_seats = Column(Integer, nullable=True, default=150)
    category = Column(String(100), nullable=True, default="Technical Workshop")
    tags = Column(JSON, default=list)                   # e.g., ["GitHub", "Git", "DevOps"]
    
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bookings = relationship("SessionBooking", back_populates="session", cascade="all, delete-orphan")


class SessionBooking(Base):
    __tablename__ = "session_bookings"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("live_sessions.id", ondelete="CASCADE"), nullable=False)
    student_name = Column(String(255), nullable=False)
    student_email = Column(String(255), index=True, nullable=False)
    student_phone = Column(String(50), nullable=False)
    college_or_company = Column(String(255), nullable=True)
    status = Column(String(50), default="confirmed")     # confirmed, attended, cancelled
    ticket_code = Column(String(100), unique=True, index=True, nullable=False)
    payment_id = Column(String(255), nullable=True)     # For paid sessions
    amount_paid = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    session = relationship("LiveSession", back_populates="bookings")
