from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.shared.database import get_db
from app.shared.exceptions import NotFoundException, BadRequestException
from app.shared.dependencies import get_current_admin
from app.auth.models import Admin
from app.certificates.models import Certificate
from app.certificates.schemas import CertificateVerifyResponse, CertificateCreate

router = APIRouter(prefix="/certificates", tags=["Certificates"])

@router.get("/verify/{cert_id}", response_model=CertificateVerifyResponse)
def verify_certificate(cert_id: str, db: Session = Depends(get_db)):
    """
    Public Endpoint: Verify authenticity of an InternVision Tech certificate.
    Supports case-insensitive search and trimmed formatting.
    """
    clean_id = cert_id.strip().upper()
    
    # Try exact match or case-insensitive match
    cert = db.query(Certificate).filter(
        func.upper(Certificate.certificate_id) == clean_id,
        Certificate.is_valid == True
    ).first()

    if not cert:
        # Also try matching without hyphens or spaces
        normalized_target = clean_id.replace("-", "").replace(" ", "")
        all_certs = db.query(Certificate).filter(Certificate.is_valid == True).all()
        for c in all_certs:
            if c.certificate_id.upper().replace("-", "").replace(" ", "") == normalized_target:
                cert = c
                break

    if not cert:
        raise NotFoundException(f"Certificate with ID '{cert_id}' was not found or is no longer active.")

    return cert

@router.get("", response_model=list[CertificateVerifyResponse])
def list_certificates(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin Endpoint: List all issued certificates.
    """
    query = db.query(Certificate)
    if search:
        query = query.filter(
            Certificate.certificate_id.ilike(f"%{search}%") |
            Certificate.student_name.ilike(f"%{search}%") |
            Certificate.student_email.ilike(f"%{search}%")
        )
    return query.order_by(Certificate.id.desc()).all()

@router.post("", response_model=CertificateVerifyResponse, status_code=status.HTTP_201_CREATED)
def issue_certificate(
    cert_in: CertificateCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin Endpoint: Issue a new certificate.
    """
    existing = db.query(Certificate).filter(
        func.upper(Certificate.certificate_id) == cert_in.certificate_id.strip().upper()
    ).first()
    if existing:
        raise BadRequestException(f"Certificate ID '{cert_in.certificate_id}' already exists.")

    new_cert = Certificate(
        certificate_id=cert_in.certificate_id.strip().upper(),
        student_name=cert_in.student_name.strip(),
        student_email=cert_in.student_email.strip().lower(),
        program_title=cert_in.program_title.strip(),
        track_type=cert_in.track_type,
        duration=cert_in.duration.strip(),
        issue_date=cert_in.issue_date.strip(),
        grade=cert_in.grade.strip(),
        skills_acquired=cert_in.skills_acquired,
        instructor_name=cert_in.instructor_name or "Suraj Kumar, HR & Manager",
        is_valid=True
    )
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    return new_cert

@router.delete("/{cert_id}", status_code=status.HTTP_200_OK)
def delete_certificate(
    cert_id: str,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin Endpoint: Delete/Revoke a certificate by certificate_id or database id.
    """
    cert = None
    if cert_id.isdigit():
        cert = db.query(Certificate).filter(Certificate.id == int(cert_id)).first()
    if not cert:
        cert = db.query(Certificate).filter(func.upper(Certificate.certificate_id) == cert_id.strip().upper()).first()

    if not cert:
        raise NotFoundException(f"Certificate '{cert_id}' not found.")

    db.delete(cert)
    db.commit()
    return {"success": True, "message": f"Certificate '{cert.certificate_id}' successfully deleted."}
