import math
from datetime import datetime
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks, Body
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from app.shared.database import get_db
from app.shared.dependencies import require_permission
from app.shared.email_service import (
    send_internship_acceptance_email,
    send_internship_rejection_email,
    send_submission_reviewed_email,
    send_doubt_answered_email,
)
from app.internship.models import InternshipApplication, InternshipSubmission, TaskUnlockRequest, StudentDoubt
from app.internship.schemas import ApplicationResponse
from app.auth.models import Admin

router = APIRouter(prefix="/admin", tags=["admin-internships"])

# ─── 1. Internship Applications ─────────────────────────────────────────────

@router.get("/applications")
def get_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    q: Optional[str] = None,
    duration: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("applications"))
):
    """Admin endpoint to list candidate applications with pagination and filters."""
    query = db.query(InternshipApplication)
    if q:
        query = query.filter(
            InternshipApplication.full_name.ilike(f"%{q}%") |
            InternshipApplication.email.ilike(f"%{q}%") |
            InternshipApplication.college.ilike(f"%{q}%")
        )
    if duration and duration != "all":
        query = query.filter(InternshipApplication.duration == duration)

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1
    items = query.order_by(InternshipApplication.created_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": [ApplicationResponse.model_validate(item) for item in items]
    }


@router.patch("/applications/{app_id}/status")
def update_application_status(
    app_id: int,
    background_tasks: BackgroundTasks,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("applications"))
):
    """Update applicant review status and dispatch onboarding emails."""
    status_val = payload.get("status")
    if not status_val:
        raise HTTPException(status_code=400, detail="Missing status field")

    app = db.query(InternshipApplication).filter(InternshipApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = status_val
    app.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(app)

    # Trigger transactional emails
    if status_val == "accepted":
        background_tasks.add_task(
            send_internship_acceptance_email,
            student_email=app.email,
            student_name=app.full_name,
            domain_track=app.role_preference or "Software Engineering",
            duration=app.duration or "3 Months"
        )
    elif status_val == "rejected":
        background_tasks.add_task(
            send_internship_rejection_email,
            student_email=app.email,
            student_name=app.full_name,
            domain_track=app.role_preference or "Software Engineering"
        )

    return ApplicationResponse.model_validate(app)


@router.delete("/applications/all")
def delete_all_applications(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("applications"))
):
    """Admin endpoint to permanently delete all internship applications."""
    try:
        db.query(StudentDoubt).delete()
        db.query(TaskUnlockRequest).delete()
        db.query(InternshipSubmission).delete()
        db.query(InternshipApplication).delete()
        db.commit()
        return {"success": True, "message": "All applications and student data have been permanently erased."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete all applications: {str(e)}")


@router.delete("/applications/{app_id}")
def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("applications"))
):
    """Admin endpoint to permanently delete a specific candidate application."""
    app = db.query(InternshipApplication).filter(InternshipApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    try:
        db.query(StudentDoubt).filter(
            (StudentDoubt.application_id == app.id) | (func.lower(StudentDoubt.student_email) == func.lower(app.email))
        ).delete()
        db.query(TaskUnlockRequest).filter(
            (TaskUnlockRequest.application_id == app.id) | (func.lower(TaskUnlockRequest.student_email) == func.lower(app.email))
        ).delete()
        db.query(InternshipSubmission).filter(
            (InternshipSubmission.application_id == app.id) | (func.lower(InternshipSubmission.student_email) == func.lower(app.email))
        ).delete()
        db.delete(app)
        db.commit()
        return {"success": True, "message": f"Application for '{app.full_name}' permanently deleted."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete application: {str(e)}")


# ─── 2. Student Submissions & Grading ───────────────────────────────────────

@router.get("/submissions")
def get_student_submissions(
    status: Optional[str] = None,
    duration: Optional[str] = None,
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("submissions"))
):
    """Admin endpoint to view deliverables submitted by students."""
    query = db.query(InternshipSubmission)
    if q:
        query = query.filter(
            InternshipSubmission.student_email.ilike(f"%{q}%") |
            InternshipSubmission.title.ilike(f"%{q}%") |
            InternshipSubmission.task_key.ilike(f"%{q}%")
        )
    if status and status != "all":
        query = query.filter(InternshipSubmission.status == status)
    if duration and duration != "all":
        app_ids = select(InternshipApplication.id).filter(InternshipApplication.duration == duration)
        app_emails = select(func.lower(InternshipApplication.email)).filter(InternshipApplication.duration == duration)
        query = query.filter(
            (InternshipSubmission.application_id.in_(app_ids)) |
            (func.lower(InternshipSubmission.student_email).in_(app_emails))
        )

    total = query.count()
    items = query.order_by(InternshipSubmission.submitted_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    items_list = []
    for item in items:
        app = db.query(InternshipApplication).filter(
            (InternshipApplication.id == item.application_id) | (func.lower(InternshipApplication.email) == func.lower(item.student_email))
        ).first()
        items_list.append({
            "id": item.id,
            "application_id": item.application_id,
            "student_email": item.student_email,
            "student_name": app.full_name if app else item.student_email.split("@")[0],
            "role_preference": app.role_preference if app else "Engineering Intern",
            "duration": app.duration if app else "3 Months",
            "task_key": item.task_key,
            "title": item.title,
            "project_topic": item.project_topic,
            "github_url": item.github_url,
            "live_url": item.live_url,
            "documentation_url": item.documentation_url,
            "notes": item.notes,
            "tools_used": item.tools_used or [],
            "is_unlocked": item.is_unlocked,
            "status": item.status,
            "admin_feedback": item.admin_feedback,
            "submitted_at": item.submitted_at.isoformat() if item.submitted_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None,
        })

    return {"items": items_list, "total": total}


@router.patch("/submissions/{sub_id}")
def review_submission(
    sub_id: int,
    background_tasks: BackgroundTasks,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("submissions"))
):
    """Grade deliverable, provide constructive feedback, and unlock/lock module."""
    sub = db.query(InternshipSubmission).filter(InternshipSubmission.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if "status" in payload:
        sub.status = payload["status"]
    if "admin_feedback" in payload:
        sub.admin_feedback = payload["admin_feedback"]
    if "is_unlocked" in payload:
        sub.is_unlocked = bool(payload["is_unlocked"])

    sub.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(sub)

    # Look up applicant info for notification
    app = db.query(InternshipApplication).filter(
        (InternshipApplication.id == sub.application_id) | (func.lower(InternshipApplication.email) == func.lower(sub.student_email))
    ).first()
    student_name = app.full_name if app else sub.student_email.split("@")[0]

    background_tasks.add_task(
        send_submission_reviewed_email,
        student_email=sub.student_email,
        student_name=student_name,
        task_title=sub.title,
        status=sub.status,
        feedback=sub.admin_feedback or "Your deliverable has been reviewed by your engineering mentor."
    )

    return {
        "id": sub.id,
        "status": sub.status,
        "admin_feedback": sub.admin_feedback,
        "is_unlocked": sub.is_unlocked,
        "updated_at": sub.updated_at.isoformat()
    }


# ─── 3. Task Unlock Requests Desk ───────────────────────────────────────────

@router.get("/unlock-requests")
def get_unlock_requests(
    status: Optional[str] = None,
    duration: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("unlocks"))
):
    """Admin endpoint to view student deadline extension & unlock requests."""
    query = db.query(TaskUnlockRequest)
    if status and status != "all":
        query = query.filter(TaskUnlockRequest.status == status)
    if duration and duration != "all":
        app_ids = select(InternshipApplication.id).filter(InternshipApplication.duration == duration)
        app_emails = select(func.lower(InternshipApplication.email)).filter(InternshipApplication.duration == duration)
        query = query.filter(
            (TaskUnlockRequest.application_id.in_(app_ids)) |
            (func.lower(TaskUnlockRequest.student_email).in_(app_emails))
        )

    total = query.count()
    items = query.order_by(TaskUnlockRequest.created_at.desc())\
                 .offset((page - 1) * limit)\
                 .limit(limit)\
                 .all()

    items_list = []
    for item in items:
        app = db.query(InternshipApplication).filter(
            (InternshipApplication.id == item.application_id) | (func.lower(InternshipApplication.email) == func.lower(item.student_email))
        ).first()
        items_list.append({
            "id": item.id,
            "application_id": item.application_id,
            "student_email": item.student_email,
            "student_name": item.student_name or (app.full_name if app else item.student_email.split("@")[0]),
            "duration": app.duration if app else "3 Months",
            "task_key": item.task_key,
            "task_title": item.task_title,
            "reason": item.reason,
            "status": item.status,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None,
        })

    return {"items": items_list, "total": total}


@router.post("/unlock-requests/{req_id}/action")
def action_unlock_request(
    req_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("unlocks"))
):
    """Approve or reject unlock request, toggling the student's submission form slot."""
    action = payload.get("action", "approve")  # 'approve' | 'reject' | 'toggle'
    req = db.query(TaskUnlockRequest).filter(TaskUnlockRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Unlock request not found")

    if action == "approve":
        req.status = "approved"
        # Find or create submission entry to set unlocked
        sub = db.query(InternshipSubmission)\
                .filter(
                    (func.lower(InternshipSubmission.student_email) == func.lower(req.student_email)) | (InternshipSubmission.application_id == req.application_id),
                    InternshipSubmission.task_key == req.task_key
                )\
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
    elif action == "toggle":
        if req.status == "approved":
            req.status = "rejected"
            sub = db.query(InternshipSubmission)\
                    .filter(
                        (func.lower(InternshipSubmission.student_email) == func.lower(req.student_email)) | (InternshipSubmission.application_id == req.application_id),
                        InternshipSubmission.task_key == req.task_key
                    )\
                    .first()
            if sub:
                sub.is_unlocked = False
        else:
            req.status = "approved"
            sub = db.query(InternshipSubmission)\
                    .filter(
                        (func.lower(InternshipSubmission.student_email) == func.lower(req.student_email)) | (InternshipSubmission.application_id == req.application_id),
                        InternshipSubmission.task_key == req.task_key
                    )\
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
        sub = db.query(InternshipSubmission)\
                .filter(
                    (func.lower(InternshipSubmission.student_email) == func.lower(req.student_email)) | (InternshipSubmission.application_id == req.application_id),
                    InternshipSubmission.task_key == req.task_key
                )\
                .first()
        if sub:
            sub.is_unlocked = False

    req.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "status": req.status, "message": f"Task submission slot is now {req.status}"}


