from typing import Optional, Any, Union
from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.shared.database import get_db
from app.shared.exceptions import NotFoundException, BadRequestException
from app.shared.dependencies import get_current_admin
from app.shared.email_service import send_course_enrollment_request_received_email
from app.auth.models import Admin
from app.courses.models import Course, CourseRegistration
from app.courses.schemas import CourseCreate, CourseResponse, RegistrationResponse

router = APIRouter(prefix="/courses", tags=["Courses"])

class FreeEnrollmentRequest(BaseModel):
    course_id: Optional[Any] = None
    course_slug: Optional[str] = None
    student_name: str
    student_email: str
    student_phone: str
    college: Optional[str] = None

@router.get("", response_model=list[CourseResponse])
def get_courses(
    search: Optional[str] = None,
    level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Course).filter(Course.is_published == True)
    if search:
        query = query.filter(Course.title.ilike(f"%{search}%") | Course.description.ilike(f"%{search}%"))
    if level and level != "all":
        query = query.filter(Course.level == level)
    return query.all()

@router.post("/enroll", status_code=status.HTTP_201_CREATED)
@router.post("/enroll/", status_code=status.HTTP_201_CREATED)
@router.post("/enroll-free", status_code=status.HTTP_201_CREATED)
@router.post("/enroll-free/", status_code=status.HTTP_201_CREATED)
@router.post("/courses/enroll", status_code=status.HTTP_201_CREATED)
@router.post("/courses/enroll/", status_code=status.HTTP_201_CREATED)
def enroll_in_course_free(
    req: FreeEnrollmentRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Submits a free course enrollment request.
    Status is set to 'pending' for admin review.
    Sends confirmation email to the student upon submission.
    """
    course = None
    if req.course_id:
        if isinstance(req.course_id, int) or (isinstance(req.course_id, str) and req.course_id.isdigit()):
            course = db.query(Course).filter(Course.id == int(req.course_id)).first()
        elif isinstance(req.course_id, str):
            course = db.query(Course).filter(Course.slug == req.course_id).first()
    if not course and req.course_slug:
        course = db.query(Course).filter(Course.slug == req.course_slug).first()
    
    if not course:
        raise NotFoundException("Specified course was not found")

    reg = CourseRegistration(
        course_id=course.id,
        student_name=req.student_name.strip(),
        student_email=req.student_email.strip().lower(),
        student_phone=req.student_phone.strip(),
        status="pending",
    )
    db.add(reg)
    db.commit()
    db.refresh(reg)

    # Trigger async confirmation email
    background_tasks.add_task(
        send_course_enrollment_request_received_email,
        reg.student_email,
        reg.student_name,
        course.title
    )

    return {
        "success": True,
        "message": f"Free enrollment request for '{course.title}' submitted successfully. Our team will review your application.",
        "registration_id": reg.id,
        "course_title": course.title,
        "status": "pending"
    }

@router.get("/{course_identifier}", response_model=CourseResponse)
def get_course(course_identifier: str, db: Session = Depends(get_db)):
    course = None
    if course_identifier.isdigit():
        course = db.query(Course).filter(Course.id == int(course_identifier)).first()
    if not course:
        course = db.query(Course).filter(Course.slug == course_identifier).first()
    
    if not course:
        raise NotFoundException("Course not found")
    return course

from app.payments.schemas import CreateOrderRequest, CreateOrderResponse
from app.payments.router import create_payment_order

@router.post("/register", response_model=CreateOrderResponse, status_code=status.HTTP_201_CREATED)
def register_for_course(req: CreateOrderRequest, db: Session = Depends(get_db)):
    return create_payment_order(req, db)

@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    existing = db.query(Course).filter(Course.slug == course_in.slug).first()
    if existing:
        raise BadRequestException("Course slug already exists")
    
    course = Course(**course_in.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


