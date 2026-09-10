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
    payment_session_id: Optional[str] = None
    cf_order_id: Optional[str] = None
    amount_inr: int
    currency: str = "INR"
    environment: str = "sandbox"
    key_id: Optional[str] = ""
    registration_id: int

class VerifyPaymentRequest(BaseModel):
    order_id: Optional[str] = None
    payment_id: Optional[str] = None
    signature: Optional[str] = None
    registration_id: Optional[int] = None

    # Backwards-compatible aliases
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    registration_id: Optional[int] = None
    order_id: str
    payment_id: Optional[str] = None
    amount_inr: int
    status: str
    student_email: str
    gateway_name: Optional[str] = "cashfree"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
