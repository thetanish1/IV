import math
from datetime import datetime
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.shared.database import get_db
from app.shared.dependencies import (
    get_current_admin,
    require_permission,
)
from app.shared.email_service import (
    send_course_enrollment_acceptance_email,
    send_course_enrollment_rejection_email,
    send_contact_reply_email,
)
from app.internship.models import InternshipApplication, InternshipSubmission
from app.courses.models import Course, CourseRegistration
from app.payments.models import Payment
from app.auth.user_models import SiteUser
from app.shared.contact_models import ContactQuery
from app.dashboard.schemas import DashboardStats
from app.payments.schemas import PaymentResponse
from app.courses.schemas import RegistrationResponse
from app.auth.models import Admin

router = APIRouter(prefix="/admin", tags=["admin-dashboard"])

@router.get("/me")
def get_admin_profile(current_admin: Admin = Depends(get_current_admin)):
    """Returns authenticated Super Admin profile."""
    return {
        "id": current_admin.id,
        "email": current_admin.email,
        "full_name": current_admin.full_name,
        "role": "super_admin",
        "is_super_admin": True,
        "is_active": True,
        "permissions": [
            "overview", "applications", "submissions", "unlocks", "doubts",
            "users", "enrollments", "payments", "certificates", "contacts",
            "mailer", "settings"
        ],
    }

# ─── 1. Dashboard Overview & Statistics ──────────────────────────────────────

