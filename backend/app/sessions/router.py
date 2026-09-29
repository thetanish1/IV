import os
import re
import uuid
import logging
from datetime import datetime
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.shared.database import get_db
from app.shared.exceptions import NotFoundException, BadRequestException
from app.shared.dependencies import get_current_admin
from app.auth.models import Admin
from app.sessions.models import LiveSession, SessionBooking
from app.sessions.schemas import (
    SessionCreate,
    SessionUpdate,
    SessionResponse,
    SessionBookingCreate,
    SessionBookingResponse,
)
from app.shared.email_service import _send_smtp_email
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sessions", tags=["Live Sessions"])

# Local directory to store uploaded session thumbnails
SESSION_IMG_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "sessions")
os.makedirs(SESSION_IMG_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
}

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

def generate_ticket_code() -> str:
    return f"IVT-SES-{uuid.uuid4().hex[:6].upper()}"

# ─── Public Endpoints ─────────────────────────────────────────────────────────

@router.get("", response_model=List[SessionResponse])
def get_sessions(
    search: Optional[str] = None,
    category: Optional[str] = None,
    price_type: Optional[str] = None,  # "all", "free", "paid"
    db: Session = Depends(get_db)
):
    """
    Get all published live sessions.
    Supports filtering by search query, category, and free/paid type.
    """
    query = db.query(LiveSession).filter(LiveSession.is_published == True)
    
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            LiveSession.title.ilike(search_fmt) | 
            LiveSession.description.ilike(search_fmt) |
            LiveSession.instructor_name.ilike(search_fmt)
        )
    
    if category and category.lower() != "all":
        query = query.filter(LiveSession.category.ilike(f"%{category.strip()}%"))
        
    if price_type:
        if price_type.lower() == "free":
            query = query.filter(LiveSession.is_free == True)
        elif price_type.lower() == "paid":
            query = query.filter(LiveSession.is_free == False)
            
    sessions = query.order_by(desc(LiveSession.id)).all()
    
    result = []
    for s in sessions:
        b_count = db.query(SessionBooking).filter(SessionBooking.session_id == s.id).count()
        item = SessionResponse.model_validate(s)
        item.booking_count = b_count
        result.append(item)
        
    return result


@router.get("/detail/{identifier}", response_model=SessionResponse)
@router.get("/{identifier}", response_model=SessionResponse)
def get_session_by_identifier(identifier: str, db: Session = Depends(get_db)):
    """
    Get single session details by ID or Slug (for public sharable session landing page).
    """
    session = None
    if identifier.isdigit():
        session = db.query(LiveSession).filter(LiveSession.id == int(identifier)).first()
    if not session:
        session = db.query(LiveSession).filter(LiveSession.slug == identifier).first()
        
    if not session:
        raise NotFoundException(f"Session '{identifier}' not found")
        
    b_count = db.query(SessionBooking).filter(SessionBooking.session_id == session.id).count()
    resp = SessionResponse.model_validate(session)
    resp.booking_count = b_count
    return resp


