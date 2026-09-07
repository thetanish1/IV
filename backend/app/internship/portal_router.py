import os
import uuid
import math
import logging
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, UploadFile, File
from fastapi.responses import FileResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
import cloudinary
import cloudinary.uploader

from app.shared.database import get_db
from app.internship.models import InternshipApplication, InternshipSubmission, TaskUnlockRequest, StudentDoubt
from app.shared.email_service import _send_smtp_email
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/portal", tags=["Student Internship Portal"])

# Local directory to store uploaded doubt screenshots/images
DOUBT_IMG_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "doubts")
os.makedirs(DOUBT_IMG_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
}

def _configure_cloudinary():
    """Configure cloudinary if credentials are provided."""
    if settings.CLOUDINARY_URL:
        cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)
        return True
    elif settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )
        return True
    return False

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
    "data-science": {
        "title": "Data Science & Big Data Analytics",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Data Wrangling, Statistical Distributions & Advanced EDA",
                "objective": "Perform deep exploratory data analysis, hypothesis testing, outlier detection, and statistical visualizations with Pandas and Seaborn.",
                "deliverables": ["Jupyter EDA Notebook", "Statistical Distribution Matrix", "Cleaned Datasets"],
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "SQL for Analytics, Window Functions & Relational Schemas",
                "objective": "Write complex analytical SQL queries, CTEs, aggregation pipelines, and build data models in PostgreSQL.",
                "deliverables": ["Analytical SQL queries file", "Schema ERD diagram", "Performance index report"],
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Predictive Modeling & Applied Machine Learning",
                "objective": "Train predictive regression & classification models with Scikit-Learn, evaluate performance metrics, and build feature stores.",
                "deliverables": ["Scikit-Learn ML script", "Model evaluation benchmark", "Feature importance charts"],
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Executive Business Intelligence Dashboards & Deployment",
                "objective": "Design interactive BI dashboards using Streamlit / Power BI and deploy live with automated data refresh pipelines.",
                "deliverables": ["Interactive Streamlit dashboard URL", "GitHub repo", "Executive insights slide deck"],
            },
        ],
    },
    "devops": {
        "title": "Cloud DevOps & CI/CD Engineering",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Linux Systems Administration, Bash Scripting & Git Flow",
                "objective": "Master Linux server administration, SSH tunneling, systemd services, and automated bash scripting.",
                "deliverables": ["Bash automation scripts", "System monitoring tool", "Git branching workflow docs"],
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Docker Containerization & Multi-Container Docker Compose",
                "objective": "Containerize full-stack services with multi-stage Docker builds, compose stacks, and volume persistence.",
                "deliverables": ["Multi-stage Dockerfile", "Docker Compose architecture file", "Container security scan"],
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "CI/CD Pipelines with GitHub Actions & Automated Testing",
                "objective": "Build automated continuous integration pipelines with linting, unit testing, Docker Hub push, and zero-downtime deploy.",
                "deliverables": [".github/workflows/deploy.yml", "Automated test integration", "Build badge status"],
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Kubernetes Orchestration & Cloud Infrastructure Deployment",
                "objective": "Deploy scalable applications to Kubernetes / Cloud (AWS/Render) with ingress, ConfigMaps, and health probes.",
                "deliverables": ["K8s deployment manifests", "Live cloud application URL", "Architecture walkthrough"],
            },
        ],
    },
    "cyber-security": {
        "title": "Cyber Security & Ethical Hacking",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Networking Protocols, Packet Analysis & Reconnaissance",
                "objective": "Perform passive/active reconnaissance, network packet capture with Wireshark, and port scanning with Nmap.",
                "deliverables": ["Wireshark PCAP analysis report", "Nmap network topology scan", "Recon methodology docs"],
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "OWASP Top 10 Web Application Vulnerability Assessment",
                "objective": "Audit web applications against SQL injection, XSS, CSRF, and broken authentication using Burp Suite.",
                "deliverables": ["Vulnerability assessment report", "Proof of Concept (PoC) exploits", "Remediation recommendations"],
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Cryptography, SSL/TLS & Identity Access Management",
                "objective": "Implement symmetric/asymmetric encryption, PKI certificate authorities, and secure password hashing protocols.",
                "deliverables": ["Python crypto utility script", "SSL/TLS hardening checklist", "Security audit report"],
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "System Hardening, Incident Response & Penetration Testing Report",
                "objective": "Perform defensive system hardening, configure iptables/firewalls, and author a professional penetration testing report.",
                "deliverables": ["Professional Pen-Test Audit PDF", "Defensive hardening script", "Walkthrough video"],
            },
        ],
    },
    "ui-ux": {
        "title": "UI/UX Design & Product Frontend",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "User Research, Wireframing & Low-Fidelity Prototyping",
                "objective": "Conduct user persona discovery, information architecture mapping, and low-fidelity wireframes in Figma.",
                "deliverables": ["Figma wireframe board link", "User persona cards", "User journey map"],
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Comprehensive Design Systems, Color Tokens & Typography",
                "objective": "Build high-end design systems in Figma with auto-layout, variants, typography scale, and dark-mode tokens.",
                "deliverables": ["Figma Design System kit", "Component variant library", "Accessibility contrast matrix"],
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "High-Fidelity Interactive Prototypes & Micro-Animations",
                "objective": "Create pixel-perfect interactive prototype flows with animated transitions, modal states, and interactive feedback.",
                "deliverables": ["Figma clickable interactive prototype", "Micro-interaction specs", "Usability test recordings"],
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Production Frontend Implementation with React & Tailwind CSS",
                "objective": "Translate the Figma design system into production React + Tailwind CSS code with responsive layouts and deploy live.",
                "deliverables": ["Live deployment URL (Vercel)", "GitHub component repository", "Lighthouse accessibility 100 score"],
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
    
    r = role_preference.lower()
    if "ai" in r or "machine" in r:
        return DOMAIN_TASKS["ai-ml"]
    elif "data science" in r or "analytics" in r:
        return DOMAIN_TASKS["data-science"]
    elif "python" in r or "backend" in r:
        return DOMAIN_TASKS["python"]
    elif "java" in r or "spring" in r:
        return DOMAIN_TASKS["java"]
    elif "android" in r or "app" in r or "kotlin" in r:
        return DOMAIN_TASKS["android"]
    elif "devops" in r or "cloud" in r or "docker" in r:
        return DOMAIN_TASKS["devops"]
    elif "cyber" in r or "security" in r or "ethical" in r:
        return DOMAIN_TASKS["cyber-security"]
    elif "design" in r or "ui" in r or "ux" in r or "frontend" in r:
        return DOMAIN_TASKS["ui-ux"]
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
    image_url: Optional[str] = None


# ─── Student Portal Endpoints ────────────────────────────────────────────────

@router.get("/my-internship")
def get_my_internship(email: str = Query(...), db: Session = Depends(get_db)):
    """
    Returns the student's active internship status, allocated domain tasks,
    time-gated submission unlocking status, and submitted work history.
    """
    clean_email = email.strip().lower()
    app = db.query(InternshipApplication)\
            .filter((func.lower(InternshipApplication.email) == clean_email) | (func.lower(InternshipApplication.google_email) == clean_email))\
            .order_by(InternshipApplication.created_at.desc())\
            .first()

    if not app:
        return {
            "has_application": False,
            "status": "none",
            "is_accepted": False,
            "is_rejected": False,
            "message": "No internship application found. Apply to get started."
        }

    raw_status = (app.status or "pending").strip().lower()
    is_accepted = raw_status in ("accepted", "approved")
    is_rejected = raw_status in ("rejected", "declined")
    
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
            "is_rejected": is_rejected,
            "message": "Your application was not selected for this cohort." if is_rejected else "Your application is currently under admissions review."
        }

    # Calculate days elapsed since acceptance/creation safely with tzinfo
    start_date = app.created_at
    if not start_date:
        days_elapsed = 0
    elif getattr(start_date, "tzinfo", None) is not None:
        from datetime import timezone
        days_elapsed = max(0, (datetime.now(timezone.utc) - start_date).days)
    else:
        days_elapsed = max(0, (datetime.utcnow() - start_date).days)

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
            "image_url": d.image_url,
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
        image_url=payload.image_url,
        status="open",
    )
    db.add(doubt)
    db.commit()
    db.refresh(doubt)

    return {"success": True, "message": "Doubt submitted successfully. Our engineering mentors will reply shortly.", "id": doubt.id}


