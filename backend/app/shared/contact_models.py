from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.shared.database import Base

class ContactQuery(Base):
    __tablename__ = "contact_queries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), index=True, nullable=False)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="new", index=True)  # new, read, replied
    admin_reply = Column(Text, nullable=True)
    replied_by = Column(String(255), nullable=True)
    replied_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
