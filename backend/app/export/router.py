from typing import Optional
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.shared.dependencies import get_current_admin
from app.auth.models import Admin
from app.internship.models import InternshipApplication
from app.payments.models import Payment
from app.export.excel import excel_service

router = APIRouter(prefix="/admin/export", tags=["Excel Export"])

@router.get("/applications")
def export_applications_excel(
    q: Optional[str] = None,
    duration: Optional[str] = None,
    status: Optional[str] = None,
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

    applications = query.order_by(InternshipApplication.created_at.desc()).all()
    excel_bytes = excel_service.generate_applications_excel(applications)

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=internvision_applications.xlsx"
        }
    )

@router.get("/payments")
def export_payments_excel(
    q: Optional[str] = None,
    status: Optional[str] = None,
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

    payments = query.order_by(Payment.created_at.desc()).all()
    excel_bytes = excel_service.generate_payments_excel(payments)

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=internvision_payments.xlsx"
        }
    )
