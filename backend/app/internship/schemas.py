from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr

class ApplicationCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    college: str
    degree: str
    year_of_study: str
    skills: list[str]
    duration: str

class ApplicationResponse(ApplicationCreate):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
