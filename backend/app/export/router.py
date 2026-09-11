from typing import Optional
from fastapi import APIRouter, Depends, Response, Header, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.shared.database import get_db
from app.shared.security import decode_access_token
from app.auth.models import Admin
from app.internship.models import InternshipApplication
from app.payments.models import Payment
from app.export.excel import excel_service

router = APIRouter(prefix="/admin/export", tags=["Excel Export"])

def get_admin_for_export(
    token: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Admin:
    raw_token = None
    if authorization and authorization.startswith("Bearer "):
        raw_token = authorization.replace("Bearer ", "").strip()
    elif token:
        raw_token = token.strip()
        
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required for data export"
        )
        
    payload = decode_access_token(raw_token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )
        
    sub_clean = str(payload["sub"]).strip().lower()
    admin = db.query(Admin).filter(func.lower(Admin.email) == sub_clean, Admin.is_active == True).first()
    
    if not admin:
        # Fallback for known super admin emails if needed
        KNOWN_SUPER_ADMIN_EMAILS = [
            "pathadesuraj75@gmail.com",
            "admin@internvisiontech.me",
            "admin@internvision.tech",
            "tanishdewase222@gmail.com",
            "internvisiontechhr@gmail.com",
            "hr@internvisiontech.me",
            "support@internvisiontech.me",
            "info@internvisiontech.me",
            "billing@internvisiontech.me",
            "contact@internvisiontech.me"
        ]
        if sub_clean in KNOWN_SUPER_ADMIN_EMAILS:
            admin = db.query(Admin).filter(func.lower(Admin.email) == sub_clean).first()
            if admin:
                return admin
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permissions required to export data"
        )
    return admin

@router.get("/applications")
def export_applications_excel(
    q: Optional[str] = None,
    duration: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_admin_for_export)
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
            "Content-Disposition": "attachment; filename=internvision_internship_applications.xlsx"
        }
    )

@router.get("/payments")
def export_payments_excel(
    q: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_admin_for_export)
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
