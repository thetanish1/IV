import math
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.shared.database import get_db
from app.shared.dependencies import get_current_admin
from app.auth.models import Admin
from app.internship.models import InternshipApplication
from app.courses.models import CourseRegistration
from app.payments.models import Payment
from app.dashboard.schemas import DashboardStats
from app.internship.schemas import ApplicationResponse
from app.payments.schemas import PaymentResponse
from app.courses.schemas import RegistrationResponse

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

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

    return DashboardStats(
        total_revenue_inr=int(total_revenue),
        total_applications=total_apps,
        total_registrations=total_regs,
        total_payments=total_pmts,
        successful_payments=successful_pmts,
        pending_applications=pending_apps
    )

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

    items_serialized = [RegistrationResponse.model_validate(item).model_dump() for item in items]
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
