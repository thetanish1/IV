import os
import uuid
import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, status, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
import cloudinary
import cloudinary.uploader

from app.core.config import settings
from app.shared.database import get_db
from app.shared.exceptions import BadRequestException
from app.shared.email_service import send_internship_application_email
from app.internship.models import InternshipApplication
from app.internship.schemas import ApplicationCreate, ApplicationResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Internship Applications"])

# Directory to store uploaded resumes locally (fallback)
RESUME_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "resumes")
os.makedirs(RESUME_DIR, exist_ok=True)

ALLOWED_RESUME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
}


def configure_cloudinary():
    """Configure cloudinary if credentials are provided."""
    if settings.CLOUDINARY_URL:
        cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)
        return True
    elif settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )
        return True
    return False


@router.post("/applications/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload a resume PDF/DOC file to Cloudinary Object Storage with local fallback."""
    # Check allowed file types
    filename_lower = (file.filename or "").lower()
    valid_ext = any(filename_lower.endswith(ext) for ext in [".pdf", ".doc", ".docx"])
    
    if not valid_ext and file.content_type not in ALLOWED_RESUME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOC, or DOCX files are accepted for resume upload."
        )

    content = await file.read()
    ext = os.path.splitext(file.filename or "resume")[-1] or ".pdf"
    unique_filename = f"{uuid.uuid4().hex}{ext}"

    # Try uploading to Cloudinary Object Storage first
    if configure_cloudinary():
        try:
            upload_result = cloudinary.uploader.upload(
                content,
                folder="internvision/resumes",
                resource_type="auto",
                public_id=f"resume_{uuid.uuid4().hex}",
                use_filename=True,
                unique_filename=True,
                flags="attachment:false"
            )
            secure_url = upload_result.get("secure_url") or upload_result.get("url")
            if secure_url:
                logger.info(f"Resume uploaded to Cloudinary: {secure_url}")
                return {
                    "filename": secure_url,
                    "url": secure_url,
                    "original_name": file.filename,
                    "storage": "cloudinary"
                }
        except Exception as e:
            logger.error(f"Cloudinary upload failed, falling back to local storage: {e}")

    # Local fallback
    save_path = os.path.join(RESUME_DIR, unique_filename)
    with open(save_path, "wb") as f:
        f.write(content)

    return {
        "filename": unique_filename,
        "url": f"/api/applications/resume/{unique_filename}",
        "original_name": file.filename,
        "storage": "local"
    }


@router.get("/applications/resume-proxy")
def proxy_resume_stream(url: str):
    """
    Proxies remote Cloudinary or S3 hosted resume PDF/DOC files
    so that browser admin preview iframe and object embeds work without CORS or iframe blocking.
    """
    import urllib.request
    from fastapi.responses import Response

    if not url or not (url.startswith("http://") or url.startswith("https://")):
        raise HTTPException(status_code=400, detail="Invalid resume file URL")

    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) InternVision/1.0"}
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            file_bytes = response.read()
            content_type = response.headers.get("Content-Type", "application/pdf")

            # Default to PDF if generic or octet-stream
            if "octet-stream" in content_type.lower() or url.lower().endswith(".pdf"):
                content_type = "application/pdf"

            return Response(
                content=file_bytes,
                media_type=content_type,
                headers={
                    "Content-Disposition": "inline; filename=resume.pdf",
                    "Cache-Control": "public, max-age=86400",
                    "Access-Control-Allow-Origin": "*",
                }
            )
    except Exception as e:
        logger.error(f"Failed to proxy resume from {url}: {e}")
        # If proxy fetch fails, fallback redirect directly to url
        return RedirectResponse(url=url)


@router.get("/applications/resume/{filename:path}")
def get_resume_file(filename: str):
    """Serve or download uploaded resume file, redirecting or proxying to Cloudinary if applicable."""
    # If the stored filename is a full URL or Cloudinary path
    if filename.startswith("http://") or filename.startswith("https://"):
        return RedirectResponse(url=filename)
    
    if "cloudinary.com" in filename:
        full_url = filename if filename.startswith("http") else f"https://{filename}"
        return RedirectResponse(url=full_url)

    # Prevent directory traversal attacks for local files
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(RESUME_DIR, safe_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume file not found")
    
    media_type = "application/pdf"
    if safe_filename.endswith(".doc"):
        media_type = "application/msword"
    elif safe_filename.endswith(".docx"):
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=safe_filename,
        content_disposition_type="inline"
    )


@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
@router.post("/internships/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def submit_internship_application(app_in: ApplicationCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Submit internship application.
    All applications enter 'pending' status for initial admin review.
    """
    duration_normalized = app_in.duration.strip()
    valid_durations = ["1 Month", "3 Months", "6 Months"]
    
    # Standardize capitalization if slightly different
    for vd in valid_durations:
        if vd.lower() == duration_normalized.lower():
            duration_normalized = vd
            break

    app_data = app_in.model_dump()
    app_data["duration"] = duration_normalized
    app_data["status"] = "pending"  # Always pending for admin review first

    application = InternshipApplication(**app_data)
    db.add(application)
    db.commit()
    db.refresh(application)

    # Send confirmation receipt email tailored to duration (1 Month, 3 Months, 6 Months)
    recipient_email = application.email or application.google_email
    if recipient_email:
        background_tasks.add_task(
            send_internship_application_email,
            recipient_email,
            application.full_name,
            application.duration,
            application.role_preference,
            application.college or ""
        )

    return application

