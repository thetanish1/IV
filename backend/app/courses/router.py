from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.shared.database import get_db
from app.shared.exceptions import NotFoundException, BadRequestException
from app.shared.dependencies import get_current_admin
from app.auth.models import Admin
from app.courses.models import Course
from app.courses.schemas import CourseCreate, CourseResponse

router = APIRouter(prefix="/courses", tags=["Courses"])

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

