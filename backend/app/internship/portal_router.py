import math
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.shared.database import get_db
from app.internship.models import InternshipApplication, InternshipSubmission, TaskUnlockRequest, StudentDoubt
from app.shared.email_service import _send_smtp_email
from app.core.config import settings

router = APIRouter(prefix="/portal", tags=["Student Internship Portal"])

# ─── Domain Tasks Definition ──────────────────────────────────────────────────

DOMAIN_TASKS = {
    "full-stack": {
        "title": "Full Stack Web Development",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Modern UI Architecture & Responsive Component Trees",
                "objective": "Design and build a responsive, interactive component system using React / Next.js and Tailwind CSS with clean state management.",
                "deliverables": ["Component hierarchy", "Mobile-responsive layouts", "Clean state hooks", "GitHub repo setup with README"],
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "RESTful Backend Architecture & Database Relational Modeling",
                "objective": "Develop production REST APIs using FastAPI or Node.js, connect to PostgreSQL, and implement validation schemas & CRUD operations.",
                "deliverables": ["Relational DB Schema (PostgreSQL)", "Documented API endpoints (/docs)", "Pydantic/Zod data validation"],
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "JWT Authentication, State Store & Secure Protected Routing",
                "objective": "Implement secure authentication with JWT tokens / OAuth, route guards, session persistence, and cloud storage upload integration.",
                "deliverables": ["Token-based Auth flow", "Protected routes & middleware", "File/resume upload integration"],
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Production Deployment, CI/CD Pipelines & Performance Optimization",
                "objective": "Deploy the full-stack system live to cloud providers (Vercel + Render / Docker), optimize Lighthouse performance, and record demo video.",
                "deliverables": ["Live public deployment URL", "Automated CI/CD workflow", "Lighthouse score > 90 report", "Comprehensive documentation"],
            },
        ],
    },
    "ai-ml": {
        "title": "AI & Machine Learning Engineering",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Exploratory Data Analysis (EDA) & Feature Engineering Pipelines",
                "objective": "Perform deep data wrangling, missing data imputation, statistical profiling, and visual insight generation with Pandas and NumPy.",
                "deliverables": ["Jupyter notebook with EDA charts", "Feature correlation heatmap", "Cleaned datasets repository"],
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Supervised & Unsupervised Machine Learning Pipelines",
                "objective": "Build, tune hyperparameters, and evaluate classification and regression models using Scikit-Learn with cross-validation.",
                "deliverables": ["ML training pipeline scripts", "ROC-AUC & F1-score evaluation matrix", "Model serialization (.pkl / .onnx)"],
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Deep Neural Architectures with PyTorch & Computer Vision / NLP",
                "objective": "Train and fine-tune convolutional neural networks or transformer models on custom domain datasets with transfer learning.",
                "deliverables": ["PyTorch training loop code", "Loss / Accuracy convergence graphs", "Inference benchmark tests"],
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "LLM Integration, Vector Search (RAG) & FastAPI Model Serving",
                "objective": "Implement a Retrieval-Augmented Generation (RAG) pipeline using Vector Embeddings and deploy an inference API with FastAPI.",
                "deliverables": ["Vector DB integration (Chroma / Pinecone)", "FastAPI model serving endpoints", "Live demo interface"],
            },
        ],
    },
    "python": {
        "title": "Python Developer",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Advanced Python OOP, Design Patterns & AsyncIO Concurrency",
                "objective": "Master object-oriented design patterns, custom decorators, context managers, and async event loops.",
                "deliverables": ["Modular OOP architecture codebase", "Asynchronous task benchmark script", "Unit tests with pytest"],
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Web Scraping, Automated Data Extractors & Headless Pipelines",
                "objective": "Build robust web scrapers and automation scripts with Playwright / BeautifulSoup / Scrapy with error resilience.",
                "deliverables": ["Automated crawler script", "Structured JSON/CSV export engine", "Rate limiting & proxy handling"],
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Backend Microservices & Database Integration with FastAPI",
                "objective": "Build high-performance REST APIs with SQLAlchemy ORM, PostgreSQL connection pooling, and background task queues.",
                "deliverables": ["FastAPI microservice endpoints", "Database migrations with Alembic", "Postman / Swagger collection"],
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Docker Packaging, Cloud Deployment & Comprehensive Testing",
                "objective": "Containerize the Python application with Docker multi-stage builds, write CI test suites, and deploy to Render / AWS.",
                "deliverables": ["Optimized Dockerfile", "GitHub Actions test workflow", "Live deployed API link"],
            },
        ],
    },
    "java": {
        "title": "Java Developer",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Core Java 21, Collections Framework & Functional Streams",
                "objective": "Build robust OOP architectures utilizing modern Java features, generics, records, and functional Streams pipelines.",
                "deliverables": ["Clean architecture Java repository", "Streams & Collections benchmarks", "JUnit 5 test suite"],
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Data Structures, Multithreading & Memory Management",
                "objective": "Implement custom thread-safe data structures, ExecutorService concurrency pools, and profiling memory performance.",
                "deliverables": ["Concurrent producer-consumer engine", "Thread synchronization documentation", "DSA algorithms implementation"],
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Spring Boot 3 REST Microservices & JPA Hibernate Persistence",
                "objective": "Develop enterprise Spring Boot microservices with Spring Data JPA, relational entities, DTOs, and global exception handlers.",
                "deliverables": ["Spring Boot service application", "Database repository mapping", "Swagger OpenAPI documentation"],
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Spring Security JWT, Docker Containerization & Cloud Deployment",
                "objective": "Implement Spring Security filter chains for JWT authentication, package with Maven/Gradle into Docker, and deploy live.",
                "deliverables": ["Security configuration & token filters", "Dockerized JAR image", "Live cloud deployment URL"],
            },
        ],
    },
    "android": {
        "title": "Android App Development",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Kotlin Foundations & Declarative UI with Jetpack Compose",
                "objective": "Build modern Android UI components with Jetpack Compose, Material 3 theming, and responsive screen adaptations.",
                "deliverables": ["Declarative Compose screens", "Custom themed UI kit", "Android Studio project repo"],
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "MVVM Architecture, Coroutines & StateFlow Reactive Streams",
                "objective": "Implement MVVM design pattern with ViewModel, Kotlin Coroutines for asynchronous work, and StateFlow UI state binding.",
                "deliverables": ["MVVM layered structure", "Coroutines background handlers", "StateFlow reactive bindings"],
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "REST API Integration (Retrofit) & Local Database Caching (Room)",
                "objective": "Integrate network calls with Retrofit + Moshi and create an offline-first caching layer with Room SQLite Database.",
                "deliverables": ["Retrofit network service", "Room database DAO & entities", "Offline-first sync logic"],
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Firebase Services, Cloud Storage & Release APK Signing",
                "objective": "Add Firebase Auth and notifications, configure ProGuard obfuscation, and generate a signed release APK with demo recording.",
                "deliverables": ["Firebase integration", "Signed release APK file", "Demo walkthrough video"],
            },
        ],
    },
}

