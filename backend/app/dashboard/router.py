import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.shared.database import get_db
from app.shared.dependencies import get_current_admin
from app.shared.email_service import send_course_enrollment_acceptance_email
from app.auth.models import Admin
from app.internship.models import InternshipApplication
from app.courses.models import Course, CourseRegistration
from app.payments.models import Payment
from app.dashboard.schemas import DashboardStats
from app.internship.schemas import ApplicationResponse
from app.payments.schemas import PaymentResponse
from app.courses.schemas import RegistrationResponse

from pydantic import BaseModel
from app.auth.user_models import SiteUser

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

class StatusUpdateBody(BaseModel):
    status: str

@router.get("/stats", response_model=DashboardStats)
@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    total_revenue = db.query(func.coalesce(func.sum(Payment.amount_inr), 0))\
                      .filter(Payment.status == "captured").scalar()

    total_apps = db.query(func.count(InternshipApplication.id)).scalar()
    total_regs = db.query(func.count(CourseRegistration.id)).scalar()
    total_pmts = db.query(func.count(Payment.id)).scalar()
    successful_pmts = db.query(func.count(Payment.id)).filter(Payment.status == "captured").scalar()
    pending_apps = db.query(func.count(InternshipApplication.id)).filter(InternshipApplication.status == "pending").scalar()
    total_users = db.query(func.count(SiteUser.id)).scalar()

    return DashboardStats(
        total_revenue_inr=int(total_revenue),
        total_applications=total_apps,
        total_registrations=total_regs,
        total_payments=total_pmts,
        successful_payments=successful_pmts,
        pending_applications=pending_apps,
        total_users=total_users or 0
    )

@router.get("/users")
def get_site_users(
    q: Optional[str] = None,
    provider: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Admin-only endpoint to view registered student/public user accounts."""
    query = db.query(SiteUser)

    if q:
        query = query.filter(
            SiteUser.full_name.ilike(f"%{q}%") |
            SiteUser.email.ilike(f"%{q}%")
        )
    if provider and provider != "all":
        query = query.filter(SiteUser.provider == provider)

    total = query.count()
    users = query.order_by(SiteUser.created_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    # Calculate applications submitted per user
    items = []
    for u in users:
        apps_count = db.query(func.count(InternshipApplication.id))\
                       .filter((InternshipApplication.email == u.email) | (InternshipApplication.google_email == u.email))\
                       .scalar() or 0
        items.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "picture": u.picture,
            "provider": getattr(u, "provider", "google"),
            "password": getattr(u, "raw_password", None) or "—",
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "last_login": u.last_login.isoformat() if u.last_login else None,
            "applications_count": apps_count,
        })

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": items
    }

@router.patch("/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    body: StatusUpdateBody,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    app = db.query(InternshipApplication).filter(InternshipApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = body.status
    db.commit()
    db.refresh(app)
    return ApplicationResponse.model_validate(app).model_dump()

@router.get("/applications")
def get_applications(
    q: Optional[str] = None,
    duration: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    query = db.query(InternshipApplication)

    if q:
        query = query.filter(
            InternshipApplication.full_name.ilike(f"%{q}%") |
            InternshipApplication.email.ilike(f"%{q}%") |
            InternshipApplication.college.ilike(f"%{q}%")
        )
    if duration and duration != "all":
        query = query.filter(InternshipApplication.duration == duration)
    if status and status != "all":
        query = query.filter(InternshipApplication.status == status)

    total = query.count()
    items = query.order_by(InternshipApplication.created_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    items_serialized = [ApplicationResponse.model_validate(item).model_dump() for item in items]
    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": items_serialized
    }

@router.patch("/registrations/{registration_id}/status")
def update_registration_status(
    registration_id: int,
    body: StatusUpdateBody,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    reg = db.query(CourseRegistration).filter(CourseRegistration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Course registration not found")
    
    prev_status = reg.status
    reg.status = body.status
    db.commit()
    db.refresh(reg)

    # When admin accepts the enrollment, send official congratulations email
    if body.status.lower() in ("accepted", "approved") and prev_status != "accepted":
        course = db.query(Course).filter(Course.id == reg.course_id).first()
        course_title = course.title if course else "Engineering Bootcamp"
        course_duration = course.duration if course else "8 Weeks"
        
        background_tasks.add_task(
            send_course_enrollment_acceptance_email,
            reg.student_email,
            reg.student_name,
            course_title,
            course_duration
        )

    return {
        "id": reg.id,
        "course_id": reg.course_id,
        "student_name": reg.student_name,
        "student_email": reg.student_email,
        "student_phone": reg.student_phone,
        "status": reg.status,
        "created_at": reg.created_at.isoformat() if reg.created_at else None
    }

@router.get("/registrations")
def get_registrations(
    q: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    query = db.query(CourseRegistration)

    if q:
        query = query.filter(
            CourseRegistration.student_name.ilike(f"%{q}%") |
            CourseRegistration.student_email.ilike(f"%{q}%")
        )
    if status and status != "all":
        query = query.filter(CourseRegistration.status == status)

    total = query.count()
    items = query.order_by(CourseRegistration.created_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    items_serialized = []
    for item in items:
        course = db.query(Course).filter(Course.id == item.course_id).first()
        items_serialized.append({
            "id": item.id,
            "course_id": item.course_id,
            "course_title": course.title if course else f"Course #{item.course_id}",
            "course_slug": course.slug if course else None,
            "student_name": item.student_name,
            "student_email": item.student_email,
            "student_phone": item.student_phone,
            "status": item.status,
            "created_at": item.created_at.isoformat() if item.created_at else None,
        })

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": items_serialized
    }

@router.get("/payments")
def get_payments(
    q: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    query = db.query(Payment)

    if q:
        query = query.filter(
            Payment.order_id.ilike(f"%{q}%") |
            Payment.payment_id.ilike(f"%{q}%") |
            Payment.student_email.ilike(f"%{q}%")
        )
    if status and status != "all":
        query = query.filter(Payment.status == status)

    total = query.count()
    items = query.order_by(Payment.created_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    items_serialized = [PaymentResponse.model_validate(item).model_dump() for item in items]
    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": items_serialized
    }
