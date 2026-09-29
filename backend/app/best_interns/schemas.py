from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class BestInternBase(BaseModel):
    student_name: str
    student_email: Optional[str] = None
    course: str
    month_year: str
    award_title: Optional[str] = "Best Intern of the Month"
    image_url: Optional[str] = None
    college: Optional[str] = None
    duration: Optional[str] = "1 Month"
    project_name: Optional[str] = None
    project_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    achievement_summary: Optional[str] = None
    testimonial: Optional[str] = None
    grade: Optional[str] = "Distinction (A+)"
    rating: Optional[float] = 5.0
    is_featured: Optional[bool] = False
    is_published: Optional[bool] = True

class BestInternCreate(BestInternBase):
    pass

class BestInternUpdate(BaseModel):
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    course: Optional[str] = None
    month_year: Optional[str] = None
    award_title: Optional[str] = None
    image_url: Optional[str] = None
    college: Optional[str] = None
    duration: Optional[str] = None
    project_name: Optional[str] = None
    project_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    achievement_summary: Optional[str] = None
    testimonial: Optional[str] = None
    grade: Optional[str] = None
    rating: Optional[float] = None
    is_featured: Optional[bool] = None
    is_published: Optional[bool] = None

class BestInternResponse(BestInternBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