@router.post("/book", status_code=status.HTTP_201_CREATED)
def book_session(
    req: SessionBookingCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Register / Book a seat for a session.
    Checks duplicate booking and issues an instantaneous confirmation pass/ticket.
    """
    # 1. Locate session
    session = None
    if req.session_id:
        session = db.query(LiveSession).filter(LiveSession.id == req.session_id).first()
    if not session and req.session_slug:
        session = db.query(LiveSession).filter(LiveSession.slug == req.session_slug).first()
        
    if not session:
        raise NotFoundException("Specified session could not be found")
        
    email_clean = req.student_email.strip().lower()
    name_clean = req.student_name.strip()
    phone_clean = req.student_phone.strip()
    college_clean = (req.college_or_company or "").strip()
    
    # 2. Check if already booked
    existing = db.query(SessionBooking).filter(
        SessionBooking.session_id == session.id,
        SessionBooking.student_email == email_clean
    ).first()
    
    if existing:
        return {
            "success": True,
            "is_already_booked": True,
            "message": f"You are already registered for '{session.title}'!",
            "ticket_code": existing.ticket_code,
            "session_title": session.title,
            "session_date": session.session_date,
            "session_time": session.session_time,
            "duration": session.duration,
            "meeting_platform": session.meeting_platform,
            "meeting_link": session.meeting_link or "Link will be shared via email before session",
            "student_name": existing.student_name,
            "student_email": existing.student_email,
        }
        
    # 3. Create new booking
    ticket_code = generate_ticket_code()
    amount = 0.0 if session.is_free else float(session.price_inr or 0)
    payment_id = f"pay_sess_{uuid.uuid4().hex[:8]}" if not session.is_free else "FREE_PASS"
    
    booking = SessionBooking(
        session_id=session.id,
        student_name=name_clean,
        student_email=email_clean,
        student_phone=phone_clean,
        college_or_company=college_clean,
        status="confirmed",
        ticket_code=ticket_code,
        payment_id=payment_id,
        amount_paid=amount
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    # 4. Dispatch email in background
    def send_confirmation_email_task(to_email: str, student_name: str, session_obj: LiveSession, code: str):
        try:
            subject = f"🎟️ Pass Confirmed: {session_obj.title} - InternVision Tech"
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #f3f4f6; border-radius: 12px; overflow: hidden; border: 1px solid #1f2937;">
                <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">InternVision Tech</h1>
                    <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">Live Masterclass & Workshop Ticket</p>
                </div>
                <div style="padding: 24px;">
                    <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Seat Confirmed for {student_name}! 🎉</h2>
                    <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
                        You have successfully registered for the upcoming live masterclass session. Here are your event access details:
                    </p>
                    
                    <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 18px; margin: 20px 0;">
                        <p style="margin: 6px 0; font-size: 15px;"><strong>📌 Session:</strong> {session_obj.title}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>📅 Date:</strong> {session_obj.session_date}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>⏰ Time:</strong> {session_obj.session_time}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>⏳ Duration:</strong> {session_obj.duration}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>🌐 Platform:</strong> {session_obj.meeting_platform or 'Google Meet'}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>🎫 Ticket Code:</strong> <span style="background: #2563eb; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-weight: bold;">{code}</span></p>
                    </div>
                    
                    {f'<p style="background: rgba(37, 99, 235, 0.1); border-left: 4px solid #3b82f6; padding: 12px; font-size: 13px; color: #93c5fd;"><strong>Meeting Link:</strong> <a href="{session_obj.meeting_link}" style="color: #60a5fa;" target="_blank">{session_obj.meeting_link}</a></p>' if session_obj.meeting_link else '<p style="color: #9ca3af; font-size: 13px;"><em>The direct meeting join link will be sent to your email 1 hour prior to the session start time.</em></p>'}
                    
                    <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin-top: 24px;">
                        Make sure to add this to your calendar and join 5 minutes before time. We look forward to seeing you there!
                    </p>
                </div>
                <div style="background: #030712; padding: 16px; text-align: center; border-top: 1px solid #1f2937; font-size: 12px; color: #6b7280;">
                    © {datetime.utcnow().year} InternVision Tech. All rights reserved.
                </div>
            </div>
            """
            _send_smtp_email(to_email, subject, html_content)
        except Exception as e:
            logger.error(f"Failed to send session confirmation email: {e}")
            
    background_tasks.add_task(
        send_confirmation_email_task,
        email_clean,
        name_clean,
        session,
        ticket_code
    )
    
    return {
        "success": True,
        "is_already_booked": False,
        "message": f"Successfully registered for '{session.title}'!",
        "booking_id": booking.id,
        "ticket_code": ticket_code,
        "session_title": session.title,
        "session_date": session.session_date,
        "session_time": session.session_time,
        "duration": session.duration,
        "meeting_platform": session.meeting_platform,
        "meeting_link": session.meeting_link or "Will be emailed before session starts",
        "student_name": name_clean,
        "student_email": email_clean,
    }


# ─── Admin Endpoints ─────────────────────────────────────────────────────────

@router.post("/upload-thumbnail")
async def upload_session_thumbnail(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Upload a session thumbnail image.
    Saves to local /uploads/sessions or Cloudinary if configured, returning public accessible URL.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise BadRequestException(f"Unsupported file type: {file.content_type}. Please upload PNG, JPG, WEBP or GIF.")
        
    ext = os.path.splitext(file.filename or "")[1] or ".png"
    unique_filename = f"session_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = os.path.join(SESSION_IMG_DIR, unique_filename)
    
    contents = await file.read()
    with open(dest_path, "wb") as f:
        f.write(contents)
        
    # Check if Cloudinary is configured for cloud backup
    try:
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
            import cloudinary
            import cloudinary.uploader
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
                secure=True
            )
            res = cloudinary.uploader.upload(dest_path, folder="internvision/sessions")
            if res and "secure_url" in res:
                return {"success": True, "url": res["secure_url"]}
    except Exception as e:
        logger.warning(f"Cloudinary upload skipped, fallback to local URL: {e}")
        
    # Local relative path that frontend apiRequest / getImageUrl can resolve
    return {"success": True, "url": f"/uploads/sessions/{unique_filename}"}


@router.get("/thumbnail/{filename}")
def get_session_thumbnail(filename: str):
    """
    Serve uploaded session thumbnail images.
    """
    file_path = os.path.join(SESSION_IMG_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Thumbnail image not found")
    return FileResponse(file_path)


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    data: SessionCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin: Create a new live session.
    """
    slug = (data.slug or "").strip()
    if not slug:
        slug = slugify(data.title)
        
    # Ensure unique slug
    base_slug = slug
    counter = 1
    while db.query(LiveSession).filter(LiveSession.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
        
    session_data = data.model_dump()
    session_data["slug"] = slug
    
    new_session = LiveSession(**session_data)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    resp = SessionResponse.model_validate(new_session)
    resp.booking_count = 0
    return resp


@router.put("/{session_id}", response_model=SessionResponse)
def update_session(
    session_id: int,
    data: SessionUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin: Update an existing live session.
    """
    session = db.query(LiveSession).filter(LiveSession.id == session_id).first()
    if not session:
        raise NotFoundException(f"Session with ID {session_id} not found")
        
    update_dict = data.model_dump(exclude_unset=True)
    
    # If slug is being updated, ensure uniqueness
    if "slug" in update_dict and update_dict["slug"] and update_dict["slug"] != session.slug:
        existing = db.query(LiveSession).filter(
            LiveSession.slug == update_dict["slug"],
            LiveSession.id != session.id
        ).first()
        if existing:
            raise BadRequestException(f"Slug '{update_dict['slug']}' is already in use")
            
    for k, v in update_dict.items():
        setattr(session, k, v)
        
    session.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(session)
    
    b_count = db.query(SessionBooking).filter(SessionBooking.session_id == session.id).count()
    resp = SessionResponse.model_validate(session)
    resp.booking_count = b_count
    return resp


@router.delete("/{session_id}", status_code=status.HTTP_200_OK)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin: Delete a session and its associated bookings.
    """
    session = db.query(LiveSession).filter(LiveSession.id == session_id).first()
    if not session:
        raise NotFoundException(f"Session with ID {session_id} not found")
        
    db.delete(session)
    db.commit()
    return {"success": True, "message": f"Session '{session.title}' deleted successfully"}


@router.get("/admin/all", response_model=List[SessionResponse])
def get_all_sessions_admin(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin: List all sessions (including drafts/unpublished) with booking metrics.
    """
    sessions = db.query(LiveSession).order_by(desc(LiveSession.id)).all()
    result = []
    for s in sessions:
        b_count = db.query(SessionBooking).filter(SessionBooking.session_id == s.id).count()
        item = SessionResponse.model_validate(s)
        item.booking_count = b_count
        result.append(item)
    return result


@router.get("/admin/bookings", response_model=List[SessionBookingResponse])
def get_all_bookings_admin(
    session_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin: List all attendee bookings across sessions with search & session filter.
    """
    query = db.query(SessionBooking).join(LiveSession, SessionBooking.session_id == LiveSession.id)
    
    if session_id:
        query = query.filter(SessionBooking.session_id == session_id)
        
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            SessionBooking.student_name.ilike(search_fmt) |
            SessionBooking.student_email.ilike(search_fmt) |
            SessionBooking.student_phone.ilike(search_fmt) |
            SessionBooking.ticket_code.ilike(search_fmt) |
            LiveSession.title.ilike(search_fmt)
        )
        
    bookings = query.order_by(desc(SessionBooking.id)).all()
    
    result = []
    for b in bookings:
        item = SessionBookingResponse(
            id=b.id,
            session_id=b.session_id,
            student_name=b.student_name,
            student_email=b.student_email,
            student_phone=b.student_phone,
            college_or_company=b.college_or_company,
            status=b.status,
            ticket_code=b.ticket_code,
            payment_id=b.payment_id,
            amount_paid=b.amount_paid,
            created_at=b.created_at,
            session_title=b.session.title if b.session else "Unknown Session",
            session_date=b.session.session_date if b.session else "",
            session_time=b.session.session_time if b.session else "",
            duration=b.session.duration if b.session else "",
            meeting_platform=b.session.meeting_platform if b.session else "Google Meet",
        )
        result.append(item)
        
    return result


@router.delete("/admin/bookings/{booking_id}", status_code=status.HTTP_200_OK)
def delete_booking_admin(
    booking_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin: Remove an attendee booking.
    """
    booking = db.query(SessionBooking).filter(SessionBooking.id == booking_id).first()
    if not booking:
        raise NotFoundException("Booking record not found")
        
    db.delete(booking)
    db.commit()
    return {"success": True, "message": "Booking removed successfully"}
