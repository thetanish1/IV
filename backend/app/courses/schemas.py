from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr

class CourseBase(BaseModel):
    title: str
    slug: str
    description: str
    price_inr: int
    duration: str
    level: str
    technologies: list[str] = []
    is_published: bool = True

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RegistrationCreate(BaseModel):
    course_id: int
    student_name: str
    student_email: EmailStr
    student_phone: str

class RegistrationResponse(BaseModel):
    id: int
    course_id: int
    student_name: str
    student_email: str
    student_phone: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
