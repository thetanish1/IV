from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class CertificateVerifyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    certificate_id: str
    student_name: str
    student_email: str
    program_title: str
    track_type: str
    duration: str
    issue_date: str
    grade: str
    skills_acquired: List[str] = []
    instructor_name: str
    is_valid: bool
    created_at: Optional[datetime] = None

class CertificateCreate(BaseModel):
    certificate_id: str
    student_name: str
    student_email: str
    program_title: str
    track_type: str = "Internship"
    duration: str
    issue_date: str
    grade: str = "Excellence"
    skills_acquired: List[str] = []
    instructor_name: Optional[str] = "InternVision Tech Academic Council"