DEFAULT_DOMAIN_TASKS = DOMAIN_TASKS["full-stack"]

CURATED_PROJECT_LIST = [
    {
        "id": "saas-platform",
        "title": "Enterprise Cloud SaaS Platform",
        "description": "Multi-tenant business management dashboard with Role-Based Access Control (RBAC), analytics charts, audit logs, and automated email reports.",
        "tech_stack": ["React/Next.js", "FastAPI / Node.js", "PostgreSQL", "Tailwind CSS"],
    },
    {
        "id": "ai-rag-agent",
        "title": "AI Document Intelligence & Knowledge RAG Agent",
        "description": "Enterprise AI assistant that ingests company PDF/Doc manuals, computes vector embeddings, and performs semantic Q&A with source citations.",
        "tech_stack": ["Python / PyTorch", "LangChain / OpenAI", "Chroma / Pinecone", "FastAPI", "React"],
    },
    {
        "id": "ecommerce-marketplace",
        "title": "High-Throughput E-Commerce Marketplace",
        "description": "Full-scale commerce platform with catalog search, filtering, shopping cart state, order management, and secure payment checkout integration.",
        "tech_stack": ["Next.js 15", "PostgreSQL", "Razorpay / Stripe", "Redis Caching"],
    },
    {
        "id": "collab-workspace",
        "title": "Real-Time Collaborative Workspace Board",
        "description": "Interactive team board with drag-and-drop task workflows, real-time WebSocket notifications, user mentions, and file attachments.",
        "tech_stack": ["React", "WebSockets", "Node / FastAPI", "PostgreSQL"],
    },
]

# ─── Helper Functions ─────────────────────────────────────────────────────────

def get_tasks_for_domain(role_preference: Optional[str]):
    if not role_preference:
        return DOMAIN_TASKS["full-stack"]
    
    role_lower = role_preference.lower()
    if "ai" in role_lower or "machine" in role_lower or "data science" in role_lower:
        return DOMAIN_TASKS["ai-ml"]
    elif "python" in role_lower:
        return DOMAIN_TASKS["python"]
    elif "java" in role_lower:
        return DOMAIN_TASKS["java"]
    elif "android" in role_lower or "app" in role_lower:
        return DOMAIN_TASKS["android"]
    else:
        return DOMAIN_TASKS["full-stack"]


