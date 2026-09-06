from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.shared.database import Base

class SentEmail(Base):
    __tablename__ = "sent_emails"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(100), index=True, nullable=True)
    to_email = Column(String(255), nullable=False, index=True)
    recipient_name = Column(String(255), nullable=True)
    subject = Column(String(500), nullable=False)
    heading = Column(String(500), nullable=True)
    brand_name = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False)  # "success", "failed"
    error_message = Column(Text, nullable=True)
    message_id = Column(String(255), nullable=True)
    attachment_names = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