# ─── 4. Student Doubts & Query Helpdesk ─────────────────────────────────────

@router.get("/doubts")
def get_student_doubts(
    status: Optional[str] = None,
    duration: Optional[str] = None,
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("doubts"))
):
    """Admin endpoint to view all student doubts and code blockers."""
    query = db.query(StudentDoubt)
    if status and status != "all":
        query = query.filter(StudentDoubt.status == status)
    if duration and duration != "all":
        app_ids = select(InternshipApplication.id).filter(InternshipApplication.duration == duration)
        app_emails = select(func.lower(InternshipApplication.email)).filter(InternshipApplication.duration == duration)
        query = query.filter(
            (StudentDoubt.application_id.in_(app_ids)) |
            (func.lower(StudentDoubt.student_email).in_(app_emails))
        )
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

    return [
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


@router.post("/doubts/{doubt_id}/reply")
def reply_to_student_doubt(
    doubt_id: int,
    background_tasks: BackgroundTasks,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_permission("doubts"))
):
    """Admin endpoint to resolve student question and dispatch email solution."""
    reply_text = payload.get("admin_reply", "").strip()
    if not reply_text:
        raise HTTPException(status_code=400, detail="Admin reply message cannot be empty")

    doubt = db.query(StudentDoubt).filter(StudentDoubt.id == doubt_id).first()
    if not doubt:
        raise HTTPException(status_code=404, detail="Student doubt query not found")

    doubt.admin_reply = reply_text
    doubt.status = "answered"
    doubt.answered_by = current_admin.full_name or "Engineering Mentor Desk"
    doubt.answered_at = datetime.utcnow()
    db.commit()
    db.refresh(doubt)

    # Dispatch email resolution
    background_tasks.add_task(
        send_doubt_answered_email,
        student_email=doubt.student_email,
        student_name=doubt.student_name,
        subject=doubt.subject,
        question=doubt.question,
        admin_reply=reply_text,
        answered_by=doubt.answered_by
    )

    return {
        "id": doubt.id,
        "status": doubt.status,
        "admin_reply": doubt.admin_reply,
        "answered_by": doubt.answered_by,
        "answered_at": doubt.answered_at.isoformat()
    }
