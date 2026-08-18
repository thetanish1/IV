import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.shared.database import get_db
from app.shared.exceptions import NotFoundException, BadRequestException
from app.courses.models import Course, CourseRegistration
from app.payments.models import Payment
from app.payments.schemas import CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest, PaymentResponse
from app.payments.gateway import razorpay_gateway

RAZORPAY_KEY_ID = settings.RAZORPAY_KEY_ID

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/create-order", response_model=CreateOrderResponse)
def create_payment_order(req: CreateOrderRequest, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == req.course_id).first()
    if not course:
        raise NotFoundException("Course not found")

    registration = CourseRegistration(
        course_id=course.id,
        student_name=req.student_name,
        student_email=req.student_email,
        student_phone=req.student_phone,
        status="pending"
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)

    receipt_id = f"rcpt_reg_{registration.id}_{uuid.uuid4().hex[:6]}"
    order_data = razorpay_gateway.create_order(amount_inr=course.price_inr, receipt_id=receipt_id)
    order_id = order_data.get("id")

    payment = Payment(
        registration_id=registration.id,
        order_id=order_id,
        amount_inr=course.price_inr,
        status="created",
        student_email=req.student_email,
        raw_response=order_data
    )
    db.add(payment)
    db.commit()

    return CreateOrderResponse(
        order_id=order_id,
        amount_inr=course.price_inr,
        currency="INR",
        key_id=RAZORPAY_KEY_ID,
        registration_id=registration.id
    )

@router.post("/verify", response_model=PaymentResponse)
def verify_payment(req: VerifyPaymentRequest, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.order_id == req.razorpay_order_id).first()
    if not payment:
        raise NotFoundException("Payment order not found")

    is_valid = razorpay_gateway.verify_signature(
        razorpay_order_id=req.razorpay_order_id,
        razorpay_payment_id=req.razorpay_payment_id,
        razorpay_signature=req.razorpay_signature
    )

    if not is_valid:
        payment.status = "failed"
        db.commit()
        raise BadRequestException("Invalid Razorpay signature verification failed")

    payment.payment_id = req.razorpay_payment_id
    payment.signature = req.razorpay_signature
    payment.status = "captured"
    
    if payment.registration_id:
        registration = db.query(CourseRegistration).filter(CourseRegistration.id == payment.registration_id).first()
        if registration:
            registration.status = "confirmed"

    db.commit()
    db.refresh(payment)

    return payment