# ─── Pydantic Schemas ────────────────────────────────────────────────────────

class TaskSubmitRequest(BaseModel):
    task_key: str
    title: str
    project_topic: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    documentation_url: Optional[str] = None
    notes: Optional[str] = None
    tools_used: List[str] = []

class UnlockRequestPayload(BaseModel):
    task_key: str
    task_title: str
    reason: str

class DoubtSubmitPayload(BaseModel):
    module_name: str
    subject: str
    question: str
    code_snippet: Optional[str] = None


# ─── Student Portal Endpoints ────────────────────────────────────────────────

@router.get("/my-internship")
def get_my_internship(email: str = Query(...), db: Session = Depends(get_db)):
    """
    Returns the student's active internship status, allocated domain tasks,
    time-gated submission unlocking status, and submitted work history.
    """
    clean_email = email.strip().lower()
    app = db.query(InternshipApplication)\
            .filter((InternshipApplication.email == clean_email) | (InternshipApplication.google_email == clean_email))\
            .order_by(InternshipApplication.created_at.desc())\
            .first()

    if not app:
        return {
            "has_application": False,
            "status": "none",
            "message": "No internship application found. Apply to get started."
        }

    is_accepted = (app.status or "").lower() in ("accepted", "approved")
    
    if not is_accepted:
        return {
            "has_application": True,
            "id": app.id,
            "full_name": app.full_name,
            "email": app.email,
            "role_preference": app.role_preference,
            "duration": app.duration,
            "status": app.status,
            "created_at": app.created_at.isoformat() if app.created_at else None,
            "is_accepted": False,
            "message": "Your application is currently under admissions review."
        }

    # Calculate days elapsed since acceptance/creation
    start_date = app.created_at or datetime.utcnow()
    days_elapsed = (datetime.utcnow() - start_date).days

    # Fetch existing submissions
    submissions = db.query(InternshipSubmission).filter(InternshipSubmission.student_email == clean_email).all()
    sub_map = {s.task_key: s for s in submissions}

    # Fetch unlock requests
    unlock_requests = db.query(TaskUnlockRequest).filter(TaskUnlockRequest.student_email == clean_email).all()
    unlock_map = {u.task_key: u for u in unlock_requests}

    # Domain tasks
    domain_pack = get_tasks_for_domain(app.role_preference)
    duration_str = app.duration or "1 Month"

    # Build weekly task items with time-lock calculation
    # Week 1: Unlocked on Day 0..7
    # Week 2: Unlocks on Day 7+
    # Week 3: Unlocks on Day 14+
    # Week 4: Unlocks on Day 21+
    # Month 2 Project: Unlocks on Day 30+ (for 3M / 6M)
    # Month 3 Portfolio: Unlocks on Day 60+ (for 3M / 6M)
    # Month 4-6 Capstone: Unlocks on Day 90+ (for 6M)

    weekly_tasks = []
    for t in domain_pack["weeks"]:
        w_num = t["week"]
        required_days = (w_num - 1) * 7
        
        # Check if manually unlocked by admin or naturally unlocked by time
        existing_sub = sub_map.get(t["key"])
        is_manually_unlocked = bool(existing_sub and existing_sub.is_unlocked)
        
        existing_unlock_req = unlock_map.get(t["key"])
        if existing_unlock_req and existing_unlock_req.status == "approved":
            is_manually_unlocked = True

        is_unlocked = (days_elapsed >= required_days) or is_manually_unlocked or (w_num == 1)

        task_status = "pending"
        if existing_sub:
            task_status = existing_sub.status

        weekly_tasks.append({
            **t,
            "required_days": required_days,
            "is_unlocked": is_unlocked,
            "submission": {
                "id": existing_sub.id,
                "github_url": existing_sub.github_url,
                "live_url": existing_sub.live_url,
                "documentation_url": existing_sub.documentation_url,
                "notes": existing_sub.notes,
                "tools_used": existing_sub.tools_used or [],
                "status": existing_sub.status,
                "admin_feedback": existing_sub.admin_feedback,
                "submitted_at": existing_sub.submitted_at.isoformat() if existing_sub.submitted_at else None,
            } if existing_sub else None,
            "unlock_request": {
                "status": existing_unlock_req.status,
                "reason": existing_unlock_req.reason,
            } if existing_unlock_req else None
        })

    # Milestone Project for 3 Month and 6 Month internships
    month2_project = None
    if duration_str in ("3 Months", "6 Months"):
        m2_key = "month2_project"
        m2_sub = sub_map.get(m2_key)
        m2_unlock_req = unlock_map.get(m2_key)
        m2_unlocked = (days_elapsed >= 28) or (m2_sub and m2_sub.is_unlocked) or (m2_unlock_req and m2_unlock_req.status == "approved")
        
        month2_project = {
            "key": m2_key,
            "title": "Month 2: Full-Scale Industry Project Implementation",
            "objective": "Build and deploy a complete production-grade application chosen from the curated list or submit your own custom project proposal.",
            "is_unlocked": m2_unlocked,
            "curated_list": CURATED_PROJECT_LIST,
            "submission": {
                "id": m2_sub.id,
                "project_topic": m2_sub.project_topic,
                "github_url": m2_sub.github_url,
                "live_url": m2_sub.live_url,
                "documentation_url": m2_sub.documentation_url,
                "notes": m2_sub.notes,
                "tools_used": m2_sub.tools_used or [],
                "status": m2_sub.status,
                "admin_feedback": m2_sub.admin_feedback,
                "submitted_at": m2_sub.submitted_at.isoformat() if m2_sub.submitted_at else None,
            } if m2_sub else None,
            "unlock_request": {
                "status": m2_unlock_req.status,
                "reason": m2_unlock_req.reason,
            } if m2_unlock_req else None
        }

    # Month 3 Portfolio Website for 3 Month and 6 Month internships
    month3_portfolio = None
    if duration_str in ("3 Months", "6 Months"):
        m3_key = "month3_portfolio"
        m3_sub = sub_map.get(m3_key)
        m3_unlock_req = unlock_map.get(m3_key)
        m3_unlocked = (days_elapsed >= 56) or (m3_sub and m3_sub.is_unlocked) or (m3_unlock_req and m3_unlock_req.status == "approved")

        month3_portfolio = {
            "key": m3_key,
            "title": "Month 3: Personal Engineering Portfolio & Live Showcase",
            "objective": "Build and deploy your personal developer portfolio website showcasing all your internship projects, skills, and GitHub achievements.",
            "is_unlocked": m3_unlocked,
            "submission": {
                "id": m3_sub.id,
                "github_url": m3_sub.github_url,
                "live_url": m3_sub.live_url,
                "notes": m3_sub.notes,
                "tools_used": m3_sub.tools_used or [],
                "status": m3_sub.status,
                "admin_feedback": m3_sub.admin_feedback,
                "submitted_at": m3_sub.submitted_at.isoformat() if m3_sub.submitted_at else None,
            } if m3_sub else None,
            "unlock_request": {
                "status": m3_unlock_req.status,
                "reason": m3_unlock_req.reason,
            } if m3_unlock_req else None
        }

    # Months 4-6 Real-life Capstone for 6 Month Internships
    month4_6_capstone = None
    if duration_str == "6 Months":
        m4_key = "month4_6_capstone"
        m4_sub = sub_map.get(m4_key)
        m4_unlock_req = unlock_map.get(m4_key)
        m4_unlocked = (days_elapsed >= 84) or (m4_sub and m4_sub.is_unlocked) or (m4_unlock_req and m4_unlock_req.status == "approved")

        month4_6_capstone = {
            "key": m4_key,
            "title": "Months 4–6: Enterprise Real-Life Capstone Engineering Project",
            "objective": "End-to-end production architecture: Frontend, Backend, Relational Database, AI Integration, Cloud Deployment, and sprint updates with mentor guidance.",
            "is_unlocked": m4_unlocked,
            "submission": {
                "id": m4_sub.id,
                "project_topic": m4_sub.project_topic,
                "github_url": m4_sub.github_url,
                "live_url": m4_sub.live_url,
                "documentation_url": m4_sub.documentation_url,
                "notes": m4_sub.notes,
                "tools_used": m4_sub.tools_used or [],
                "status": m4_sub.status,
                "admin_feedback": m4_sub.admin_feedback,
                "submitted_at": m4_sub.submitted_at.isoformat() if m4_sub.submitted_at else None,
            } if m4_sub else None,
            "unlock_request": {
                "status": m4_unlock_req.status,
                "reason": m4_unlock_req.reason,
            } if m4_unlock_req else None
        }

    # Fetch doubts
    doubts = db.query(StudentDoubt)\
               .filter(StudentDoubt.student_email == clean_email)\
               .order_by(StudentDoubt.created_at.desc())\
               .all()

    doubts_list = [
        {
            "id": d.id,
            "module_name": d.module_name,
            "subject": d.subject,
            "question": d.question,
            "code_snippet": d.code_snippet,
            "status": d.status,
            "admin_reply": d.admin_reply,
            "answered_by": d.answered_by,
            "answered_at": d.answered_at.isoformat() if d.answered_at else None,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in doubts
    ]

    return {
        "has_application": True,
        "is_accepted": True,
        "id": app.id,
        "full_name": app.full_name,
        "email": app.email,
        "role_preference": app.role_preference,
        "domain_title": domain_pack["title"],
        "duration": duration_str,
        "status": app.status,
        "days_elapsed": days_elapsed,
        "start_date": start_date.isoformat() if start_date else None,
        "weekly_tasks": weekly_tasks,
        "month2_project": month2_project,
        "month3_portfolio": month3_portfolio,
        "month4_6_capstone": month4_6_capstone,
        "doubts": doubts_list,
    }


@router.post("/tasks/submit")
def submit_task(
    payload: TaskSubmitRequest,
    email: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Submits or updates a student task, project, or portfolio submission.
    """
    clean_email = email.strip().lower()
    app = db.query(InternshipApplication)\
            .filter((InternshipApplication.email == clean_email) | (InternshipApplication.google_email == clean_email))\
            .first()

    if not app:
        raise HTTPException(status_code=404, detail="Student internship application not found")

    existing = db.query(InternshipSubmission)\
                 .filter(InternshipSubmission.student_email == clean_email, InternshipSubmission.task_key == payload.task_key)\
                 .first()

    if existing:
        existing.title = payload.title
        existing.project_topic = payload.project_topic
        existing.github_url = payload.github_url
        existing.live_url = payload.live_url
        existing.documentation_url = payload.documentation_url
        existing.notes = payload.notes
        existing.tools_used = payload.tools_used
        existing.status = "submitted"
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return {"success": True, "message": "Task submission updated successfully", "id": existing.id}
    else:
        new_sub = InternshipSubmission(
            application_id=app.id,
            student_email=clean_email,
            task_key=payload.task_key,
            title=payload.title,
            project_topic=payload.project_topic,
            github_url=payload.github_url,
            live_url=payload.live_url,
            documentation_url=payload.documentation_url,
            notes=payload.notes,
            tools_used=payload.tools_used,
            status="submitted",
        )
        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)
        return {"success": True, "message": "Task submitted successfully", "id": new_sub.id}


@router.post("/tasks/request-unlock")
def request_task_unlock(
    payload: UnlockRequestPayload,
    email: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Student submits an unlock request for a locked / missed task.
    """
    clean_email = email.strip().lower()
    app = db.query(InternshipApplication)\
            .filter((InternshipApplication.email == clean_email) | (InternshipApplication.google_email == clean_email))\
            .first()

    if not app:
        raise HTTPException(status_code=404, detail="Student internship application not found")

    existing = db.query(TaskUnlockRequest)\
                 .filter(TaskUnlockRequest.student_email == clean_email, TaskUnlockRequest.task_key == payload.task_key)\
                 .first()

    if existing:
        existing.reason = payload.reason
        existing.status = "pending"
        existing.updated_at = datetime.utcnow()
        db.commit()
        return {"success": True, "message": "Unlock request updated and sent to admin"}
    else:
        req = TaskUnlockRequest(
            application_id=app.id,
            student_email=clean_email,
            student_name=app.full_name,
            task_key=payload.task_key,
            task_title=payload.task_title,
            reason=payload.reason,
            status="pending"
        )
        db.add(req)
        db.commit()
        return {"success": True, "message": "Unlock request submitted to admin"}


@router.post("/doubts")
def submit_doubt(
    payload: DoubtSubmitPayload,
    email: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Student submits a question or doubt regarding a specific task or module.
    """
    clean_email = email.strip().lower()
    app = db.query(InternshipApplication)\
            .filter((InternshipApplication.email == clean_email) | (InternshipApplication.google_email == clean_email))\
            .first()

    if not app:
        raise HTTPException(status_code=404, detail="Student internship application not found")

    doubt = StudentDoubt(
        application_id=app.id,
        student_email=clean_email,
        student_name=app.full_name,
        domain_track=app.role_preference or "General Internship",
        module_name=payload.module_name,
        subject=payload.subject,
        question=payload.question,
        code_snippet=payload.code_snippet,
        status="open",
    )
    db.add(doubt)
    db.commit()
    db.refresh(doubt)

    return {"success": True, "message": "Doubt submitted successfully. Our engineering mentors will reply shortly.", "id": doubt.id}
