import math
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.shared.database import get_db
from app.shared.dependencies import get_current_admin
from app.shared.email_service import (
    send_course_enrollment_acceptance_email,
    send_course_enrollment_rejection_email,
    send_internship_acceptance_email,
    send_internship_rejection_email,
    send_submission_reviewed_email,
    send_doubt_answered_email,
    send_contact_reply_email,
)
from app.internship.models import InternshipApplication, InternshipSubmission, TaskUnlockRequest, StudentDoubt
from app.courses.models import Course, CourseRegistration
from app.payments.models import Payment
from app.shared.settings_models import SiteSetting
from app.shared.contact_models import ContactQuery
from app.dashboard.schemas import DashboardStats
from app.internship.schemas import ApplicationResponse
from app.payments.schemas import PaymentResponse
from app.courses.schemas import RegistrationResponse
from app.auth.models import Admin

from pydantic import BaseModel
from app.auth.user_models import SiteUser

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

class SettingsUpdateBody(BaseModel):
    show_courses: Optional[bool] = None
    show_careers: Optional[bool] = None

class SubmissionReviewBody(BaseModel):
    status: Optional[str] = None
    admin_feedback: Optional[str] = None
    is_unlocked: Optional[bool] = None

class UnlockActionBody(BaseModel):
    action: str  # 'approve' or 'reject'

