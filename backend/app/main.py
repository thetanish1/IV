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
from app.internship.portal_router import router as portal_router
from app.mailer.router import router as mailer_router
from app.certificates.models import Certificate
from app.mailer.models import SentEmail
from app.shared.contact_models import ContactQuery
from app.shared.contact_router import router as contact_router

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
        # Check / add missing IAM columns to admins table for existing SQLite/Postgres DBs
        for col_def in [
            "ALTER TABLE admins ADD COLUMN role VARCHAR(50) DEFAULT 'super_admin'",
            "ALTER TABLE admins ADD COLUMN permissions JSON DEFAULT '[]'",
            "ALTER TABLE admins ADD COLUMN created_by VARCHAR(255)"
        ]:
            try:
                db.execute(text(col_def))
                db.commit()
            except Exception:
                db.rollback()

        all_modules = [
            "overview", "applications", "submissions", "unlocks", "doubts",
            "users", "enrollments", "payments", "certificates", "contacts",
            "mailer", "settings"
        ]

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
                    is_active=True,
                    role="super_admin",
                    permissions=all_modules,
                )
                db.add(new_admin)
            else:
                if not admin.role:
                    admin.role = "super_admin"
                if not admin.permissions or len(admin.permissions) == 0:
                    admin.permissions = all_modules

        # Ensure all existing admins without role default to super_admin
        existing_admins = db.query(Admin).all()
        for a in existing_admins:
            if not getattr(a, "role", None):
                a.role = "super_admin"
            if not getattr(a, "permissions", None) or len(a.permissions) == 0:
                a.permissions = all_modules
        db.commit()

        # Seed all 7 standard bootcamps if not in database
        from app.courses.models import Course
        all_bootcamps = [
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
                title="Data Science & AI Bootcamp",
                slug="data-science-ai",
                description="Master statistical modeling, Exploratory Data Analysis (EDA), machine learning pipelines, Scikit-Learn, deep learning with TensorFlow, and data visualization.",
                price_inr=0,
                duration="10 Weeks",
                level="Intermediate",
                technologies=["Python", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "Tableau"],
                is_published=True
            ),
            Course(
                title="Java Programming & Core Engineering",
                slug="java-programming",
                description="Master Core Java 21, Object-Oriented Programming (OOP), Data Structures & Algorithms (DSA), multithreading, and enterprise Spring Boot microservices.",
                price_inr=0,
                duration="8 Weeks",
                level="Beginner",
                technologies=["Java 21", "Spring Boot", "OOP", "DSA", "Hibernate", "MySQL"],
                is_published=True
            ),
            Course(
                title="Android App Development Bootcamp",
                slug="android-app-development",
                description="Build high-performance native Android apps with Kotlin, declarative Jetpack Compose UI, MVVM architecture, Coroutines, Retrofit, and Firebase.",
                price_inr=0,
                duration="8 Weeks",
                level="Intermediate",
                technologies=["Kotlin", "Jetpack Compose", "Android Studio", "Coroutines", "Retrofit", "Firebase"],
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
        for course_item in all_bootcamps:
            existing = db.query(Course).filter(Course.slug == course_item.slug).first()
            if not existing:
                db.add(course_item)

        # Seed sample verified certificates if none exist
        if db.query(Certificate).count() == 0:
            sample_certs = [
                Certificate(
                    certificate_id="IVT/JUN26/2026/0201",
                    student_name="Tanish Dewase",
                    student_email="tanishdewase222@gmail.com",
                    program_title="Java Developer",
                    track_type="Virtual Internship",
                    duration="1 Month",
                    issue_date="30 June 2026",
                    grade="Distinction (Grade A+)",
                    skills_acquired=["Java", "SQL", "GitHub", "Git", "Docker"],
                    instructor_name="Suraj Kumar, HR & Manager",
                    is_valid=True
                ),
                Certificate(
                    certificate_id="IVT/JUN26/2026/0202",
                    student_name="Neha Mahule",
                    student_email="nehamahule28@gmail.com",
                    program_title="Web Developer",
                    track_type="Virtual Internship",
                    duration="1 Month",
                    issue_date="30 June 2026",
                    grade="Distinction (Grade A+)",
                    skills_acquired=["Basic HTML", "CSS", "JavaScript", "Git"],
                    instructor_name="Suraj Kumar, HR & Manager",
                    is_valid=True
                ),
                Certificate(
                    certificate_id="IVT/JUN26/2026/0203",
                    student_name="Jay Doble",
                    student_email="jaydoble56@gmail.com",
                    program_title="Java Developer",
                    track_type="Virtual Internship",
                    duration="1 Month",
                    issue_date="30 June 2026",
                    grade="Distinction (Grade A+)",
                    skills_acquired=["Java", "SQL", "GitHub", "Git", "Docker"],
                    instructor_name="Suraj Kumar, HR & Manager",
                    is_valid=True
                ),
                Certificate(
                    certificate_id="IVT/JUN26/2026/0204",
                    student_name="Paridhi Kshirsagar",
                    student_email="paridhikshirsagar16@gmail.com",
                    program_title="Java Developer",
                    track_type="Virtual Internship",
                    duration="1 Month",
                    issue_date="30 June 2026",
                    grade="Distinction (Grade A+)",
                    skills_acquired=["Java", "SQL", "GitHub", "Git", "Docker"],
                    instructor_name="Suraj Kumar, HR & Manager",
                    is_valid=True
                ),
            ]
            db.add_all(sample_certs)

        db.commit()
    finally:
        db.close()

from fastapi import Request
from fastapi.responses import JSONResponse, Response

# Add custom Request Logging & ID Middleware first (inner)
app.add_middleware(LoggingAndRequestIDMiddleware)

# Add CORS Middleware last so it wraps all requests & error responses (outer)
origins = [
    "https://iv-theta.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "https://internvision.tech",
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

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure CORS headers are attached even if an unhandled internal exception occurs."""
    origin = request.headers.get("origin") or "https://iv-theta.vercel.app"
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Feature Routers mounted under /api and root for total path compatibility
for r in [auth_router, courses_router, internship_router, portal_router, payments_router, dashboard_router, export_router, certificates_router, mailer_router, contact_router]:
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

@app.get("/settings")
@app.get("/api/settings")
def get_public_settings(db: Session = Depends(get_db)):
    from app.shared.settings_models import SiteSetting
    rows = db.query(SiteSetting).all()
    settings_dict = {
        "show_courses": False,
        "show_careers": False,
    }
    for r in rows:
        settings_dict[r.key] = r.value.lower() == "true"
    return settings_dict

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

