from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Float
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
    amount = Column(Float, nullable=True, default=0.0)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="created")  # created, pending, captured, success, failed
    gateway_name = Column(String(50), default="cashfree")
    student_email = Column(String(255), index=True, nullable=False)
    raw_response = Column(JSON, nullable=True)
    course_id = Column(String(100), nullable=True)
    student_name = Column(String(255), nullable=True)
    student_phone = Column(String(50), nullable=True)
    
    # Cashfree specific fields
    cf_order_id = Column(String(255), nullable=True)
    cf_payment_id = Column(String(255), nullable=True)
    payment_session_id = Column(String(500), nullable=True)

    # Legacy fields (for database schema backwards-compatibility)
    razorpay_order_id = Column(String(255), nullable=True)
    razorpay_payment_id = Column(String(255), nullable=True)
    razorpay_signature = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    registration = relationship("CourseRegistration", back_populates="payments")
