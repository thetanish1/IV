from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

class SessionBase(BaseModel):
    title: str
    slug: Optional[str] = None
    description: str
    key_takeaways: Optional[List[str]] = []
    session_date: str
    session_time: str
    duration: str
    is_free: bool = True
    price_inr: int = 0
    thumbnail_url: Optional[str] = None
    instructor_name: Optional[str] = "InternVision Tech Team"
    instructor_role: Optional[str] = "Senior Technical Mentor"
    instructor_avatar: Optional[str] = None
    meeting_platform: Optional[str] = "Google Meet"
    meeting_link: Optional[str] = None
    max_seats: Optional[int] = 150
    category: Optional[str] = "Technical Workshop"
    tags: Optional[List[str]] = []
    is_published: bool = True

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    key_takeaways: Optional[List[str]] = None
    session_date: Optional[str] = None
    session_time: Optional[str] = None
    duration: Optional[str] = None
    is_free: Optional[bool] = None
    price_inr: Optional[int] = None
    thumbnail_url: Optional[str] = None
    instructor_name: Optional[str] = None
    instructor_role: Optional[str] = None
    instructor_avatar: Optional[str] = None
    meeting_platform: Optional[str] = None
    meeting_link: Optional[str] = None
    max_seats: Optional[int] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None

class SessionResponse(SessionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    booking_count: Optional[int] = 0

    class Config:
        from_attributes = True

class SessionBookingCreate(BaseModel):
    session_id: Optional[int] = None
    session_slug: Optional[str] = None
    student_name: str
    student_email: str
    student_phone: str
    college_or_company: Optional[str] = None
    payment_method: Optional[str] = "direct"

class SessionBookingResponse(BaseModel):
    id: int
    session_id: int
    student_name: str
    student_email: str
    student_phone: str
    college_or_company: Optional[str] = None
    status: str
    ticket_code: str
    payment_id: Optional[str] = None
    amount_paid: float
    created_at: datetime
    session_title: Optional[str] = None
    session_date: Optional[str] = None
    session_time: Optional[str] = None
    duration: Optional[str] = None
    meeting_platform: Optional[str] = None

    class Config:
        from_attributes = True
