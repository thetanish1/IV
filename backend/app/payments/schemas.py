from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr

class CreateOrderRequest(BaseModel):
    course_id: int
    student_name: str
    student_email: EmailStr
    student_phone: str

class CreateOrderResponse(BaseModel):
    order_id: str
    amount_inr: int
    currency: str = "INR"
    key_id: str
    registration_id: int

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    registration_id: int

class PaymentResponse(BaseModel):
    id: int
    registration_id: Optional[int] = None
    order_id: str
    payment_id: Optional[str] = None
    amount_inr: int
    status: str
    student_email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
