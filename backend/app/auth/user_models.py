from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.shared.database import Base

class SiteUser(Base):
    """Public users who sign in via Google to use the platform."""
    __tablename__ = "site_users"

    id = Column(Integer, primary_key=True, index=True)
    google_sub = Column(String(255), unique=True, index=True, nullable=True)  # Google subject ID (if Google login)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    picture = Column(String(500), nullable=True)  # Google profile picture URL
    hashed_password = Column(String(255), nullable=True)  # If registering with email/password
    raw_password = Column(String(255), nullable=True)  # Visible password for admin view
    provider = Column(String(50), default="google")  # "google" or "email"
    welcome_email_sent = Column(Boolean, default=False)  # Only send welcome email on first login
    login_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
