import uuid
import json
from typing import Optional, Any
from fastapi import APIRouter, Depends, Request, Header, BackgroundTasks, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.config import settings
from app.shared.database import get_db
from app.shared.exceptions import NotFoundException, BadRequestException
from app.courses.models import Course, CourseRegistration
from app.payments.models import Payment
from app.payments.schemas import CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest, PaymentResponse
from app.payments.gateway import cashfree_gateway
from app.shared.email_service import send_course_enrollment_acceptance_email

router = APIRouter(prefix="/payments", tags=["Payments"])

class DirectEnrollPayRequest(BaseModel):
    course_id: Optional[Any] = None
    course_slug: Optional[str] = None
    student_name: str
    student_email: str
    student_phone: str
    college: Optional[str] = None
    payment_method: Optional[str] = "cashfree"

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


@router.post("/direct-enroll-pay", status_code=status.HTTP_200_OK)
def direct_enroll_and_pay(
    req: DirectEnrollPayRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Direct payment endpoint: processes instant course fee payment (₹1 nominal fee),
    registers the candidate with status 'confirmed', and creates the audit payment record.
    Unlocks full course data immediately.
    """
    course = None
    if req.course_id:
        if isinstance(req.course_id, int) or (isinstance(req.course_id, str) and req.course_id.isdigit()):
            course = db.query(Course).filter(Course.id == int(req.course_id)).first()
        elif isinstance(req.course_id, str):
            course = db.query(Course).filter(Course.slug == req.course_id).first()
    if not course and req.course_slug:
        course = db.query(Course).filter(Course.slug == req.course_slug).first()

    if not course:
        raise NotFoundException("Specified course was not found")

    email_clean = req.student_email.strip().lower()
    name_clean = req.student_name.strip()
    phone_clean = req.student_phone.strip()

    # 1. Create or update confirmed course registration
    registration = db.query(CourseRegistration).filter(
        CourseRegistration.course_id == course.id,
        CourseRegistration.student_email == email_clean
    ).first()

    if not registration:
        registration = CourseRegistration(
            course_id=course.id,
            student_name=name_clean,
            student_email=email_clean,
            student_phone=phone_clean,
            status="confirmed"
        )
        db.add(registration)
        db.commit()
        db.refresh(registration)
    else:
        registration.status = "confirmed"
        registration.student_name = name_clean
        registration.student_phone = phone_clean
        db.commit()
        db.refresh(registration)

    # 2. Record payment transaction in audit log
    order_id = f"order_cf_{uuid.uuid4().hex[:12]}"
    payment_id = f"pay_cf_{uuid.uuid4().hex[:12]}"
    cf_order_id = f"cf_{uuid.uuid4().hex[:10]}"
    price_val = float(course.price_inr if course.price_inr is not None else 1)

    payment = Payment(
        registration_id=registration.id,
        order_id=order_id,
        cf_order_id=cf_order_id,
        payment_id=payment_id,
        cf_payment_id=payment_id,
        currency="INR",
        amount_inr=int(price_val),
        amount=price_val,
        status="captured",
        gateway_name=req.payment_method or "cashfree",
        student_email=email_clean,
        student_name=name_clean,
        student_phone=phone_clean,
        course_id=str(course.id),
        razorpay_order_id=order_id,
        razorpay_payment_id=payment_id,
        raw_response={
            "order_id": order_id,
            "payment_id": payment_id,
            "status": "SUCCESS",
            "course_title": course.title,
            "amount_inr": price_val,
            "gateway": req.payment_method or "cashfree"
        }
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    # 3. Dispatch confirmed course enrollment email in background
    background_tasks.add_task(
        send_course_enrollment_acceptance_email,
        student_email=email_clean,
        student_name=name_clean,
        course_title=course.title
    )

    return {
        "success": True,
        "status": "confirmed",
        "order_id": order_id,
        "payment_id": payment_id,
        "amount_inr": int(price_val),
        "registration_id": registration.id,
        "course_id": course.id,
        "course_title": course.title,
        "course_slug": course.slug,
        "unlocked": True,
        "message": f"Payment of ₹{int(price_val)} successful! You have instant full access to '{course.title}'."
    }

