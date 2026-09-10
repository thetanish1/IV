import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["DATABASE_URL"] = "sqlite:///./test_payments.db"

from app.main import app
from app.shared.database import Base, get_db
from app.courses.models import Course

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_payments.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Create test course
    course = Course(
        id=1,
        title="Full Stack Bootcamp",
        slug="full-stack-bootcamp",
        description="Test Course",
        price_inr=1999,
        duration="8 Weeks",
        level="Intermediate",
        technologies=["Python", "FastAPI"]
    )
    db.add(course)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_cashfree_create_order():
    payload = {
        "course_id": 1,
        "student_name": "Cashfree Student",
        "student_email": "student@cashfree-test.com",
        "student_phone": "+91 9876543210"
    }
    response = client.post("/api/payments/create-order", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "order_id" in data
    assert "payment_session_id" in data
    assert data["amount_inr"] == 1999
    assert data["currency"] == "INR"

def test_cashfree_verify_payment():
    # 1. Create order
    payload = {
        "course_id": 1,
        "student_name": "Cashfree Student",
        "student_email": "student@cashfree-test.com",
        "student_phone": "+91 9876543210"
    }
    order_res = client.post("/api/payments/create-order", json=payload)
    order_id = order_res.json()["order_id"]

    # 2. Verify payment
    verify_payload = {
        "order_id": order_id,
        "payment_id": "cf_pay_123456",
        "signature": "mock_sig_valid"
    }
    verify_res = client.post("/api/payments/verify", json=verify_payload)
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert v_data["status"] == "captured"
    assert v_data["order_id"] == order_id
