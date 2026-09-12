import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["DATABASE_URL"] = "sqlite:///./test_app.db"

from app.main import app
from app.shared.database import Base, get_db
from app.auth.user_models import SiteUser

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_app.db"
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
    from app.seed import seed_db
    seed_db()
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert "X-Request-ID" in response.headers

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "version" in data
    assert "X-Request-ID" in response.headers

def test_get_courses():
    response = client.get("/api/courses")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_admin_login():
    response = client.post(
        "/api/auth/login",
        data={"username": "admin@internvision.tech", "password": "Admin@123456"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_submit_application():
    payload = {
        "full_name": "Test Applicant",
        "email": "applicant@test.com",
        "phone": "+91 9999999999",
        "college": "Test College of Engineering",
        "degree": "B.Tech CSE",
        "year_of_study": "3rd Year",
        "skills": ["Python", "FastAPI"],
        "duration": "3 Months"
    }
    response = client.post("/api/applications", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Test Applicant"
    assert data["duration"] == "3 Months"

def test_admin_stats_protected():
    login_res = client.post(
        "/api/auth/login",
        data={"username": "admin@internvision.tech", "password": "Admin@123456"}
    )
    token = login_res.json()["access_token"]

    stats_res = client.get(
        "/api/admin/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_revenue_inr" in stats
    assert "total_applications" in stats


def test_health_live():
    response = client.get("/health/live")
    assert response.status_code == 200
    assert response.json()["status"] == "alive"

def test_health_ready():
    response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"
    assert response.json()["database"] == "connected"

def test_user_register_does_not_store_plaintext_password():
    response = client.post(
        "/api/auth/user/register",
        json={
            "email": "newuser@example.com",
            "password": "Str0ngPass!123",
            "full_name": "New User"
        }
    )
    assert response.status_code == 200

    user = TestingSessionLocal().query(SiteUser).filter(SiteUser.email == "newuser@example.com").first()
    assert user is not None
    assert getattr(user, "raw_password", None) is None
    assert user.hashed_password != "Str0ngPass!123"

def test_resume_proxy_blocks_internal_hosts():
    # Loopback localhost check
    response = client.get("/api/applications/resume-proxy?url=http://127.0.0.1:8000/api/health")
    assert response.status_code == 403

def test_excel_export():
    login_res = client.post(
        "/api/auth/login",
        data={"username": "admin@internvision.tech", "password": "Admin@123456"}
    )
    token = login_res.json()["access_token"]

    export_res = client.get(
        "/api/admin/export/applications",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert export_res.status_code == 200
    assert export_res.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert len(export_res.content) > 0