class DoubtReplyBody(BaseModel):
    admin_reply: str

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
    total_contacts = db.query(func.count(ContactQuery.id)).scalar()
    new_contacts = db.query(func.count(ContactQuery.id)).filter(ContactQuery.status == "new").scalar()

    return DashboardStats(
        total_revenue_inr=int(total_revenue),
        total_applications=total_apps,
        total_registrations=total_regs,
        total_payments=total_pmts,
        successful_payments=successful_pmts,
        pending_applications=pending_apps,
        total_users=total_users or 0,
        total_contacts=total_contacts or 0,
        new_contacts=new_contacts or 0
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
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    app = db.query(InternshipApplication).filter(InternshipApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    prev_status = (app.status or "").lower()
    new_status = body.status.strip().lower()
    app.status = body.status
    db.commit()
    db.refresh(app)

    if new_status in ("accepted", "approved") and prev_status != "accepted":
        background_tasks.add_task(
            send_internship_acceptance_email,
            app.email,
            app.full_name,
            app.duration,
            app.role_preference
        )
    elif new_status in ("rejected", "declined") and prev_status != "rejected":
        background_tasks.add_task(
            send_internship_rejection_email,
            app.email,
            app.full_name,
            app.duration,
            app.role_preference
        )

    return ApplicationResponse.model_validate(app).model_dump()

@router.delete("/applications/all")
def delete_all_applications(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Admin endpoint to delete all internship applications and cascading records."""
    count = db.query(InternshipApplication).count()
    db.query(StudentDoubt).delete(synchronize_session=False)
    db.query(TaskUnlockRequest).delete(synchronize_session=False)
    db.query(InternshipSubmission).delete(synchronize_session=False)
    db.query(InternshipApplication).delete(synchronize_session=False)
    db.commit()
    return {
        "success": True,
        "message": f"Successfully deleted all {count} internship applications and related records.",
        "deleted_count": count
    }

@router.delete("/applications/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Admin endpoint to delete a specific internship application and its cascading records."""
    app = db.query(InternshipApplication).filter(InternshipApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    user_email = (app.email or "").strip().lower()
    google_email = (app.google_email or "").strip().lower()

    # Clean up associated submissions, unlock requests, doubts for this application/student
    emails = [e for e in [user_email, google_email] if e]
    if emails:
        db.query(InternshipSubmission).filter(
            (InternshipSubmission.application_id == app.id) | (func.lower(InternshipSubmission.student_email).in_(emails))
        ).delete(synchronize_session=False)
        db.query(TaskUnlockRequest).filter(
            (TaskUnlockRequest.application_id == app.id) | (func.lower(TaskUnlockRequest.student_email).in_(emails))
        ).delete(synchronize_session=False)
        db.query(StudentDoubt).filter(
            (StudentDoubt.application_id == app.id) | (func.lower(StudentDoubt.student_email).in_(emails))
        ).delete(synchronize_session=False)
    else:
        db.query(InternshipSubmission).filter(InternshipSubmission.application_id == app.id).delete(synchronize_session=False)
        db.query(TaskUnlockRequest).filter(TaskUnlockRequest.application_id == app.id).delete(synchronize_session=False)
        db.query(StudentDoubt).filter(StudentDoubt.application_id == app.id).delete(synchronize_session=False)

    db.delete(app)
    db.commit()
    return {"success": True, "message": f"Application #{application_id} for '{app.full_name}' deleted successfully."}


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
    
    prev_status = (reg.status or "").lower()
    new_status = body.status.strip().lower()
    reg.status = body.status
    db.commit()
    db.refresh(reg)

    course = db.query(Course).filter(Course.id == reg.course_id).first()
    course_title = course.title if course else "Engineering Bootcamp"
    course_duration = course.duration if course else "8 Weeks"

    # When admin accepts the enrollment, send official congratulations email
    if new_status in ("accepted", "approved") and prev_status != "accepted":
        background_tasks.add_task(
            send_course_enrollment_acceptance_email,
            reg.student_email,
            reg.student_name,
            course_title,
            course_duration
        )
    elif new_status in ("rejected", "declined") and prev_status != "rejected":
        background_tasks.add_task(
            send_course_enrollment_rejection_email,
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


# ─── Site Feature Toggles (Courses & Careers visibility) ────────────────────

@router.get("/settings")
def get_site_settings(db: Session = Depends(get_db)):
    """Public/Admin endpoint to get display settings for Courses and Careers."""
    rows = db.query(SiteSetting).all()
    settings_dict = {
        "show_courses": False,
        "show_careers": False,
    }
    for r in rows:
        settings_dict[r.key] = r.value.lower() == "true"
    return settings_dict

@router.patch("/settings")
def update_site_settings(
    body: SettingsUpdateBody,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Admin endpoint to toggle display of Courses and Careers on homepage & navbar."""
    if body.show_courses is not None:
        setting = db.query(SiteSetting).filter(SiteSetting.key == "show_courses").first()
        if not setting:
            setting = SiteSetting(key="show_courses", value=str(body.show_courses).lower(), description="Toggle display of Courses section")
            db.add(setting)
        else:
            setting.value = str(body.show_courses).lower()

    if body.show_careers is not None:
        setting = db.query(SiteSetting).filter(SiteSetting.key == "show_careers").first()
        if not setting:
            setting = SiteSetting(key="show_careers", value=str(body.show_careers).lower(), description="Toggle display of Careers link")
            db.add(setting)
        else:
            setting.value = str(body.show_careers).lower()

    db.commit()
    return get_site_settings(db)


# ─── Internship Submissions Management ──────────────────────────────────────

@router.get("/submissions")
def get_student_submissions(
    q: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Admin endpoint to view all student task and project submissions."""
    query = db.query(InternshipSubmission)

    if q:
        query = query.filter(
            InternshipSubmission.student_email.ilike(f"%{q}%") |
            InternshipSubmission.title.ilike(f"%{q}%") |
            InternshipSubmission.task_key.ilike(f"%{q}%")
        )
    if status and status != "all":
        query = query.filter(InternshipSubmission.status == status)

    total = query.count()
    items = query.order_by(InternshipSubmission.submitted_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    items_list = []
    for item in items:
        app = db.query(InternshipApplication).filter(InternshipApplication.email == item.student_email).first()
        items_list.append({
            "id": item.id,
            "application_id": item.application_id,
            "student_email": item.student_email,
            "student_name": app.full_name if app else item.student_email.split("@")[0],
            "role_preference": app.role_preference if app else "—",
            "duration": app.duration if app else "—",
            "task_key": item.task_key,
            "title": item.title,
            "project_topic": item.project_topic,
            "github_url": item.github_url,
            "live_url": item.live_url,
            "documentation_url": item.documentation_url,
            "notes": item.notes,
            "tools_used": item.tools_used or [],
            "is_unlocked": bool(item.is_unlocked),
            "status": item.status,
            "admin_feedback": item.admin_feedback,
            "submitted_at": item.submitted_at.isoformat() if item.submitted_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None,
        })

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": items_list
    }


@router.patch("/submissions/{submission_id}")
def review_student_submission(
    submission_id: int,
    body: SubmissionReviewBody,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Admin reviews student submission (approves, requests changes, sets mentor feedback or unlocks)."""
    sub = db.query(InternshipSubmission).filter(InternshipSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if body.status:
        sub.status = body.status
    if body.admin_feedback is not None:
        sub.admin_feedback = body.admin_feedback
    if body.is_unlocked is not None:
        sub.is_unlocked = bool(body.is_unlocked)
    sub.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(sub)

    # Queue review feedback email to student
    app = db.query(InternshipApplication).filter(InternshipApplication.email == sub.student_email).first()
    st_name = app.full_name if app else sub.student_email.split("@")[0]
    background_tasks.add_task(
        send_submission_reviewed_email,
        sub.student_email,
        st_name,
        sub.title,
        sub.status,
        sub.admin_feedback or ""
    )

    return {"success": True, "message": "Submission updated successfully", "status": sub.status}


# ─── Task Unlock Requests Management ─────────────────────────────────────────

@router.get("/unlock-requests")
def get_unlock_requests(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Admin endpoint to view student unlock requests."""
    query = db.query(TaskUnlockRequest)
    if status and status != "all":
        query = query.filter(TaskUnlockRequest.status == status)

    total = query.count()
    items = query.order_by(TaskUnlockRequest.created_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    items_list = [
        {
            "id": u.id,
            "application_id": u.application_id,
            "student_email": u.student_email,
            "student_name": u.student_name,
            "task_key": u.task_key,
            "task_title": u.task_title,
            "reason": u.reason,
            "status": u.status,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in items
    ]

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": items_list
    }


@router.post("/unlock-requests/{request_id}/action")
def handle_unlock_request(
    request_id: int,
    body: UnlockActionBody,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Admin approves (unlocks) or rejects a task unlock request."""
    req = db.query(TaskUnlockRequest).filter(TaskUnlockRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Unlock request not found")

    if body.action.lower() in ("approve", "approved", "unlock"):
        req.status = "approved"
        # Also ensure submission record is marked unlocked
        sub = db.query(InternshipSubmission)\
                .filter(InternshipSubmission.student_email == req.student_email, InternshipSubmission.task_key == req.task_key)\
                .first()
        if sub:
            sub.is_unlocked = True
        else:
            new_sub = InternshipSubmission(
                application_id=req.application_id,
                student_email=req.student_email,
                task_key=req.task_key,
                title=req.task_title,
                is_unlocked=True,
                status="unlocked"
            )
            db.add(new_sub)
    else:
        req.status = "rejected"

    req.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "message": f"Unlock request {req.status}"}


# ─── Student Doubts & Query Helpdesk ─────────────────────────────────────────

@router.get("/doubts")
def get_student_doubts(
    status: Optional[str] = None,
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Admin endpoint to view all student doubts and questions."""
    query = db.query(StudentDoubt)
    if status and status != "all":
        query = query.filter(StudentDoubt.status == status)
    if q:
        query = query.filter(
            StudentDoubt.student_email.ilike(f"%{q}%") |
            StudentDoubt.student_name.ilike(f"%{q}%") |
            StudentDoubt.subject.ilike(f"%{q}%") |
            StudentDoubt.module_name.ilike(f"%{q}%")
        )

    total = query.count()
    items = query.order_by(StudentDoubt.created_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    items_list = [
        {
            "id": d.id,
            "application_id": d.application_id,
            "student_email": d.student_email,
            "student_name": d.student_name,
            "domain_track": d.domain_track,
            "module_name": d.module_name,
            "subject": d.subject,
            "question": d.question,
            "code_snippet": d.code_snippet,
            "image_url": d.image_url,
            "status": d.status,
            "admin_reply": d.admin_reply,
            "answered_by": d.answered_by,
            "answered_at": d.answered_at.isoformat() if d.answered_at else None,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in items
    ]

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": items_list
    }


@router.post("/doubts/{doubt_id}/reply")
def reply_to_student_doubt(
    doubt_id: int,
    body: DoubtReplyBody,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Admin writes a technical reply to a student doubt."""
    doubt = db.query(StudentDoubt).filter(StudentDoubt.id == doubt_id).first()
    if not doubt:
        raise HTTPException(status_code=404, detail="Doubt not found")

    doubt.admin_reply = body.admin_reply.strip()
    doubt.answered_by = current_admin.full_name or "Senior Technical Mentor"
    doubt.answered_at = datetime.utcnow()
    doubt.status = "answered"

    db.commit()
    db.refresh(doubt)

    # Queue email notification to student
    background_tasks.add_task(
        send_doubt_answered_email,
        doubt.student_email,
        doubt.student_name,
        doubt.module_name or doubt.subject or "Technical Question",
        doubt.question,
        doubt.admin_reply,
        doubt.answered_by
    )

    return {"success": True, "message": "Reply posted successfully", "doubt_id": doubt.id}


class ContactReplyBody(BaseModel):
    admin_reply: str


@router.get("/contacts")
def get_contact_queries(
    q: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Admin-only endpoint to list all contact queries with search & filters."""
    query = db.query(ContactQuery)

    if q:
        search_fmt = f"%{q}%"
        query = query.filter(
            ContactQuery.name.ilike(search_fmt) |
            ContactQuery.email.ilike(search_fmt) |
            ContactQuery.subject.ilike(search_fmt) |
            ContactQuery.message.ilike(search_fmt)
        )

    if status and status != "all":
        query = query.filter(ContactQuery.status == status)

    total = query.count()
    items = query.order_by(ContactQuery.created_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    items_list = [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
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

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": items_list
    }


@router.patch("/contacts/{contact_id}/status")
def update_contact_query_status(
    contact_id: int,
    body: StatusUpdateBody,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Mark contact query as read/new/replied."""
    contact = db.query(ContactQuery).filter(ContactQuery.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact query not found")

    contact.status = body.status
    db.commit()
    return {"success": True, "message": f"Status updated to {body.status}", "id": contact.id}


@router.post("/contacts/{contact_id}/reply")
def reply_to_contact_query(
    contact_id: int,
    body: ContactReplyBody,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Admin writes a reply to a candidate/client contact message and sends email."""
    contact = db.query(ContactQuery).filter(ContactQuery.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact query not found")

    contact.admin_reply = body.admin_reply.strip()
    contact.replied_by = current_admin.full_name or "InternVision Support Team"
    contact.replied_at = datetime.utcnow()
    contact.status = "replied"

    db.commit()
    db.refresh(contact)

    # Queue email reply to sender
    background_tasks.add_task(
        send_contact_reply_email,
        contact.email,
        contact.name,
        contact.subject,
        contact.message,
        contact.admin_reply,
        contact.replied_by
    )

    return {"success": True, "message": "Reply sent successfully", "id": contact.id}


@router.delete("/contacts/{contact_id}")
def delete_single_contact_query(
    contact_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Delete a single contact query."""
    contact = db.query(ContactQuery).filter(ContactQuery.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact query not found")

    db.delete(contact)
    db.commit()
    return {"success": True, "message": "Contact query deleted successfully"}


@router.delete("/contacts/all")
def delete_all_contact_queries(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Delete all contact queries, optionally filtered by status."""
    query = db.query(ContactQuery)
    if status and status != "all":
        query = query.filter(ContactQuery.status == status)

    deleted_count = query.delete(synchronize_session=False)
    db.commit()
    return {"success": True, "deleted_count": deleted_count, "message": f"Deleted {deleted_count} contact inquiries."}


