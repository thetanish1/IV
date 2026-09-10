import uuid
import json
from fastapi import APIRouter, Depends, Request, Header
from sqlalchemy.orm import Session
from app.core.config import settings
from app.shared.database import get_db
from app.shared.exceptions import NotFoundException, BadRequestException
from app.courses.models import Course, CourseRegistration
from app.payments.models import Payment
from app.payments.schemas import CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest, PaymentResponse
from app.payments.gateway import cashfree_gateway

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/create-order", response_model=CreateOrderResponse)
def create_payment_order(req: CreateOrderRequest, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == req.course_id).first()
    if not course:
        raise NotFoundException("Course not found")

    registration = CourseRegistration(
        course_id=course.id,
        student_name=req.student_name.strip(),
        student_email=req.student_email.strip().lower(),
        student_phone=req.student_phone.strip(),
        status="pending"
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)

    receipt_id = f"rcpt_reg_{registration.id}_{uuid.uuid4().hex[:6]}"
    
    order_data = cashfree_gateway.create_order(
        amount_inr=float(course.price_inr or 0),
        customer_id=f"cust_{registration.id}_{uuid.uuid4().hex[:4]}",
        customer_email=req.student_email.strip().lower(),
        customer_phone=req.student_phone.strip(),
        customer_name=req.student_name.strip(),
        order_note=f"InternVision Course: {course.title} (Registration #{registration.id})"
    )
    
    order_id = order_data.get("order_id")
    payment_session_id = order_data.get("payment_session_id")
    cf_order_id = str(order_data.get("cf_order_id", ""))

    payment = Payment(
        registration_id=registration.id,
        order_id=order_id,
        cf_order_id=cf_order_id,
        payment_session_id=payment_session_id,
        currency="INR",
        amount_inr=course.price_inr,
        amount=float(course.price_inr or 0),
        status="created",
        gateway_name="cashfree",
        student_email=req.student_email.strip().lower(),
        student_name=req.student_name.strip(),
        student_phone=req.student_phone.strip(),
        course_id=str(course.id),
        razorpay_order_id=order_id,
        raw_response=order_data.get("raw") or order_data
    )
    db.add(payment)
    db.commit()

    return CreateOrderResponse(
        order_id=order_id,
        payment_session_id=payment_session_id,
        cf_order_id=cf_order_id,
        amount_inr=course.price_inr,
        currency="INR",
        environment=settings.CASHFREE_ENVIRONMENT or "sandbox",
        key_id=settings.CASHFREE_APP_ID,
        registration_id=registration.id
    )

@router.post("/verify", response_model=PaymentResponse)
def verify_payment(req: VerifyPaymentRequest, db: Session = Depends(get_db)):
    target_order_id = req.order_id or req.razorpay_order_id
    if not target_order_id:
        raise BadRequestException("Missing order_id in verification payload")

    payment = db.query(Payment).filter(Payment.order_id == target_order_id).first()
    if not payment:
        raise NotFoundException(f"Payment order '{target_order_id}' not found")

    target_payment_id = req.payment_id or req.razorpay_payment_id or f"cf_pay_{uuid.uuid4().hex[:10]}"
    target_signature = req.signature or req.razorpay_signature

    is_valid = cashfree_gateway.verify_signature(
        order_id=target_order_id,
        payment_id=target_payment_id,
        signature=target_signature
    )

    if not is_valid:
        payment.status = "failed"
        db.commit()
        raise BadRequestException("Invalid Cashfree payment verification failed")

    payment.payment_id = target_payment_id
    payment.cf_payment_id = target_payment_id
    payment.signature = target_signature
    payment.status = "captured"
    
    if payment.registration_id:
        registration = db.query(CourseRegistration).filter(CourseRegistration.id == payment.registration_id).first()
        if registration:
            registration.status = "confirmed"

    db.commit()
    db.refresh(payment)

    return payment

@router.post("/webhook")
async def cashfree_webhook(
    request: Request,
    x_webhook_timestamp: str = Header(None),
    x_webhook_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Cashfree Webhook Handler for automated payment confirmation.
    """
    raw_body = await request.body()
    body_str = raw_body.decode("utf-8")

    # If signature headers are present, verify
    if x_webhook_timestamp and x_webhook_signature:
        if not cashfree_gateway.verify_webhook(body_str, x_webhook_timestamp, x_webhook_signature):
            raise BadRequestException("Webhook signature verification failed")

    try:
        event_data = json.loads(body_str)
    except Exception:
        raise BadRequestException("Invalid JSON webhook body")

    data = event_data.get("data", {})
    order_info = data.get("order", {})
    payment_info = data.get("payment", {})
    
    order_id = order_info.get("order_id") or data.get("order_id")
    payment_status = payment_info.get("payment_status") or data.get("payment_status")
    cf_payment_id = payment_info.get("cf_payment_id") or data.get("cf_payment_id")

    if order_id:
        payment = db.query(Payment).filter(Payment.order_id == order_id).first()
        if payment:
            if payment_status == "SUCCESS":
                payment.status = "captured"
                payment.cf_payment_id = str(cf_payment_id or "")
                payment.payment_id = str(cf_payment_id or "")
                if payment.registration_id:
                    reg = db.query(CourseRegistration).filter(CourseRegistration.id == payment.registration_id).first()
                    if reg:
                        reg.status = "confirmed"
            elif payment_status in ["FAILED", "USER_DROPPED", "CANCELLED"]:
                payment.status = "failed"
            db.commit()

    return {"status": "ok", "received": True}
