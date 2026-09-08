import re
import json
import uuid
import smtplib
import logging
from html import escape
from datetime import datetime, timezone
from typing import Optional, List
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.shared.database import get_db
from app.core.config import settings
from app.mailer.models import SentEmail
from app.internship.models import InternshipApplication, InternshipSubmission
from app.courses.models import CourseRegistration
from app.auth.user_models import SiteUser
from app.shared.email_service import (
    send_submission_due_reminder_email,
    send_internship_acceptance_email,
    send_welcome_login_email,
    send_doubt_answered_email,
    send_submission_reviewed_email,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/mailer", tags=["Branded Mailer"])


def escape_html(str_val: str) -> str:
    if not str_val:
        return ""
    return escape(str(str_val))


def render_message_html(text: str, accent_color: str = "#2563eb") -> str:
    if not text:
        return ""

    link_color = accent_color or "#2563eb"
    paragraphs = re.split(r"\n{2,}", text)
    result_paragraphs = []

    for paragraph in paragraphs:
        escaped = escape_html(paragraph)

        # 1. Markdown links: [label](https://...)
        escaped = re.sub(
            r"\[([^\]]+)\]\((https?://[^\s)]+)\)",
            rf'<a href="\2" target="_blank" rel="noopener noreferrer" style="color:{link_color}; text-decoration:underline; font-weight:600;">\1</a>',
            escaped
        )

        # 2. Bare URLs
        escaped = re.sub(
            r'(?<!href=")((https?://|www\.)[^\s<]+)',
            lambda m: f'<a href="{m.group(1) if m.group(1).startswith("http") else "https://" + m.group(1)}" target="_blank" rel="noopener noreferrer" style="color:{link_color}; text-decoration:underline;">{m.group(1)}</a>',
            escaped
        )

        # 3. Bare email addresses
        escaped = re.sub(
            r'([\w.+-]+@[\w-]+\.[a-z.]{2,})',
            lambda m: f'<a href="mailto:{m.group(1)}" style="color:{link_color}; text-decoration:underline;">{m.group(1)}</a>' if f">{m.group(1)}<" not in escaped else m.group(1),
            escaped
        )

        # Single line breaks
        escaped = escaped.replace("\n", "<br/>")
        result_paragraphs.append(
            f'<p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#2a2a2a;">{escaped}</p>'
        )

    return "".join(result_paragraphs)


def build_branded_html(
    heading: Optional[str],
    brand_name: str,
    body_html: str,
    accent_color: str = "#2563eb",
    cta_text: Optional[str] = None,
    cta_url: Optional[str] = None,
    greeting_name: Optional[str] = None,
) -> str:
    accent = accent_color or "#2563eb"
    greeting = ""
    if greeting_name:
        greeting = f'<p style="margin:0 0 16px; font-size:15px; color:#2a2a2a;">Dear {escape_html(greeting_name)},</p>'

    cta_button = ""
    if cta_text and cta_url:
        cta_button = f"""
        <div style="text-align:center; margin: 28px 0 8px;">
          <a href="{escape_html(cta_url)}" target="_blank" rel="noopener noreferrer"
             style="display:inline-block; background:{accent}; color:#ffffff !important; text-decoration:none;
                    font-weight:700; font-size:15px; padding:14px 36px; border-radius:999px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            {escape_html(cta_text)}
          </a>
        </div>"""

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:20px 0; background-color:#f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    <!-- Branded Header Bar -->
    <div style="background:#111827; padding:24px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;">
            <span style="display:inline-block; width:10px; height:22px; background:#f4c542; margin-right:3px; border-radius:2px; vertical-align:middle;"></span>
            <span style="display:inline-block; width:10px; height:16px; background:#3fbf61; margin-right:3px; border-radius:2px; vertical-align:middle;"></span>
            <span style="display:inline-block; width:10px; height:26px; background:#4a90e2; margin-right:12px; border-radius:2px; vertical-align:middle;"></span>
            <span style="color:{accent}; font-size:22px; font-weight:700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; vertical-align:middle;">
              {escape_html(brand_name or "InternVision Tech")}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Body Content -->
    <div style="padding:32px 28px 16px;">
      {f'<h2 style="margin:0 0 18px; font-size:22px; font-weight:700; color:#111827;">{escape_html(heading)}</h2>' if heading else ''}
      {greeting}
      <div>{body_html}</div>
      {cta_button}
    </div>

    <!-- Footer -->
    <div style="padding:18px 28px 26px; border-top:1px solid #f1f5f9; background:#fafafa;">
      <p style="color:#64748b; font-size:12px; margin:0; line-height:1.5;">
        Sent by <strong>{escape_html(brand_name or "InternVision Tech HR")}</strong><br/>
        Official Educational Communications • Verified Credentials Platform
      </p>
    </div>
  </div>
</body>
</html>"""


@router.get("/recipients")
def get_applicant_recipients(db: Session = Depends(get_db)):
    """
    Returns a unified list of applicant emails and site users for quick selection in the Mailer.
    """
    recipients_map = {}

    # 1. Internship Applications
    intern_apps = db.query(InternshipApplication).order_by(InternshipApplication.created_at.desc()).all()
    for app in intern_apps:
        em = (app.email or "").strip().lower()
        if em and em not in recipients_map:
            recipients_map[em] = {
                "email": em,
                "name": app.full_name or em.split("@")[0],
                "type": "internship",
                "role_preference": app.role_preference or "Internship",
                "duration": app.duration or "",
                "status": app.status or "submitted",
                "college": app.college or "",
                "created_at": app.created_at.isoformat() if app.created_at else None,
            }

    # 2. Course Registrations
    course_regs = db.query(CourseRegistration).order_by(CourseRegistration.created_at.desc()).all()
    for reg in course_regs:
        em = (reg.student_email or "").strip().lower()
        if em and em not in recipients_map:
            course_name = reg.course.title if reg.course else "Course Bootcamp"
            recipients_map[em] = {
                "email": em,
                "name": reg.student_name or em.split("@")[0],
                "type": "course",
                "role_preference": course_name,
                "status": reg.status or "registered",
                "college": "",
                "created_at": reg.created_at.isoformat() if reg.created_at else None,
            }

    # 3. Site Users
    site_users = db.query(SiteUser).order_by(SiteUser.created_at.desc()).all()
    for u in site_users:
        em = (u.email or "").strip().lower()
        if em and em not in recipients_map:
            recipients_map[em] = {
                "email": em,
                "name": u.full_name or em.split("@")[0],
                "type": "user",
                "role_preference": "Site Member",
                "status": "active",
                "college": "",
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }

    return sorted(list(recipients_map.values()), key=lambda x: x["name"])


@router.get("/history")
def get_send_history(db: Session = Depends(get_db)):
    """
    Returns the last 100 sent emails audit log.
    """
    rows = db.query(SentEmail).order_by(SentEmail.created_at.desc()).limit(100).all()
    return [
        {
            "id": r.id,
            "batch_id": r.batch_id,
            "to": r.to_email,
            "recipient_name": r.recipient_name,
            "subject": r.subject,
            "heading": r.heading,
            "brand_name": r.brand_name,
            "status": r.status,
            "error_message": r.error_message,
            "message_id": r.message_id,
            "attachment_names": r.attachment_names or [],
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.post("/send")
async def send_branded_email(request: Request, db: Session = Depends(get_db)):
    """
    Accepts multipart/form-data for sending single/bulk branded emails with shared
    and personalized attachments via Brevo SMTP.
    """
    form = await request.form()

    subject = form.get("subject", "").strip()
    if not subject:
        raise HTTPException(status_code=400, detail="Subject is required.")

    brand_name = form.get("brandName", "InternVision Tech HR").strip()
    accent_color = form.get("accentColor", "#2563eb").strip()
    heading = form.get("heading", "").strip() or None
    greeting_name = form.get("greetingName", "").strip() or None
    message = form.get("message", "").strip()
    cta_text = form.get("ctaText", "").strip() or None
    cta_url = form.get("ctaUrl", "").strip() or None

    # Read shared attachments
    shared_files = form.getlist("attachments")
    shared_attachments_data = []
    shared_attachment_names = []

    for f in shared_files:
        if isinstance(f, UploadFile) and f.filename:
            content = await f.read()
            shared_attachments_data.append({
                "filename": f.filename,
                "content": content,
                "content_type": f.content_type or "application/octet-stream"
            })
            shared_attachment_names.append(f.filename)

    # Determine recipients
    raw_personalized = form.get("personalizedRecipients")
    raw_recipients = form.get("recipients")

    recipients = []
    personalized_files_map = {}

    if raw_personalized:
        try:
            parsed_p = json.loads(raw_personalized)
            if isinstance(parsed_p, list):
                for idx, r in enumerate(parsed_p):
                    em = str(r.get("email", "")).strip().lower()
                    if em:
                        recipients.append({
                            "email": em,
                            "name": str(r.get("name", "")).strip(),
                            "personal_index": idx
                        })
        except Exception as e:
            logger.warning(f"Failed to parse personalizedRecipients: {e}")

    if not recipients and raw_recipients:
        try:
            parsed_r = json.loads(raw_recipients)
            if isinstance(parsed_r, list):
                for em in parsed_r:
                    cleaned = str(em).strip().lower()
                    if cleaned:
                        recipients.append({"email": cleaned, "name": "", "personal_index": None})
        except Exception:
            for line in raw_recipients.replace(",", "\n").split("\n"):
                cleaned = line.strip().lower()
                if cleaned and "@" in cleaned:
                    recipients.append({"email": cleaned, "name": "", "personal_index": None})

    if not recipients:
        raise HTTPException(status_code=400, detail="At least one valid recipient email is required.")

    # Extract personal files from form fields: pf_offerLetter_{idx}, pf_certificate_{idx}
    for key in form.keys():
        m = re.match(r"^pf_(offerLetter|certificate)_(\d+)$", key)
        if m:
            ftype, idx_str = m.group(1), int(m.group(2))
            file_item = form.get(key)
            if isinstance(file_item, UploadFile) and file_item.filename:
                if idx_str not in personalized_files_map:
                    personalized_files_map[idx_str] = {}
                content = await file_item.read()
                personalized_files_map[idx_str][ftype] = {
                    "filename": file_item.filename,
                    "content": content,
                    "content_type": file_item.content_type or "application/octet-stream"
                }

    # SMTP Configuration
    from app.shared.email_service import _get_smtp_password
    smtp_host = settings.SMTP_HOST or "smtp-relay.brevo.com"
    smtp_port = int(settings.SMTP_PORT or 587)
    smtp_user = settings.SMTP_USER or "b06485001@smtp-brevo.com"
    smtp_password = _get_smtp_password()
    from_email = settings.SMTP_FROM_EMAIL or "internvisiontechhr@gmail.com"
    from_name = brand_name or settings.SMTP_FROM_NAME or "InternVision Tech HR"

    batch_id = str(uuid.uuid4()) if len(recipients) > 1 else None
    results = []

    def _open_smtp_connection():
        ports_to_try = [
            (int(settings.SMTP_PORT or 587), False),
            (465, True),
            (2525, False),
        ]
        for p, is_ssl in ports_to_try:
            try:
                if is_ssl:
                    srv = smtplib.SMTP_SSL(smtp_host, p, timeout=12)
                else:
                    srv = smtplib.SMTP(smtp_host, p, timeout=12)
                    srv.starttls()
                srv.login(smtp_user, smtp_password)
                return srv, None
            except Exception as e:
                logger.warning(f"SMTP connection attempt failed on port {p}: {e}")
        return None, "Unable to establish SMTP connection on ports 587, 465, or 2525."

    server, conn_err = _open_smtp_connection()

    # Send loop
    for rec in recipients:
        to_email = rec["email"]
        rec_name = rec["name"]
        p_idx = rec["personal_index"]

        effective_greeting = rec_name or greeting_name
        body_html = render_message_html(message, accent_color)
        full_html = build_branded_html(
            heading=heading,
            brand_name=brand_name,
            body_html=body_html,
            accent_color=accent_color,
            cta_text=cta_text,
            cta_url=cta_url,
            greeting_name=effective_greeting
        )

        plain_message = re.sub(r"\[([^\]]+)\]\((https?://[^\s)]+)\)", r"\1 (\2)", message or "")
        plain_text = (
            (f"Dear {effective_greeting},\n\n" if effective_greeting else "")
            + (f"{heading}\n\n" if heading else "")
            + plain_message
            + (f"\n\n{cta_text}: {cta_url}" if cta_text and cta_url else "")
            + f"\n\n---\nSent by {brand_name}"
        )

        # Gather attachments for this recipient
        personal_attachments = []
        personal_attachment_names = []

        if p_idx is not None and p_idx in personalized_files_map:
            p_files = personalized_files_map[p_idx]
            display_candidate_name = rec_name or to_email.split("@")[0]

            if "offerLetter" in p_files:
                ol = p_files["offerLetter"]
                ext = ol["filename"].split(".")[-1] if "." in ol["filename"] else "pdf"
                out_name = f"{display_candidate_name} - Offer Letter.{ext}"
                personal_attachments.append({
                    "filename": out_name,
                    "content": ol["content"],
                    "content_type": ol["content_type"]
                })
                personal_attachment_names.append(out_name)

            if "certificate" in p_files:
                cert = p_files["certificate"]
                ext = cert["filename"].split(".")[-1] if "." in cert["filename"] else "pdf"
                out_name = f"{display_candidate_name} - Completion Certificate.{ext}"
                personal_attachments.append({
                    "filename": out_name,
                    "content": cert["content"],
                    "content_type": cert["content_type"]
                })
                personal_attachment_names.append(out_name)

        all_attachments = shared_attachments_data + personal_attachments
        all_attachment_names = shared_attachment_names + personal_attachment_names

        # Build MIME Message
        msg = MIMEMultipart("mixed")
        msg["Subject"] = subject
        msg["From"] = f"{from_name} <{from_email}>"
        msg["To"] = to_email

        # Body part (alternative: plain + html)
        body_part = MIMEMultipart("alternative")
        body_part.attach(MIMEText(plain_text, "plain", "utf-8"))
        body_part.attach(MIMEText(full_html, "html", "utf-8"))
        msg.attach(body_part)

        # Attachments
        for att in all_attachments:
            try:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(att["content"])
                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition",
                    f'attachment; filename="{att["filename"]}"'
                )
                msg.attach(part)
            except Exception as e:
                logger.error(f"Failed to attach {att['filename']}: {e}")

        # Send via open server or reconnect
        sent_ok = False
        send_err = conn_err or "No active SMTP connection"
        msg_id = f"brevo-{uuid.uuid4()}"

        if server:
            try:
                server.sendmail(from_email, [to_email], msg.as_string())
                sent_ok = True
            except Exception as e:
                logger.warning(f"Failed to send on active connection, attempting reconnect: {e}")
                server, conn_err = _open_smtp_connection()
                if server:
                    try:
                        server.sendmail(from_email, [to_email], msg.as_string())
                        sent_ok = True
                    except Exception as e2:
                        send_err = str(e2)
                else:
                    send_err = conn_err or str(e)
        else:
            # Try to reconnect once
            server, conn_err = _open_smtp_connection()
            if server:
                try:
                    server.sendmail(from_email, [to_email], msg.as_string())
                    sent_ok = True
                except Exception as e:
                    send_err = str(e)

        if sent_ok:
            sent_record = SentEmail(
                batch_id=batch_id,
                to_email=to_email,
                recipient_name=rec_name or None,
                subject=subject,
                heading=heading,
                brand_name=brand_name,
                attachment_names=all_attachment_names,
                status="success",
                message_id=msg_id,
            )
            db.add(sent_record)
            db.commit()
            results.append({"to": to_email, "success": True, "messageId": msg_id})
        else:
            logger.error(f"Failed to send to {to_email}: {send_err}")
            sent_record = SentEmail(
                batch_id=batch_id,
                to_email=to_email,
                recipient_name=rec_name or None,
                subject=subject,
                heading=heading,
                brand_name=brand_name,
                attachment_names=all_attachment_names,
                status="failed",
                error_message=str(send_err),
            )
            db.add(sent_record)
            db.commit()
            results.append({"to": to_email, "success": False, "error": str(send_err)})

    if server:
        try:
            server.quit()
        except Exception:
            pass

    success_count = len([r for r in results if r["success"]])
    failure_count = len(results) - success_count

    return {
        "success": failure_count == 0,
        "batchId": batch_id,
        "total": len(results),
        "successCount": success_count,
        "failureCount": failure_count,
        "results": results,
    }


@router.post("/send-submission-reminders")
def dispatch_submission_due_reminders(
    target_email: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Scans active accepted internship students and dispatches automated
    Submission Due Today Reminder emails.
    """
    query = db.query(InternshipApplication).filter(
        InternshipApplication.status.in_(["accepted", "active"])
    )
    if target_email:
        query = query.filter(InternshipApplication.email == target_email.strip().lower())

    apps = query.all()
    results = []

    for app in apps:
        # Determine active task/milestone
        subs = db.query(InternshipSubmission).filter(
            InternshipSubmission.student_email == app.email
        ).all()
        submitted_keys = {s.task_key for s in subs if s.status in ("submitted", "approved", "under_review")}

        # Milestone plan
        duration = app.duration or "1 Month"
        role = app.role_preference or "Virtual Internship"

        # Determine pending task
        if "week1" not in submitted_keys:
            task_key = "week1"
            task_title = "Week 1: Core Architecture & Responsive Component Systems"
        elif "week2" not in submitted_keys:
            task_key = "week2"
            task_title = "Week 2: RESTful Backend APIs & Database Models"
        elif "week3" not in submitted_keys:
            task_key = "week3"
            task_title = "Week 3: Authentication, Protected Routing & Cloud Uploads"
        elif "week4" not in submitted_keys:
            task_key = "week4"
            task_title = "Week 4: Production Cloud Deployment & CI/CD Pipeline"
        elif duration in ("3 Months", "6 Months") and "month2_project" not in submitted_keys:
            task_key = "month2_project"
            task_title = "Month 2: Full-Scale Industry Capstone Project Deliverable"
        elif duration in ("3 Months", "6 Months") and "month3_portfolio" not in submitted_keys:
            task_key = "month3_portfolio"
            task_title = "Month 3: Personal Developer Portfolio Deployment"
        elif duration == "6 Months" and "month4_6_project" not in submitted_keys:
            task_key = "month4_6_project"
            task_title = "Months 4-6: Production Enterprise Full-Stack & AI System"
        else:
            task_key = "final_review"
            task_title = "Final Program Evaluation & Exit Portfolio"

        ok = send_submission_due_reminder_email(
            student_email=app.email,
            student_name=app.full_name or app.email.split("@")[0],
            task_title=task_title,
            task_key=task_key,
            duration=duration,
            role_preference=role,
        )

        # Log sent email record
        msg_id = f"reminder-{uuid.uuid4()}"
        sent_record = SentEmail(
            to_email=app.email,
            recipient_name=app.full_name,
            subject=f"⏰ Milestone Submission Due Today: {task_title}",
            heading="Milestone Submission Due Today",
            brand_name="InternVision Tech HR",
            status="success" if ok else "failed",
            message_id=msg_id,
        )
        db.add(sent_record)
        db.commit()

        results.append({
            "email": app.email,
            "name": app.full_name,
            "task_key": task_key,
            "task_title": task_title,
            "success": ok,
        })

    return {
        "success": True,
        "processed": len(results),
        "results": results
    }

