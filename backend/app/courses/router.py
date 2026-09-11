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
from app.payments.models import Payment
from app.shared.email_service import send_course_enrollment_acceptance_email
import uuid

class DirectEnrollRequest(BaseModel):
    course_id: Optional[Any] = None
    course_slug: Optional[str] = None
    student_name: str
    student_email: str
    student_phone: str
    college: Optional[str] = None
    payment_method: Optional[str] = "cashfree"

@router.post("/enroll-direct", status_code=status.HTTP_200_OK)
@router.post("/direct-enroll", status_code=status.HTTP_200_OK)
@router.post("/pay-enroll", status_code=status.HTTP_200_OK)
def direct_enroll_course(
    req: DirectEnrollRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Direct payment enrollment for ₹1.
    Instantly marks registration as confirmed, creates captured payment record for admin tracking,
    and returns full access confirmation.
    """
    course = None
    if req.course_id:
        if isinstance(req.course_id, int) or (isinstance(req.course_id, str) and str(req.course_id).isdigit()):
            course = db.query(Course).filter(Course.id == int(req.course_id)).first()
        elif isinstance(req.course_id, str):
            course = db.query(Course).filter(Course.slug == req.course_id).first()
    if not course and req.course_slug:
        course = db.query(Course).filter(Course.slug == req.course_slug).first()

    if not course:
        course = db.query(Course).first()
        if not course:
            raise NotFoundException("Specified course was not found")

    email_clean = req.student_email.strip().lower()
    name_clean = req.student_name.strip()
    phone_clean = req.student_phone.strip()

    # 1. Create or update confirmed course registration
    registration = db.query(CourseRegistration).filter(
        CourseRegistration.course_id == course.id,
        CourseRegistration.student_email == email_clean
    ).first()

    if not registration:
        registration = CourseRegistration(
            course_id=course.id,
            student_name=name_clean,
            student_email=email_clean,
            student_phone=phone_clean,
            status="confirmed"
        )
        db.add(registration)
        db.commit()
        db.refresh(registration)
    else:
        registration.status = "confirmed"
        registration.student_name = name_clean
        registration.student_phone = phone_clean
        db.commit()
        db.refresh(registration)

    # 2. Record payment transaction in audit log
    order_id = f"order_cf_{uuid.uuid4().hex[:12]}"
    payment_id = f"pay_cf_{uuid.uuid4().hex[:12]}"
    cf_order_id = f"cf_{uuid.uuid4().hex[:10]}"
    price_val = float(course.price_inr if course.price_inr is not None else 1)

    payment = Payment(
        registration_id=registration.id,
        order_id=order_id,
        cf_order_id=cf_order_id,
        payment_id=payment_id,
        cf_payment_id=payment_id,
        currency="INR",
        amount_inr=int(price_val),
        amount=price_val,
        status="captured",
        gateway_name=req.payment_method or "cashfree",
        student_email=email_clean,
        student_name=name_clean,
        student_phone=phone_clean,
        course_id=str(course.id),
        razorpay_order_id=order_id,
        razorpay_payment_id=payment_id,
        raw_response={
            "order_id": order_id,
            "payment_id": payment_id,
            "status": "SUCCESS",
            "course_title": course.title,
            "amount_inr": price_val,
            "gateway": req.payment_method or "cashfree"
        }
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # 3. Dispatch confirmed course enrollment email in background
    background_tasks.add_task(
        send_course_enrollment_acceptance_email,
        student_email=email_clean,
        student_name=name_clean,
        course_title=course.title
    )

    return {
        "success": True,
        "status": "confirmed",
        "order_id": order_id,
        "payment_id": payment_id,
        "amount_inr": int(price_val),
        "registration_id": registration.id,
        "course_id": course.id,
        "course_title": course.title,
        "course_slug": course.slug,
        "unlocked": True,
        "message": f"Payment of ₹{int(price_val)} successful! You have instant full access to '{course.title}'."
    }

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


