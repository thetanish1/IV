import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, status, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.shared.database import get_db
from app.shared.exceptions import BadRequestException
from app.internship.models import InternshipApplication
from app.internship.schemas import ApplicationCreate, ApplicationResponse

router = APIRouter(tags=["Internship Applications"])

# Directory to store uploaded resumes
RESUME_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "resumes")
os.makedirs(RESUME_DIR, exist_ok=True)

ALLOWED_RESUME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@router.post("/applications/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload a resume PDF/DOC file and return the stored filename."""
    if file.content_type not in ALLOWED_RESUME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOC, or DOCX files are accepted for resume upload."
        )

    ext = os.path.splitext(file.filename or "resume")[-1] or ".pdf"
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(RESUME_DIR, unique_filename)

    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    return {"filename": unique_filename, "original_name": file.filename}

from fastapi.responses import FileResponse

@router.get("/applications/resume/{filename}")
def get_resume_file(filename: str):
    """Serve or download uploaded resume file."""
    # Prevent directory traversal attacks
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
        filename=safe_filename
    )


@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
@router.post("/internships/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def submit_internship_application(app_in: ApplicationCreate, db: Session = Depends(get_db)):
    valid_durations = ["1 Month", "3 Months", "6 Months"]
    if app_in.duration not in valid_durations:
        raise BadRequestException(f"Invalid duration option '{app_in.duration}'. Must be one of {valid_durations}")

    application = InternshipApplication(**app_in.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application