@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Platform KPI metrics and aggregate telemetry overview."""
    total_apps = db.query(InternshipApplication).count()
    pending_apps = db.query(InternshipApplication).filter(InternshipApplication.status == "pending").count()
    total_regs = db.query(CourseRegistration).count()
    
    # Calculate captured revenue
    total_rev = db.query(func.sum(Payment.amount_inr))\
                  .filter(Payment.status.in_(["captured", "success"]))\
                  .scalar() or 0.0

    successful_pmts = db.query(Payment)\
                        .filter(Payment.status.in_(["captured", "success"]))\
                        .count()

    total_pmts = db.query(Payment).count()

    total_users_count = 0
    try:
        total_users_count = db.query(SiteUser).count()
    except Exception:
        pass

    total_contacts_count = 0
    new_contacts_count = 0
    try:
        total_contacts_count = db.query(ContactQuery).count()
        new_contacts_count = db.query(ContactQuery).filter(ContactQuery.status == "pending").count()
    except Exception:
        pass

    return DashboardStats(
        total_applications=total_apps,
        pending_applications=pending_apps,
        total_registrations=total_regs,
        total_revenue_inr=int(total_rev),
        successful_payments=successful_pmts,
        total_payments=total_pmts,
        total_users=total_users_count,
        total_contacts=total_contacts_count,
        new_contacts=new_contacts_count
    )


# ─── 2. Registered Users Management ──────────────────────────────────────────

@router.get("/users")
def get_site_users(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=500),
    q: Optional[str] = None,
    provider: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("users"))
):
    """Admin endpoint to list all registered platform users."""
    try:
        query = db.query(SiteUser)
        if q:
            query = query.filter(
                SiteUser.full_name.ilike(f"%{q}%") |
                SiteUser.email.ilike(f"%{q}%")
            )
        if provider and provider != "all":
            query = query.filter(SiteUser.provider == provider)

        total = query.count()
        total_pages = math.ceil(total / limit) if total > 0 else 1
        items = query.order_by(SiteUser.created_at.desc())\
                     .offset((page - 1) * limit)\
                     .limit(limit)\
                     .all()

        user_items = []
        for u in items:
            has_pwd = bool(getattr(u, "hashed_password", None))
            prov = getattr(u, "provider", None) or ("google" if getattr(u, "google_sub", None) else ("email" if has_pwd else "google"))
            user_items.append({
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name or u.email.split("@")[0],
                "provider": prov,
                "auth_provider": prov,
                "avatar_url": getattr(u, "picture", None),
                "picture": getattr(u, "picture", None),
                "is_active": True,
                "is_password_set": has_pwd,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "role": "student",
            })

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "items": user_items
        }
    except Exception as e:
        logger.error(f"Error fetching registered users: {e}", exc_info=True)
        return {"total": 0, "page": page, "limit": limit, "total_pages": 1, "items": []}


# ─── 3. Course Registrations / Scholarships ──────────────────────────────────

@router.get("/registrations")
def get_registrations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    q: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("enrollments"))
):
    """Admin endpoint to view Bootcamp course registration requests with batched course queries."""
    query = db.query(CourseRegistration)
    if q:
        query = query.filter(
            CourseRegistration.student_name.ilike(f"%{q}%") |
            CourseRegistration.student_email.ilike(f"%{q}%")
        )
    if status and status != "all":
        query = query.filter(CourseRegistration.status == status)

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1
    items = query.order_by(CourseRegistration.created_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    course_ids = list({reg.course_id for reg in items if reg.course_id})
    course_map = {}
    if course_ids:
        courses = db.query(Course).filter(Course.id.in_(course_ids)).all()
        course_map = {c.id: c.title for c in courses}

    items_with_course = []
    for reg in items:
        items_with_course.append({
            "id": reg.id,
            "course_id": reg.course_id,
            "student_name": reg.student_name,
            "student_email": reg.student_email,
            "student_phone": reg.student_phone,
            "status": reg.status,
            "created_at": reg.created_at.isoformat() if reg.created_at else None,
            "course_title": course_map.get(reg.course_id, f"Course #{reg.course_id}"),
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": items_with_course
    }


@router.patch("/registrations/{reg_id}/status")
def update_registration_status(
    reg_id: int,
    background_tasks: BackgroundTasks,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("enrollments"))
):
    """Approve/reject course enrollment and dispatch onboarding email."""
    status_val = payload.get("status")
    if not status_val:
        raise HTTPException(status_code=400, detail="Missing status field")

    reg = db.query(CourseRegistration).filter(CourseRegistration.id == reg_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Course registration not found")

    reg.status = status_val
    reg.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(reg)

    course = db.query(Course).filter(Course.id == reg.course_id).first()
    course_title = course.title if course else f"Bootcamp Program #{reg.course_id}"

    if status_val in ["accepted", "approved"]:
        background_tasks.add_task(
            send_course_enrollment_acceptance_email,
            student_email=reg.student_email,
            student_name=reg.student_name,
            course_title=course_title
        )
    elif status_val == "rejected":
        background_tasks.add_task(
            send_course_enrollment_rejection_email,
            student_email=reg.student_email,
            student_name=reg.student_name,
            course_title=course_title
        )

    return RegistrationResponse.model_validate(reg)


# ─── 4. Payments Auditing ───────────────────────────────────────────────────

@router.get("/payments")
def get_payments(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    q: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("payments"))
):
    """Admin endpoint to audit financial transactions and orders."""
    query = db.query(Payment)
    if q:
        query = query.filter(
            Payment.student_email.ilike(f"%{q}%") |
            Payment.payment_id.ilike(f"%{q}%") |
            Payment.order_id.ilike(f"%{q}%")
        )
    if status and status != "all":
        query = query.filter(Payment.status == status)

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1
    items = query.order_by(Payment.created_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": [PaymentResponse.model_validate(item) for item in items]
    }


# ─── 5. Contact Inquiries & Inbound Messages ────────────────────────────────

@router.get("/contacts")
def get_contact_queries(
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    q: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("contacts"))
):
    """Admin endpoint to list candidate inquiries sent via contact desk."""
    query = db.query(ContactQuery)
    if q:
        query = query.filter(
            ContactQuery.name.ilike(f"%{q}%") |
            ContactQuery.email.ilike(f"%{q}%") |
            ContactQuery.subject.ilike(f"%{q}%") |
            ContactQuery.message.ilike(f"%{q}%")
        )
    if status and status != "all":
        query = query.filter(ContactQuery.status == status)

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1
    items = query.order_by(ContactQuery.created_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": [
            {
                "id": c.id,
                "name": c.name,
                "email": c.email,
                "phone": getattr(c, "phone", None),
                "subject": c.subject,
                "message": c.message,
                "status": c.status,
                "admin_reply": c.admin_reply,
                "replied_by": c.replied_by,
                "replied_at": c.replied_at.isoformat() if c.replied_at else None,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in items
        ]
    }


@router.patch("/contacts/{contact_id}/status")
def update_contact_query_status(
    contact_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("contacts"))
):
    """Update contact inquiry status."""
    status_val = payload.get("status")
    if not status_val:
        raise HTTPException(status_code=400, detail="Status is required")

    contact = db.query(ContactQuery).filter(ContactQuery.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact inquiry not found")

    contact.status = status_val
    contact.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(contact)
    return {"success": True, "status": contact.status}


@router.post("/contacts/{contact_id}/reply")
def reply_contact_query(
    contact_id: int,
    background_tasks: BackgroundTasks,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("contacts"))
):
    """Admin dispatches email reply to contact query."""
    admin_reply = payload.get("admin_reply", "").strip()
    if not admin_reply:
        raise HTTPException(status_code=400, detail="Reply message cannot be empty")

    contact = db.query(ContactQuery).filter(ContactQuery.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact inquiry not found")

    contact.admin_reply = admin_reply
    contact.status = "replied"
    contact.replied_by = current_admin.full_name or current_admin.email
    contact.replied_at = datetime.utcnow()
    contact.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(contact)

    background_tasks.add_task(
        send_contact_reply_email,
        recipient_email=contact.email,
        recipient_name=contact.name,
        subject=contact.subject,
        user_message=contact.message,
        admin_reply=admin_reply,
        replied_by=contact.replied_by
    )

    return {
        "success": True,
        "message": f"Reply dispatched to {contact.email}",
        "contact": {
            "id": contact.id,
            "status": contact.status,
            "admin_reply": contact.admin_reply,
            "replied_by": contact.replied_by,
            "replied_at": contact.replied_at.isoformat() if contact.replied_at else None,
        }
    }


@router.delete("/contacts/all")
def delete_all_contacts(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("contacts"))
):
    """Permanently delete all contact queries."""
    db.query(ContactQuery).delete()
    db.commit()
    return {"success": True, "message": "All contact inquiries have been deleted."}


@router.delete("/contacts/{contact_id}")
def delete_contact_query(
    contact_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("contacts"))
):
    """Permanently delete a specific contact query."""
    contact = db.query(ContactQuery).filter(ContactQuery.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact inquiry not found")

    db.delete(contact)
    db.commit()
    return {"success": True, "message": "Contact inquiry deleted successfully."}


# ─── 6. Additional Full CRUD Operations for Admin Entities ──────────────────

@router.delete("/users/{user_id}")
def delete_site_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("users"))
):
    """Admin endpoint to permanently delete a registered user account."""
    user = db.query(SiteUser).filter(SiteUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
    db.delete(user)
    db.commit()
    return {"success": True, "message": f"User account '{user.email}' has been deleted."}


@router.patch("/users/{user_id}/role")
def update_site_user_role(
    user_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("users"))
):
    """Admin endpoint to update a user's account role."""
    new_role = payload.get("role", "student")
    user = db.query(SiteUser).filter(SiteUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
    user.role = new_role
    db.commit()
    return {"success": True, "message": f"User '{user.email}' role updated to '{new_role}'."}


@router.delete("/registrations/{reg_id}")
def delete_course_registration(
    reg_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("enrollments"))
):
    """Admin endpoint to permanently delete a course enrollment record."""
    # Unlink any related payment records first to satisfy foreign key constraints
    try:
        db.query(Payment).filter(Payment.registration_id == reg_id).update({"registration_id": None})
        db.commit()
    except Exception:
        db.rollback()

    reg = db.query(CourseRegistration).filter(CourseRegistration.id == reg_id).first()
    if not reg:
        return {"success": True, "message": f"Registration record #{reg_id} already deleted or not found."}
    db.delete(reg)
    db.commit()
    return {"success": True, "message": f"Course registration #{reg_id} has been deleted."}


@router.delete("/payments/{payment_id}")
def delete_payment_record(
    payment_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("payments"))
):
    """Admin endpoint to delete/archive a payment transaction record."""
    pmt = db.query(Payment).filter(Payment.id == payment_id).first()
    if not pmt:
        return {"success": True, "message": f"Payment transaction #{payment_id} already deleted or not found."}
    db.delete(pmt)
    db.commit()
    return {"success": True, "message": f"Payment transaction #{payment_id} has been deleted."}