@router.post("/doubts/upload-image")
async def upload_doubt_image(file: UploadFile = File(...)):
    """Upload an error screenshot or query image to Cloudinary Object Storage with local fallback."""
    filename_lower = (file.filename or "").lower()
    valid_ext = any(filename_lower.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"])
    
    if not valid_ext and file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only image files (PNG, JPG, JPEG, WebP, GIF) are accepted for error screenshots."
        )

    content = await file.read()
    ext = os.path.splitext(file.filename or "screenshot")[-1] or ".png"
    unique_filename = f"doubt_{uuid.uuid4().hex}{ext}"

    # Try uploading to Cloudinary first
    if _configure_cloudinary():
        try:
            upload_result = cloudinary.uploader.upload(
                content,
                folder="internvision/doubts",
                resource_type="image",
                public_id=f"doubt_{uuid.uuid4().hex}",
                use_filename=True,
                unique_filename=True
            )
            secure_url = upload_result.get("secure_url") or upload_result.get("url")
            if secure_url:
                logger.info(f"Doubt image uploaded to Cloudinary: {secure_url}")
                return {
                    "filename": unique_filename,
                    "url": secure_url,
                    "original_name": file.filename,
                    "storage": "cloudinary"
                }
        except Exception as e:
            logger.error(f"Cloudinary upload failed, falling back to local storage: {e}")

    # Local fallback
    save_path = os.path.join(DOUBT_IMG_DIR, unique_filename)
    with open(save_path, "wb") as f:
        f.write(content)

    return {
        "filename": unique_filename,
        "url": f"/api/portal/doubts/image/{unique_filename}",
        "original_name": file.filename,
        "storage": "local"
    }


@router.get("/doubts/image/{filename:path}")
def get_doubt_image(filename: str):
    """Serve or redirect to doubt error screenshot."""
    if filename.startswith("http://") or filename.startswith("https://"):
        return RedirectResponse(url=filename)

    if "cloudinary.com" in filename:
        full_url = filename if filename.startswith("http") else f"https://{filename}"
        return RedirectResponse(url=full_url)

    safe_filename = os.path.basename(filename)
    file_path = os.path.join(DOUBT_IMG_DIR, safe_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Doubt image not found")

    media_type = "image/png"
    lower = safe_filename.lower()
    if lower.endswith(".jpg") or lower.endswith(".jpeg"):
        media_type = "image/jpeg"
    elif lower.endswith(".webp"):
        media_type = "image/webp"
    elif lower.endswith(".gif"):
        media_type = "image/gif"
    elif lower.endswith(".svg"):
        media_type = "image/svg+xml"

    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=safe_filename,
        content_disposition_type="inline"
    )

