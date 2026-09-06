from datetime import datetime, timezone
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.middleware import LoggingAndRequestIDMiddleware
from app.auth.models import Admin
from app.auth.user_models import SiteUser  # ensures site_users table is created

from app.shared.security import get_password_hash
from app.shared.database import Base, engine, get_db, SessionLocal
from app.auth.router import router as auth_router
from app.courses.router import router as courses_router
from app.internship.router import router as internship_router
from app.payments.router import router as payments_router
from app.dashboard.router import router as dashboard_router
from app.export.router import router as export_router
from app.certificates.router import router as certificates_router
from app.certificates.models import Certificate

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/api/openapi.json"
)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        admins_to_seed = [
            ("tanishdewase222@gmail.com", "Tanish Dewase (Admin)"),
            ("admin@internvision.tech", "InternVision Admin")
        ]
        for email, name in admins_to_seed:
            admin = db.query(Admin).filter(Admin.email == email).first()
            if not admin:
                new_admin = Admin(
                    email=email,
                    hashed_password=get_password_hash("Admin@123456"),
                    full_name=name,
                    is_active=True
                )
                db.add(new_admin)

        # Seed sample courses if none exist
        from app.courses.models import Course
        if db.query(Course).count() == 0:
            sample_courses = [
                Course(
                    title="Full Stack Web Development Bootcamp",
                    slug="full-stack-web-development",
                    description="Master modern web development using Next.js 15, React 19, TypeScript, FastAPI, and PostgreSQL. Build production applications from scratch.",
                    price_inr=0,
                    duration="8 Weeks",
                    level="Intermediate",
                    technologies=["Next.js", "React", "TypeScript", "FastAPI", "PostgreSQL"],
                    is_published=True
                ),
                Course(
                    title="AI & Machine Learning Engineering",
                    slug="ai-machine-learning-engineering",
                    description="Deep dive into Neural Networks, LLMs, LangChain, RAG architecture, PyTorch, and fine-tuning open-source models for enterprise AI systems.",
                    price_inr=0,
                    duration="12 Weeks",
                    level="Advanced",
                    technologies=["Python", "PyTorch", "OpenAI API", "LangChain", "Vector DBs"],
                    is_published=True
                ),
                Course(
                    title="Cloud DevOps & Kubernetes Mastery",
                    slug="cloud-devops-kubernetes-mastery",
                    description="Architect high-availability infrastructure with Docker, Kubernetes, Terraform, AWS, and production CI/CD automation pipelines.",
                    price_inr=0,
                    duration="10 Weeks",
                    level="Intermediate",
                    technologies=["Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions"],
                    is_published=True
                ),
                Course(
                    title="Cyber Security & Ethical Hacking",
                    slug="cyber-security-ethical-hacking",
                    description="Understand network security, penetration testing, cryptography, web vulnerability assessment, and defensive security strategies.",
                    price_inr=0,
                    duration="8 Weeks",
                    level="Beginner",
                    technologies=["Linux", "Metasploit", "Wireshark", "Burp Suite", "Python"],
                    is_published=True
                )
            ]
            db.add_all(sample_courses)

        # Seed sample verified certificates if none exist
        if db.query(Certificate).count() == 0:
            sample_certs = [
                Certificate(
                    certificate_id="IVT-2026-FS-8492",
                    student_name="Aarav Sharma",
                    student_email="aarav.sharma@example.com",
                    program_title="Full Stack Web Development Co-Op",
                    track_type="Internship",
                    duration="3 Months",
                    issue_date="August 15, 2026",
                    grade="Distinction (Grade A+)",
                    skills_acquired=["Next.js 15", "React 19", "TypeScript", "FastAPI", "PostgreSQL", "Tailwind CSS"],
                    instructor_name="Tanish Dewase, Lead Architect & Academic Director",
                    is_valid=True
                ),
                Certificate(
                    certificate_id="IVT-2026-AIML-5521",
                    student_name="Ananya Verma",
                    student_email="ananya.verma@example.com",
                    program_title="AI & Machine Learning Engineering Track",
                    track_type="Bootcamp",
                    duration="12 Weeks",
                    issue_date="August 20, 2026",
                    grade="Excellence (Grade O)",
                    skills_acquired=["Python", "PyTorch", "LLM APIs", "LangChain", "RAG Systems", "Vector DBs"],
                    instructor_name="InternVision Tech AI Research Group",
                    is_valid=True
                ),
                Certificate(
                    certificate_id="IVT-2026-DO-9104",
                    student_name="Rohan Kulkarni",
                    student_email="rohan.kulkarni@example.com",
                    program_title="Cloud DevOps & Kubernetes Mastery",
                    track_type="Internship",
                    duration="6 Months Industrial Co-Op",
                    issue_date="August 28, 2026",
                    grade="Distinction (Grade A+)",
                    skills_acquired=["Docker", "Kubernetes", "AWS Cloud", "Terraform", "CI/CD Pipelines", "Linux"],
                    instructor_name="Tanish Dewase, Lead Architect",
                    is_valid=True
                ),
                Certificate(
                    certificate_id="IVT-2026-CS-3382",
                    student_name="Priya Patel",
                    student_email="priya.patel@example.com",
                    program_title="Cyber Security & Ethical Hacking Track",
                    track_type="Bootcamp",
                    duration="8 Weeks",
                    issue_date="September 01, 2026",
                    grade="Merit (Grade A)",
                    skills_acquired=["Penetration Testing", "Wireshark", "Burp Suite", "OWASP Top 10", "Network Security"],
                    instructor_name="InternVision Tech Security Operations",
                    is_valid=True
                ),
            ]
            db.add_all(sample_certs)

        db.commit()
    finally:
        db.close()

from fastapi.responses import JSONResponse, Response

# Configurable CORS Policy
origins = [
    "https://iv-theta.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Custom Request Logging & ID Middleware
app.add_middleware(LoggingAndRequestIDMiddleware)

# Catch-all OPTIONS preflight route
@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )

# Feature Routers mounted under /api and root for total path compatibility
for r in [auth_router, courses_router, internship_router, payments_router, dashboard_router, export_router, certificates_router]:
    app.include_router(r, prefix="/api")
    app.include_router(r)


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "online",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)

