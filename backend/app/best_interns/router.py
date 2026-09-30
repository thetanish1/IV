import os
import uuid
import logging
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.shared.database import get_db
from app.shared.exceptions import NotFoundException, BadRequestException
from app.shared.dependencies import get_current_admin
from app.auth.models import Admin
from app.best_interns.models import BestIntern
from app.best_interns.schemas import (
    BestInternCreate,
    BestInternUpdate,
    BestInternResponse,
)
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/best-interns", tags=["Best Intern of the Month"])

# Local directory to store uploaded candidate photos
INTERN_IMG_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "interns")
os.makedirs(INTERN_IMG_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
}

# ─── Public Endpoints ─────────────────────────────────────────────────────────

@router.get("", response_model=List[BestInternResponse])
def get_best_interns(
    search: Optional[str] = None,
    course: Optional[str] = None,
    month: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all published Best Interns (Hall of Fame).
    Supports searching by name/college/project and filtering by track.
    """
    query = db.query(BestIntern).filter(BestIntern.is_published == True)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            BestIntern.student_name.ilike(search_fmt) |
            BestIntern.college.ilike(search_fmt) |
            BestIntern.project_name.ilike(search_fmt) |
            BestIntern.course.ilike(search_fmt)
        )

    if course and course.lower() != "all":
        query = query.filter(BestIntern.course.ilike(f"%{course.strip()}%"))

    if month and month.lower() != "all":
        query = query.filter(BestIntern.month_year.ilike(f"%{month.strip()}%"))

    # Return featured first, then newest
    return query.order_by(desc(BestIntern.is_featured), desc(BestIntern.id)).all()


@router.get("/featured", response_model=List[BestInternResponse])
def get_featured_best_interns(db: Session = Depends(get_db)):
    """
    Get all featured Best Interns for the Homepage Spotlight.
    Returns only entries explicitly marked as featured and published by admin.
    """
    featured = db.query(BestIntern).filter(
        BestIntern.is_published == True,
        BestIntern.is_featured == True
    ).order_by(desc(BestIntern.id)).all()

    return featured


@router.get("/{intern_id}", response_model=BestInternResponse)
def get_best_intern_by_id(intern_id: int, db: Session = Depends(get_db)):
    """
    Get single Best Intern detail by ID.
    """
    intern = db.query(BestIntern).filter(BestIntern.id == intern_id).first()
    if not intern or not intern.is_published:
        raise NotFoundException(f"Best Intern record #{intern_id} not found")
    return intern


@router.get("/photo/{filename}")
def get_intern_photo(filename: str):
    """
    Serve uploaded candidate photo.
    """
    file_path = os.path.join(INTERN_IMG_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Candidate photo not found")
    return FileResponse(file_path)


# ─── Admin Endpoints ─────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=List[BestInternResponse])
def admin_get_all_best_interns(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin: Get all Best Intern records (both published and drafts).
    """
    return db.query(BestIntern).order_by(desc(BestIntern.id)).all()


@router.post("/upload-photo")
async def upload_intern_photo(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin: Upload intern avatar / profile photo.
    Saves to local /uploads/interns or Cloudinary if configured.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise BadRequestException(f"Unsupported file type: {file.content_type}. Please upload PNG, JPG, WEBP, or GIF.")

    ext = os.path.splitext(file.filename or "")[1] or ".png"
    unique_filename = f"intern_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = os.path.join(INTERN_IMG_DIR, unique_filename)

    contents = await file.read()
    with open(dest_path, "wb") as f:
        f.write(contents)

    # Cloudinary backup if configured
    try:
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
            import cloudinary
            import cloudinary.uploader
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
                secure=True
            )
            res = cloudinary.uploader.upload(dest_path, folder="internvision/best_interns")
            if res and "secure_url" in res:
                return {"success": True, "url": res["secure_url"]}
    except Exception as e:
        logger.warning(f"Cloudinary upload skipped, fallback to local URL: {e}")

    return {"success": True, "url": f"/uploads/interns/{unique_filename}"}


@router.post("", response_model=BestInternResponse, status_code=status.HTTP_201_CREATED)
def create_best_intern(
    data: BestInternCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin: Create a new Best Intern of the Month entry.
    """
    # If this intern is set to featured, optionally unfeature previous if only single featured is preferred or keep multiple
    new_intern = BestIntern(
        student_name=data.student_name.strip(),
        student_email=data.student_email.strip() if data.student_email else None,
        course=data.course.strip(),
        month_year=data.month_year.strip(),
        award_title=data.award_title.strip() if data.award_title else "Best Intern of the Month",
        image_url=data.image_url,
        college=data.college.strip() if data.college else None,
        duration=data.duration or "1 Month",
        project_name=data.project_name.strip() if data.project_name else None,
        project_url=data.project_url.strip() if data.project_url else None,
        github_url=data.github_url.strip() if data.github_url else None,
        linkedin_url=data.linkedin_url.strip() if data.linkedin_url else None,
        achievement_summary=data.achievement_summary,
        testimonial=data.testimonial,
        grade=data.grade or "Distinction (A+)",
        rating=data.rating or 5.0,
        is_featured=bool(data.is_featured),
        is_published=bool(data.is_published),
    )
    db.add(new_intern)
    db.commit()
    db.refresh(new_intern)
    return new_intern


@router.put("/{intern_id}", response_model=BestInternResponse)
def update_best_intern(
    intern_id: int,
    data: BestInternUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin: Update existing Best Intern details.
    """
    intern = db.query(BestIntern).filter(BestIntern.id == intern_id).first()
    if not intern:
        raise NotFoundException(f"Best Intern #{intern_id} not found")

    update_dict = data.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(intern, k, v)

    db.commit()
    db.refresh(intern)
    return intern


@router.delete("/{intern_id}")
def delete_best_intern(
    intern_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin: Delete Best Intern record.
    """
    intern = db.query(BestIntern).filter(BestIntern.id == intern_id).first()
    if not intern:
        raise NotFoundException(f"Best Intern #{intern_id} not found")

    db.delete(intern)
    db.commit()
    return {"success": True, "message": f"Best Intern #{intern_id} removed successfully"}


@router.patch("/{intern_id}/toggle-featured")
def toggle_best_intern_featured(
    intern_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin: Toggle featured spotlight on homepage.
    """
    intern = db.query(BestIntern).filter(BestIntern.id == intern_id).first()
    if not intern:
        raise NotFoundException(f"Best Intern #{intern_id} not found")

    intern.is_featured = not intern.is_featured
    db.commit()
    db.refresh(intern)
    return {"success": True, "is_featured": intern.is_featured}


@router.patch("/{intern_id}/toggle-publish")
def toggle_best_intern_publish(
    intern_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin: Toggle public visibility.
    """
    intern = db.query(BestIntern).filter(BestIntern.id == intern_id).first()
    if not intern:
        raise NotFoundException(f"Best Intern #{intern_id} not found")

    intern.is_published = not intern.is_published
    db.commit()
    db.refresh(intern)
    return {"success": True, "is_published": intern.is_published}
