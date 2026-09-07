import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.shared.database import get_db
from app.shared.contact_models import ContactQuery
from app.shared.email_service import send_contact_received_admin_alert

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Contact Queries"])

class ContactCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str

@router.post("/contact")
def submit_contact_query(
    body: ContactCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Public endpoint for candidates, students, or partners to submit contact inquiries.
    Saves the query immediately in database and dispatches admin notification.
    """
    if not body.name.strip() or not body.email.strip() or not body.message.strip():
        raise HTTPException(status_code=400, detail="Name, email, and message are required.")

    query = ContactQuery(
        name=body.name.strip(),
        email=body.email.strip().lower(),
        subject=body.subject.strip() or "General Inquiry",
        message=body.message.strip(),
        status="new",
        created_at=datetime.utcnow()
    )
    db.add(query)
    db.commit()
    db.refresh(query)

    # Dispatched to admin inbox in background
    background_tasks.add_task(
        send_contact_received_admin_alert,
        query.name,
        query.email,
        query.subject,
        query.message
    )

    return {
        "success": True,
        "message": "Thank you for reaching out! Your query has been logged and our team will get back to you within 24 hours.",
        "id": query.id
    }
