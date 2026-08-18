from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.shared.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(Integer, ForeignKey("course_registrations.id"), nullable=True)
    order_id = Column(String(255), unique=True, index=True, nullable=False)
    payment_id = Column(String(255), index=True, nullable=True)
    signature = Column(String(255), nullable=True)
    amount_inr = Column(Integer, nullable=False)
    status = Column(String(50), default="created")
    student_email = Column(String(255), index=True, nullable=False)
    raw_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    registration = relationship("CourseRegistration", back_populates="payments")
