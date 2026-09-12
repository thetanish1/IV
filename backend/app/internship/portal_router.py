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
from app.shared.email_service import (
    _send_smtp_email,
    send_submission_confirmation_email,
    send_unlock_request_received_email,
)
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
        "description": "Modern full-stack web application engineering with Next.js 15, React 19, TypeScript, FastAPI / Node.js, and PostgreSQL.",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Week 1: Modern Component Architecture & Responsive UI Design",
                "objective": "Build a responsive, accessible component library and application layout using Next.js 15 App Router, React 19, and Tailwind CSS with clean state hooks.",
                "deliverables": [
                    "Structured Next.js project with modular component tree",
                    "Fully responsive mobile, tablet, and desktop layouts",
                    "Interactive navigation, dark-mode toggle, and accessible modals",
                    "GitHub repository with clean Git commit history and comprehensive README.md"
                ],
                "tech_stack": ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Lucide Icons"],
                "evaluation_focus": "Component reusability, responsiveness across breakpoints, and clean code formatting"
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Week 2: RESTful Backend APIs, Relational Database & Validation",
                "objective": "Design scalable REST API endpoints using FastAPI or Express, configure PostgreSQL with relational schema migrations, and implement Pydantic/Zod request validation.",
                "deliverables": [
                    "Normalized PostgreSQL relational database schema with foreign keys and indexes",
                    "CRUD REST API endpoints with status codes and error handling",
                    "Pydantic / Zod request validation schemas and OpenAPI documentation (/docs)",
                    "Database seed script with realistic sample datasets"
                ],
                "tech_stack": ["FastAPI", "Python", "PostgreSQL", "SQLAlchemy", "Pydantic"],
                "evaluation_focus": "API contract design, database normalization, and input validation security"
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Week 3: JWT Authentication, Protected Routes & Cloud Storage",
                "objective": "Implement secure authentication with JSON Web Tokens (JWT) / OAuth, route protection middleware, password hashing, and multipart file uploads to cloud storage.",
                "deliverables": [
                    "Complete user signup, login, and token refresh authentication flow",
                    "Password hashing with bcrypt / Argon2 and HTTP-only cookie or bearer token authorization",
                    "Protected API routes and frontend authentication guards",
                    "Image and resume file upload integration (Cloudinary / S3 / Local storage)"
                ],
                "tech_stack": ["JWT Auth", "Bcrypt", "FastAPI / Next.js", "Cloudinary / AWS S3"],
                "evaluation_focus": "Authentication security, token expiry handling, and secure route protection"
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Week 4: Production Deployment, CI/CD Pipelines & Mini-Capstone",
                "objective": "Deploy the complete full-stack application live to production (Vercel frontend + Render / Docker backend), configure GitHub Actions CI/CD, and record a walkthrough demo.",
                "deliverables": [
                    "Live public URL for frontend (Vercel) and backend API (Render/Railway)",
                    "Automated GitHub Actions CI/CD workflow testing builds on push",
                    "Lighthouse performance and accessibility score audit (> 90)",
                    "Video walkthrough recording (Loom/YouTube link) demonstrating all features"
                ],
                "tech_stack": ["Vercel", "Render", "Docker", "GitHub Actions", "Lighthouse"],
                "evaluation_focus": "Live deployment stability, CI/CD automation, and documentation completeness"
            },
            {
                "week": 5,
                "key": "month2_week5",
                "title": "Week 5: State Stores, Caching & Real-Time WebSockets (6M Track)",
                "objective": "Integrate global state management (Zustand / Redux Toolkit), Redis caching for frequent API queries, and real-time bidirectional WebSocket event streams.",
                "deliverables": [
                    "Global state store implementation with persistent middleware",
                    "Redis caching layer reducing database latency on heavy queries",
                    "Live WebSocket event stream for real-time notifications or chat",
                    "Benchmark performance comparison with and without caching"
                ],
                "tech_stack": ["Zustand", "Redis", "WebSockets", "FastAPI / Socket.IO"],
                "evaluation_focus": "State predictability, cache invalidation strategy, and WebSocket resilience"
            },
            {
                "week": 6,
                "key": "month2_week6",
                "title": "Week 6: Automated Testing Suites (Unit, Integration & E2E) (6M Track)",
                "objective": "Write comprehensive automated test suites using Pytest for backend APIs and Jest / React Testing Library / Playwright for frontend UI interactions.",
                "deliverables": [
                    "Pytest suite covering all API endpoints and edge cases (> 80% code coverage)",
                    "Frontend unit tests verifying component states and user events",
                    "End-to-End (E2E) Playwright test validating login and core user workflows",
                    "Automated coverage report badge in GitHub README"
                ],
                "tech_stack": ["Pytest", "Jest", "Playwright", "Coverage.py"],
                "evaluation_focus": "Test coverage depth, mock data isolation, and CI test pipeline execution"
            },
            {
                "week": 7,
                "key": "month2_week7",
                "title": "Week 7: Microservices Architecture & Asynchronous Task Queues (6M Track)",
                "objective": "Refactor monolithic components into decoupled microservices, implementing background job processing with Celery / BullMQ and message brokers (RabbitMQ/Redis).",
                "deliverables": [
                    "Decoupled microservice communicating over REST or gRPC",
                    "Asynchronous background worker processing tasks (e.g. email / PDF generation)",
                    "Message broker configuration with failure retries and dead-letter queues",
                    "Architecture diagram explaining data flow between services"
                ],
                "tech_stack": ["Celery", "RabbitMQ / Redis", "FastAPI Microservices", "Docker Compose"],
                "evaluation_focus": "Service decoupling, task idempotency, and asynchronous error handling"
            },
            {
                "week": 8,
                "key": "month2_week8",
                "title": "Week 8: Performance Profiling, Security Hardening & Monitoring (6M Track)",
                "objective": "Conduct load testing with Locust, audit security against OWASP vulnerabilities, configure structured logging and Prometheus / Grafana observability.",
                "deliverables": [
                    "Locust load test report handling 100+ concurrent users without error",
                    "Security audit checklist (CORS, Rate limiting, SQL injection defense)",
                    "Structured JSON logging with request tracing correlation IDs",
                    "System health check and monitoring dashboard integration"
                ],
                "tech_stack": ["Locust", "Prometheus", "Grafana", "Rate Limiting", "OWASP"],
                "evaluation_focus": "System throughput under load, defensive security posture, and observability"
            },
        ],
    },
    "ai-ml": {
        "title": "AI & Machine Learning Engineering",
        "description": "Production machine learning pipelines, deep learning with PyTorch, LLMs, Vector Databases (RAG), and model deployment.",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Week 1: Exploratory Data Analysis (EDA) & Feature Engineering Pipelines",
                "objective": "Perform comprehensive data wrangling, missing data imputation, outlier detection, statistical profiling, and feature encoding with Pandas and NumPy.",
                "deliverables": [
                    "Cleaned and validated domain datasets with automated preprocessing scripts",
                    "Jupyter Notebook with statistical visualizations and feature correlation heatmaps",
                    "Automated feature scaling and categorical encoding transformation pipelines",
                    "GitHub repository with dataset documentation and EDA findings summary"
                ],
                "tech_stack": ["Python 3.12", "Pandas", "NumPy", "Matplotlib", "Seaborn"],
                "evaluation_focus": "Data cleaning rigor, statistical insights quality, and reproducible notebook code"
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Week 2: Supervised & Unsupervised Machine Learning Pipelines",
                "objective": "Train, cross-validate, and optimize classification and regression models using Scikit-Learn, XGBoost, and hyperparameter tuning with Optuna.",
                "deliverables": [
                    "Trained ML models evaluated with precision, recall, F1-score, and ROC-AUC curves",
                    "Hyperparameter optimization script utilizing cross-validation",
                    "Feature importance analysis and model interpretability charts (SHAP / Lime)",
                    "Model serialization artifacts (.joblib / .pkl) and inference testing script"
                ],
                "tech_stack": ["Scikit-Learn", "XGBoost", "Optuna", "SHAP", "Joblib"],
                "evaluation_focus": "Model evaluation metrics accuracy, prevention of data leakage, and tuning methodology"
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Week 3: Deep Neural Architectures with PyTorch (Computer Vision / NLP)",
                "objective": "Build and train deep learning models with PyTorch, implementing custom Dataset/DataLoader classes, transfer learning (ResNet/BERT), and GPU acceleration.",
                "deliverables": [
                    "PyTorch neural network training loop with loss tracking and early stopping",
                    "Transfer learning implementation on an image or text classification dataset",
                    "Validation loss and accuracy convergence graphs",
                    "Saved PyTorch model weights (.pth) and standalone prediction script"
                ],
                "tech_stack": ["PyTorch", "Torchvision", "Hugging Face Transformers", "CUDA"],
                "evaluation_focus": "Training loop structure, gradient handling, and transfer learning fine-tuning"
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Week 4: LLM Integration, Vector Search (RAG) & FastAPI Model Serving",
                "objective": "Build a Retrieval-Augmented Generation (RAG) agent with Vector Embeddings (Chroma/Pinecone), LangChain/LlamaIndex, and serve real-time predictions via FastAPI.",
                "deliverables": [
                    "Vector database pipeline chunking documents and generating semantic embeddings",
                    "RAG query engine retrieving relevant context and generating grounded responses",
                    "FastAPI model serving REST endpoints with Swagger documentation",
                    "Interactive web demo interface and live deployed link with demo video"
                ],
                "tech_stack": ["FastAPI", "LangChain", "ChromaDB", "OpenAI / HuggingFace", "Streamlit"],
                "evaluation_focus": "Retrieval accuracy, response grounding, and low-latency API serving"
            },
            {
                "week": 5,
                "key": "month2_week5",
                "title": "Week 5: MLOps Pipelines, Experiment Tracking & Model Registry (6M Track)",
                "objective": "Implement automated MLOps pipelines using MLflow / Weights & Biases for experiment tracking, model versioning, artifact logging, and automated model registration.",
                "deliverables": [
                    "MLflow / W&B experiment tracking dashboard logging hyperparameter runs and metrics",
                    "Model registry pipeline promoting models from Staging to Production",
                    "Automated dataset versioning with DVC (Data Version Control)",
                    "CI workflow triggering model validation on new dataset commits"
                ],
                "tech_stack": ["MLflow", "Weights & Biases", "DVC", "GitHub Actions"],
                "evaluation_focus": "Experiment reproducibility, model governance, and artifact versioning"
            },
            {
                "week": 6,
                "key": "month2_week6",
                "title": "Week 6: Model Optimization, Quantization & TensorRT / ONNX Serving (6M Track)",
                "objective": "Optimize neural networks for low-latency edge and cloud deployment using model quantization (INT8/FP16), pruning, and ONNX Runtime / TensorRT acceleration.",
                "deliverables": [
                    "ONNX model export and inference benchmark script",
                    "Quantized model pipeline demonstrating reduced memory footprint (> 50% reduction)",
                    "Latency benchmark comparing native PyTorch vs ONNX Runtime throughput",
                    "Docker container optimized for high-performance model serving"
                ],
                "tech_stack": ["ONNX Runtime", "TorchScript", "Model Quantization", "Docker"],
                "evaluation_focus": "Inference speedup, accuracy retention after quantization, and memory efficiency"
            },
            {
                "week": 7,
                "key": "month2_week7",
                "title": "Week 7: Advanced Multi-Agent Orchestration & Tool Calling (6M Track)",
                "objective": "Architect autonomous multi-agent systems with LangGraph / CrewAI, integrating tool calling, web search capabilities, SQL querying, and memory state graphs.",
                "deliverables": [
                    "Multi-agent workflow with specialized role agents (Researcher, Writer, Reviewer)",
                    "Custom Python tool integrations (SQL query executor, Web search, Calculator)",
                    "Persistent conversation memory with SQLite / Redis checkpointer",
                    "Traceability logging with LangSmith / Phoenix evaluation telemetry"
                ],
                "tech_stack": ["LangGraph", "CrewAI", "LangSmith", "Python"],
                "evaluation_focus": "Agent coordination logic, tool error handling, and cyclic graph stability"
            },
            {
                "week": 8,
                "key": "month2_week8",
                "title": "Week 8: Model Drift Monitoring & Production Continuous Retraining (6M Track)",
                "objective": "Build continuous monitoring pipelines detecting data drift, concept drift, and model degradation using Evidently AI, with automated alerts and retraining triggers.",
                "deliverables": [
                    "Evidently AI dashboard detecting statistical distribution drift on live data",
                    "Automated webhook alerts on accuracy drop / distribution drift",
                    "Continuous retraining pipeline triggered automatically on drift detection",
                    "Production architecture documentation and end-to-end demo video"
                ],
                "tech_stack": ["Evidently AI", "FastAPI", "Prometheus", "Docker"],
                "evaluation_focus": "Drift detection accuracy, automated alert triggers, and retraining safety"
            },
        ],
    },
    "python": {
        "title": "Python Developer",
        "description": "Enterprise Python programming: advanced OOP, AsyncIO concurrency, web scraping, FastAPI microservices, and automated testing.",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Week 1: Advanced Python OOP, Type Hinting & AsyncIO Concurrency",
                "objective": "Master modern Python 3.12 features: dataclasses, custom decorators, context managers, structural pattern matching, and AsyncIO event loops.",
                "deliverables": [
                    "Modular OOP codebase demonstrating inheritance, encapsulation, and design patterns",
                    "Asynchronous task executor utilizing AsyncIO and aiohttp for concurrent operations",
                    "Full type-hinted code with static analysis validation (Mypy / Ruff)",
                    "Pytest test suite with 90%+ branch coverage"
                ],
                "tech_stack": ["Python 3.12", "AsyncIO", "Mypy", "Ruff", "Pytest"],
                "evaluation_focus": "Code idiomaticity, async performance, and type safety"
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Week 2: Web Scraping, Headless Automation & ETL Data Pipelines",
                "objective": "Build resilient web scraping pipelines with Playwright / BeautifulSoup / Scrapy, handling dynamic JS rendering, rate limiting, and database exports.",
                "deliverables": [
                    "Automated scraper extracting structured data from multi-page web applications",
                    "Error recovery, proxy rotation, and rate-limiting retry mechanism",
                    "ETL pipeline cleaning, transforming, and inserting data into PostgreSQL / SQLite",
                    "Automated cron / task scheduler running data extraction routines"
                ],
                "tech_stack": ["Playwright", "BeautifulSoup4", "Scrapy", "PostgreSQL", "Pandas"],
                "evaluation_focus": "Scraper resilience against errors, rate-limit compliance, and data schema cleanliness"
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Week 3: High-Performance Backend APIs with FastAPI & SQLAlchemy ORM",
                "objective": "Develop production REST APIs with FastAPI, implementing SQLAlchemy 2.0 async sessions, Alembic database migrations, and JWT authentication.",
                "deliverables": [
                    "FastAPI application with asynchronous database CRUD endpoints",
                    "Alembic migration scripts versioning relational schema changes",
                    "Secure JWT authentication and password hashing middleware",
                    "Interactive OpenAPI Swagger UI documentation (/docs)"
                ],
                "tech_stack": ["FastAPI", "SQLAlchemy 2.0", "Alembic", "PostgreSQL", "Pydantic"],
                "evaluation_focus": "Async session efficiency, migration cleanliness, and API response standards"
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Week 4: Docker Packaging, Cloud Deployment & Mini-Capstone",
                "objective": "Containerize the Python application with multi-stage Docker builds, configure GitHub Actions CI/CD, and deploy live to cloud platforms.",
                "deliverables": [
                    "Multi-stage optimized Dockerfile and docker-compose.yml stack",
                    "GitHub Actions CI pipeline running linters and tests on pull requests",
                    "Live deployed public API URL with database connectivity (Render / Railway)",
                    "Walkthrough video and comprehensive technical documentation"
                ],
                "tech_stack": ["Docker", "Docker Compose", "GitHub Actions", "Render", "Cloud"],
                "evaluation_focus": "Container footprint optimization, CI/CD pipeline, and deployment uptime"
            },
        ],
    },
    "java": {
        "title": "Java Developer",
        "description": "Enterprise Java 21 development: Core Java OOP, Streams & Concurrency, Spring Boot 3, Spring Data JPA, Spring Security, and microservices.",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Week 1: Core Java 21, Collections Framework & Functional Streams",
                "objective": "Master modern Java 21 features: records, sealed classes, pattern matching, Collections framework, and functional Streams pipelines.",
                "deliverables": [
                    "Clean architecture Java repository with Maven / Gradle build setup",
                    "Data processing pipelines utilizing Java Streams, Lambdas, and Optionals",
                    "Custom thread-safe generic collections implementation",
                    "JUnit 5 and AssertJ unit test suite with high coverage"
                ],
                "tech_stack": ["Java 21", "Maven / Gradle", "JUnit 5", "AssertJ"],
                "evaluation_focus": "OOP principles, idiomatic Java 21 syntax, and unit test thoroughness"
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Week 2: Multithreading, Concurrency Pools & Memory Management",
                "objective": "Implement concurrent applications with Virtual Threads (Project Loom), ExecutorService thread pools, synchronized blocks, and atomic variables.",
                "deliverables": [
                    "High-throughput concurrent task processor utilizing Virtual Threads",
                    "Producer-consumer pattern implementation with BlockingQueue",
                    "Deadlock prevention and memory leak profiling documentation",
                    "Performance benchmark comparing classic threads vs virtual threads"
                ],
                "tech_stack": ["Java Concurrency", "Virtual Threads", "JConsole / VisualVM"],
                "evaluation_focus": "Thread safety, synchronization correctness, and resource management"
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Week 3: Spring Boot 3 REST Microservices & JPA Hibernate Persistence",
                "objective": "Develop enterprise Spring Boot 3 microservices with Spring Data JPA, Hibernate relational mappings, DTO pattern, and global exception handlers.",
                "deliverables": [
                    "Spring Boot 3 REST application with layered Controller-Service-Repository architecture",
                    "Entity mappings with relationships (@OneToMany, @ManyToMany) and custom repository queries",
                    "Global @ControllerAdvice exception handler returning standardized error responses",
                    "SpringDoc OpenAPI (Swagger UI) documentation (/swagger-ui.html)"
                ],
                "tech_stack": ["Spring Boot 3", "Spring Data JPA", "Hibernate", "PostgreSQL / H2", "Swagger"],
                "evaluation_focus": "Layered architecture cleanliness, database query efficiency, and DTO validation"
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Week 4: Spring Security JWT, Docker Containerization & Cloud Deployment",
                "objective": "Secure the application with Spring Security filter chains and JWT tokens, package into lightweight Docker containers, and deploy to cloud environments.",
                "deliverables": [
                    "Spring Security JWT authentication with role-based access control (RBAC)",
                    "Multi-stage Dockerfile packaging the JAR with Temurin JDK runtime",
                    "Integration test suite with @SpringBootTest and Testcontainers",
                    "Live deployed cloud service link and architectural demonstration video"
                ],
                "tech_stack": ["Spring Security", "JWT", "Docker", "Testcontainers", "Cloud Platform"],
                "evaluation_focus": "Security filter chain configuration, container efficiency, and deployment stability"
            },
        ],
    },
    "backend": {
        "title": "Backend Engineering",
        "description": "High-throughput backend architectures: API design, JWT/OAuth2, PostgreSQL database modeling, Redis caching, and microservices.",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Week 1: API Design, Relational Modeling & Schema Optimization",
                "objective": "Design clean RESTful and RPC API contracts, build normalized PostgreSQL database schemas with indexing strategies, and implement connection pooling.",
                "deliverables": [
                    "Database schema ERD diagram with foreign keys, constraints, and B-Tree indexes",
                    "API specification document with standardized status codes and pagination",
                    "PostgreSQL query performance benchmark comparing indexed vs non-indexed queries",
                    "Database migration scripts versioning all schema changes"
                ],
                "tech_stack": ["PostgreSQL", "FastAPI / Node.js", "SQLAlchemy / Prisma", "DBeaver"],
                "evaluation_focus": "Database normalization, query execution plan analysis (EXPLAIN ANALYZE), and schema design"
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Week 2: Secure Authentication, Session Management & RBAC",
                "objective": "Implement production authentication using JWT, OAuth2, refresh token rotation, password hashing, and Role-Based Access Control (RBAC) middleware.",
                "deliverables": [
                    "Complete auth system with signup, login, password reset, and token rotation",
                    "RBAC middleware enforcing granular user permissions across endpoints",
                    "Rate-limiting middleware protecting sensitive endpoints against brute force",
                    "Comprehensive unit tests verifying unauthorized access rejection"
                ],
                "tech_stack": ["JWT", "OAuth2", "Bcrypt", "Redis Rate Limiter"],
                "evaluation_focus": "Token rotation security, permission boundary enforcement, and rate limiting"
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Week 3: In-Memory Caching (Redis), Message Queues & Background Workers",
                "objective": "Integrate Redis caching to reduce database read pressure, configure message queues (Celery/BullMQ), and process asynchronous tasks with failure retries.",
                "deliverables": [
                    "Redis cache-aside implementation with configurable TTL and cache invalidation",
                    "Asynchronous worker queue processing background tasks (emails, notifications)",
                    "Dead-letter queue handling failed background job retries",
                    "Benchmark showing 5x+ latency reduction on cached endpoints"
                ],
                "tech_stack": ["Redis", "Celery / BullMQ", "PostgreSQL", "Python / Node.js"],
                "evaluation_focus": "Cache invalidation reliability, worker idempotency, and error handling"
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Week 4: Observability, Load Testing & Cloud Deployment (Mini-Capstone)",
                "objective": "Deploy the backend service to cloud infrastructure with Docker, configure structured JSON logging, Prometheus metrics, and execute load testing with Locust.",
                "deliverables": [
                    "Live deployed backend API URL connected to managed cloud PostgreSQL",
                    "Locust load testing report demonstrating sustained 200+ RPS with low latency",
                    "Structured logging with correlation IDs and health check endpoint (/health)",
                    "Walkthrough video and complete API documentation repository"
                ],
                "tech_stack": ["Docker", "Locust", "Prometheus", "Render / AWS", "GitHub Actions"],
                "evaluation_focus": "System throughput under stress, deployment reliability, and observability"
            },
        ],
    },
    "frontend": {
        "title": "Frontend Engineering",
        "description": "Modern frontend architectures: Next.js 15, React 19, TypeScript, Tailwind CSS, global state stores, component testing, and performance optimization.",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Week 1: Next.js 15 App Router, React 19 & Component Design Systems",
                "objective": "Architect a modular frontend application using Next.js 15 App Router, React 19 Server & Client Components, TypeScript, and a unified Tailwind CSS design system.",
                "deliverables": [
                    "Component hierarchy with reusable UI primitives (Buttons, Inputs, Cards, Modals)",
                    "Responsive layouts adapting smoothly across mobile, tablet, and widescreen views",
                    "Design tokens configuration with dark/light mode theme support",
                    "GitHub repository with clean structure, ESLint, and Prettier configuration"
                ],
                "tech_stack": ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Lucide Icons"],
                "evaluation_focus": "Component composition, responsive layout fluidness, and TypeScript rigor"
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Week 2: Advanced State Management, Form Validation & API Integration",
                "objective": "Implement predictable global state stores (Zustand), complex multi-step forms with React Hook Form + Zod, and data fetching with optimistic updates.",
                "deliverables": [
                    "Global state store managing user session, cart/workspace state, and UI toggles",
                    "Multi-step interactive form with real-time Zod schema validation and error feedback",
                    "Custom data fetching hooks with loading skeletons, error boundaries, and retries",
                    "Optimistic UI updates for immediate user feedback on mutations"
                ],
                "tech_stack": ["Zustand", "React Hook Form", "Zod", "TanStack Query", "Axios"],
                "evaluation_focus": "State predictability, validation error clarity, and smooth data loading states"
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Week 3: Micro-Animations, Accessibility (a11y) & Interactive Charts",
                "objective": "Enhance user experience with smooth Framer Motion micro-animations, interactive data visualizations with Recharts, and strict WCAG accessibility compliance.",
                "deliverables": [
                    "Page transitions and interactive micro-animations using Framer Motion",
                    "Interactive dashboard charts with tooltips and responsive scaling (Recharts)",
                    "Keyboard navigation support and ARIA attributes passing screen reader audits",
                    "WCAG 2.1 AA accessibility compliance audit report"
                ],
                "tech_stack": ["Framer Motion", "Recharts", "Radix UI", "Accessibility (a11y)"],
                "evaluation_focus": "Animation smoothness (60 FPS), chart interactivity, and accessibility score"
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Week 4: Automated Testing, Performance Optimization & Live Deployment",
                "objective": "Write automated component and E2E tests with Jest / Playwright, optimize bundle size and Core Web Vitals, and deploy live to Vercel.",
                "deliverables": [
                    "Jest / React Testing Library unit tests and Playwright E2E user flow tests",
                    "Lighthouse performance score 95+ with code-splitting and image optimization",
                    "Live public deployment URL on Vercel with automatic preview deployments",
                    "Demonstration video walkthrough and comprehensive technical README"
                ],
                "tech_stack": ["Jest", "Playwright", "Lighthouse", "Vercel", "GitHub Actions"],
                "evaluation_focus": "Core Web Vitals metrics, test automation pass rate, and deployment quality"
            },
        ],
    },
    "devops": {
        "title": "Cloud DevOps & Kubernetes",
        "description": "Cloud infrastructure automation: Linux server administration, Docker containerization, GitHub Actions CI/CD, Kubernetes orchestration, and AWS.",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Week 1: Linux Server Administration, Bash Automation & Git Flow",
                "objective": "Master Linux server administration: user permissions, systemd services, SSH key authentication, networking tools, and automated Bash scripting.",
                "deliverables": [
                    "Automated Bash scripts for server provisioning, backup, and health monitoring",
                    "Configured systemd service with automated restart and journalctl log rotation",
                    "Hardened SSH configuration with firewall rules (UFW / iptables)",
                    "GitHub repository documenting standard Git branching workflows"
                ],
                "tech_stack": ["Linux (Ubuntu/Debian)", "Bash", "Systemd", "SSH", "UFW"],
                "evaluation_focus": "Script robustness, error handling, and server security hardening"
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Week 2: Docker Containerization & Multi-Container Docker Compose",
                "objective": "Containerize full-stack services using multi-stage Dockerfiles, minimize image sizes, and orchestrate multi-container environments with Docker Compose.",
                "deliverables": [
                    "Multi-stage Dockerfiles for frontend, backend, and background worker services",
                    "Docker Compose stack linking App, PostgreSQL database, and Redis cache",
                    "Non-root container user configuration and vulnerability security scanning (Trivy)",
                    "Volume persistence and environment variable management documentation"
                ],
                "tech_stack": ["Docker", "Docker Compose", "Trivy", "Container Security"],
                "evaluation_focus": "Image size optimization (< 100MB), build caching efficiency, and security scans"
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Week 3: Continuous Integration & Delivery (CI/CD) with GitHub Actions",
                "objective": "Design end-to-end CI/CD pipelines in GitHub Actions with automated linting, unit testing, Docker Hub image build & push, and zero-downtime deployment.",
                "deliverables": [
                    ".github/workflows CI pipeline running tests and static analysis on PRs",
                    "Automated Docker image publishing to GitHub Container Registry / Docker Hub",
                    "Zero-downtime deployment trigger deploying to staging/production servers",
                    "Pipeline status badges and build failure alerting integration"
                ],
                "tech_stack": ["GitHub Actions", "Docker Hub", "CI/CD", "Automated Testing"],
                "evaluation_focus": "Pipeline speed, secret management security, and deployment reliability"
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Week 4: Kubernetes Cluster Orchestration & Cloud Deployment",
                "objective": "Deploy scalable applications onto Kubernetes clusters with Deployments, Services, Ingress controllers, ConfigMaps, Secrets, and automated Horizontal Pod Autoscaling (HPA).",
                "deliverables": [
                    "Kubernetes manifest files (Deployment, Service, Ingress, ConfigMap, Secret)",
                    "Horizontal Pod Autoscaler (HPA) configured with CPU/Memory utilization thresholds",
                    "Live deployed cloud application running on managed Kubernetes (EKS/GKE/Kind)",
                    "Architecture diagram and video walkthrough explaining cluster topology"
                ],
                "tech_stack": ["Kubernetes", "Helm", "kubectl", "AWS / Cloud", "Ingress NGINX"],
                "evaluation_focus": "Manifest correctness, rolling update zero-downtime capability, and autoscaling"
            },
        ],
    },
    "cyber-security": {
        "title": "Cyber Security & Ethical Hacking",
        "description": "Offensive and defensive security: network reconnaissance, OWASP Top 10 web vulnerabilities, cryptography, system hardening, and pen-testing.",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Week 1: Network Protocols, Packet Analysis & Active Reconnaissance",
                "objective": "Perform network packet analysis with Wireshark, active and passive reconnaissance with Nmap, and identify exposed services and open ports.",
                "deliverables": [
                    "Wireshark PCAP network capture analysis report detailing TCP handshakes and protocols",
                    "Nmap network topology and service version scanning audit report",
                    "OSINT reconnaissance documentation on a lab target domain",
                    "GitHub repository documenting ethical hacking methodology and legal boundaries"
                ],
                "tech_stack": ["Wireshark", "Nmap", "Linux", "OSINT Tools", "TCP/IP"],
                "evaluation_focus": "Reconnaissance depth, packet inspection accuracy, and methodology documentation"
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Week 2: OWASP Top 10 Web Application Vulnerability Assessment",
                "objective": "Audit web applications against OWASP Top 10 vulnerabilities (SQL Injection, XSS, CSRF, IDOR, SSRF) using Burp Suite and manual exploitation techniques.",
                "deliverables": [
                    "Vulnerability assessment report detailing findings on a designated lab application",
                    "Proof of Concept (PoC) exploit scripts and request payloads for detected flaws",
                    "Step-by-step developer remediation and secure coding recommendations",
                    "Burp Suite audit project file and testing logs"
                ],
                "tech_stack": ["Burp Suite", "OWASP ZAP", "SQLMap", "Web Security"],
                "evaluation_focus": "Vulnerability identification accuracy, PoC reproducibility, and remediation advice"
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Week 3: Applied Cryptography, SSL/TLS Hardening & IAM Security",
                "objective": "Implement symmetric (AES) and asymmetric (RSA/ECC) encryption in Python, configure TLS certificate security, and audit Identity & Access Management (IAM).",
                "deliverables": [
                    "Python cryptographic utility script performing secure encryption and digital signatures",
                    "SSL/TLS server configuration audit using testssl.sh / Qualys SSL Labs",
                    "IAM privilege escalation analysis and least-privilege security policy implementation",
                    "Secure password storage and hashing audit report (Argon2 / PBKDF2)"
                ],
                "tech_stack": ["Python Cryptography", "OpenSSL", "testssl.sh", "IAM Policies"],
                "evaluation_focus": "Crypto implementation correctness, cipher suite selection, and IAM auditing"
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Week 4: Defensive System Hardening, SIEM & Penetration Testing Audit",
                "objective": "Perform defensive Linux/Windows server hardening, configure host firewalls and intrusion detection (Fail2ban/Wazuh), and author a professional Penetration Testing Report.",
                "deliverables": [
                    "Professional Executive Penetration Testing & Vulnerability Assessment PDF Report",
                    "Automated Linux server hardening script (Fail2ban, iptables, disable root SSH)",
                    "SIEM log analysis walkthrough detecting brute-force attacks in real time",
                    "Video presentation summarizing high-risk findings and executive takeaways"
                ],
                "tech_stack": ["Fail2ban", "iptables", "Wazuh / Splunk", "Linux Hardening"],
                "evaluation_focus": "Report professional quality, severity classification (CVSS v3.1), and remediation"
            },
        ],
    },
    "ui-ux": {
        "title": "UI/UX Design & Modern Frontend",
        "description": "User experience design and frontend craftsmanship: Figma user research, wireframing, design systems, interactive prototypes, and React handoff.",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Week 1: User Research, Information Architecture & Low-Fi Wireframes",
                "objective": "Conduct target user discovery, user personas creation, user journey mapping, information architecture diagrams, and low-fidelity wireframing in Figma.",
                "deliverables": [
                    "Figma project link containing low-fidelity wireframes for all core user screens",
                    "User Persona cards and Empathy Maps detailing pain points and goals",
                    "Information Architecture (IA) sitemap and user flow diagram",
                    "Summary documentation of user research findings and design rationale"
                ],
                "tech_stack": ["Figma", "FigJam", "Miro", "Information Architecture"],
                "evaluation_focus": "User journey clarity, wireframe structure, and problem-solving focus"
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Week 2: Comprehensive Design Systems, Color Tokens & Typography",
                "objective": "Build a scalable, accessible design system in Figma utilizing auto-layout, component variants, typography hierarchy, and dark/light color tokens.",
                "deliverables": [
                    "Complete Figma Design System component library (Buttons, Inputs, Badges, Modals)",
                    "Design token definitions with semantic color palettes and typography scale",
                    "WCAG contrast compliance validation matrix (AAA / AA standard)",
                    "Component usage guideline documentation for developer handoff"
                ],
                "tech_stack": ["Figma Auto-Layout", "Design Tokens", "Accessibility Contrast"],
                "evaluation_focus": "Component modularity, auto-layout responsiveness, and token consistency"
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Week 3: High-Fidelity Interactive Prototypes & Micro-Interactions",
                "objective": "Create high-fidelity UI screens in Figma with realistic interactive prototypes, smart animations, modal overlays, and conduct usability testing.",
                "deliverables": [
                    "Clickable, interactive Figma prototype demonstrating complete user workflows",
                    "Micro-interaction specifications and transition choreography notes",
                    "Usability testing video recording with 3 test users and synthesized feedback report",
                    "Design iteration changelog based on usability findings"
                ],
                "tech_stack": ["Figma Smart Animate", "Interactive Components", "Usability Testing"],
                "evaluation_focus": "Prototype interactivity realism, visual aesthetics quality, and user feedback synthesis"
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Week 4: Production Frontend Implementation with React & Tailwind CSS",
                "objective": "Translate the Figma design system into pixel-perfect React + Tailwind CSS code with responsive adaptations, Framer Motion animations, and deploy live to Vercel.",
                "deliverables": [
                    "Live deployed frontend application matching the Figma design pixel-for-pixel (Vercel)",
                    "GitHub component repository with clean, maintainable JSX/TSX structure",
                    "Lighthouse performance and accessibility score 95+ audit",
                    "Case study presentation walkthrough video explaining design-to-code decisions"
                ],
                "tech_stack": ["React", "Tailwind CSS", "Next.js", "Framer Motion", "Vercel"],
                "evaluation_focus": "Visual fidelity to design, responsive behavior, and clean code handoff"
            },
        ],
    },
    "data-science": {
        "title": "Data Science & Big Data Analytics",
        "description": "Data exploration, statistical modeling, analytical SQL, predictive machine learning, and interactive business intelligence dashboards.",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Week 1: Data Wrangling, Statistical Distributions & Advanced EDA",
                "objective": "Perform deep exploratory data analysis, hypothesis testing, outlier detection, and statistical visualizations with Pandas and Seaborn.",
                "deliverables": [
                    "Jupyter EDA Notebook with statistical insights and hypothesis testing",
                    "Cleaned datasets repository with automated validation scripts",
                    "Feature distribution and outlier detection report",
                    "GitHub repository with clear documentation and summary insights"
                ],
                "tech_stack": ["Python 3.12", "Pandas", "NumPy", "Seaborn", "Scipy"],
                "evaluation_focus": "Statistical analysis depth, data cleaning rigor, and visual clarity"
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Week 2: Analytical SQL, Window Functions & Relational Data Modeling",
                "objective": "Write complex analytical SQL queries, window functions, CTEs, aggregation pipelines, and build data models in PostgreSQL.",
                "deliverables": [
                    "Analytical SQL queries file solving complex business aggregations",
                    "Relational schema ERD diagram with optimized indexes",
                    "Query execution performance report comparing optimization iterations",
                    "Automated SQL test script verifying query results"
                ],
                "tech_stack": ["PostgreSQL", "SQL Window Functions", "CTEs", "DBeaver"],
                "evaluation_focus": "Query efficiency, correct use of window functions, and schema design"
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Week 3: Predictive Modeling & Applied Machine Learning",
                "objective": "Train predictive regression & classification models with Scikit-Learn, evaluate performance metrics, and build feature importance pipelines.",
                "deliverables": [
                    "Scikit-Learn ML script with cross-validation and hyperparameter tuning",
                    "Model evaluation benchmark with precision, recall, and ROC-AUC curves",
                    "Feature importance analysis and model interpretation charts (SHAP)",
                    "Serialized model artifact (.pkl) with sample prediction runner"
                ],
                "tech_stack": ["Scikit-Learn", "XGBoost", "SHAP", "Joblib"],
                "evaluation_focus": "Model validation rigor, feature selection, and evaluation accuracy"
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Week 4: Business Intelligence Dashboards & Live Deployment",
                "objective": "Design interactive BI dashboards using Streamlit / Power BI, connect to live datasets, and deploy live with automated data refresh pipelines.",
                "deliverables": [
                    "Interactive Streamlit dashboard URL with filters and drill-down charts",
                    "GitHub repository containing the dashboard code and deployment configs",
                    "Executive insights summary slide deck with key actionable takeaways",
                    "Demonstration video explaining dashboard metrics to stakeholders"
                ],
                "tech_stack": ["Streamlit", "Plotly", "Python", "Render / Cloud"],
                "evaluation_focus": "Dashboard usability, insight clarity, and deployment stability"
            },
        ],
    },
    "android": {
        "title": "Android App Development",
        "description": "Modern Android application engineering: Kotlin, Jetpack Compose, MVVM architecture, Coroutines, Retrofit APIs, Room database, and Firebase.",
        "weeks": [
            {
                "week": 1,
                "key": "month1_week1",
                "title": "Week 1: Kotlin Foundations & Declarative UI with Jetpack Compose",
                "objective": "Build modern Android UI components with Jetpack Compose, Material 3 theming, state hoisting, and responsive screen adaptations.",
                "deliverables": [
                    "Android Studio project with clean package structure and Kotlin setup",
                    "Declarative Compose screens with Material 3 typography and dark mode",
                    "Custom reusable UI component kit (Buttons, TextFields, Cards)",
                    "GitHub repository with project README and UI screenshots"
                ],
                "tech_stack": ["Kotlin", "Jetpack Compose", "Material 3", "Android Studio"],
                "evaluation_focus": "Compose state management, UI fluidness, and Material 3 adherence"
            },
            {
                "week": 2,
                "key": "month1_week2",
                "title": "Week 2: MVVM Architecture, Coroutines & Reactive StateFlow",
                "objective": "Implement MVVM design pattern with ViewModel, Kotlin Coroutines for asynchronous work, and StateFlow for UI state binding.",
                "deliverables": [
                    "Layered MVVM architecture with Repository and ViewModel separation",
                    "Asynchronous network / background handling using Kotlin Coroutines",
                    "Reactive UI state management with StateFlow and Compose collectAsState",
                    "Unit tests verifying ViewModel logic with mock dependencies"
                ],
                "tech_stack": ["Kotlin Coroutines", "StateFlow", "ViewModel", "JUnit"],
                "evaluation_focus": "Architecture separation, coroutine lifecycle safety, and state reactivity"
            },
            {
                "week": 3,
                "key": "month1_week3",
                "title": "Week 3: REST API Integration (Retrofit) & Local DB Caching (Room)",
                "objective": "Integrate REST API calls with Retrofit + Moshi and create an offline-first caching layer with Room SQLite Database.",
                "deliverables": [
                    "Retrofit network service communicating with REST endpoints",
                    "Room SQLite database with entities, DAOs, and database migrations",
                    "Offline-first synchronization repository displaying cached data when offline",
                    "Network error handling and user retry feedback states"
                ],
                "tech_stack": ["Retrofit", "Moshi", "Room Database", "SQLite"],
                "evaluation_focus": "Offline-first capability, caching efficiency, and network error handling"
            },
            {
                "week": 4,
                "key": "month1_week4",
                "title": "Week 4: Firebase Integration, Signed Release APK & Mini-Capstone",
                "objective": "Add Firebase Authentication and notifications, configure ProGuard / R8 obfuscation, and generate a signed release APK with demo recording.",
                "deliverables": [
                    "Firebase Authentication integration with Google / Email sign-in",
                    "Signed release APK file uploaded to GitHub Releases",
                    "ProGuard / R8 code shrinking and obfuscation configuration",
                    "Video walkthrough demonstrating the Android app running on a device / emulator"
                ],
                "tech_stack": ["Firebase Auth", "ProGuard / R8", "Android Gradle", "APK Signing"],
                "evaluation_focus": "APK stability, release build configuration, and demo completeness"
            },
        ],
    },
}

DEFAULT_DOMAIN_TASKS = DOMAIN_TASKS["full-stack"]

CURATED_PROJECT_LIST = [
    {
        "id": "saas-platform",
        "title": "Enterprise Cloud SaaS Management Platform",
        "description": "Multi-tenant business management portal with Role-Based Access Control (RBAC), analytical telemetry charts, audit logs, and automated notification triggers.",
        "tech_stack": ["Next.js 15", "FastAPI / Node.js", "PostgreSQL", "Tailwind CSS", "Redis"],
    },
    {
        "id": "ai-rag-agent",
        "title": "AI Document Intelligence & Knowledge RAG Agent",
        "description": "Enterprise AI assistant that ingests company PDF manuals, computes vector embeddings, and performs semantic search & Q&A with source citations.",
        "tech_stack": ["Python", "PyTorch", "LangChain / LlamaIndex", "Chroma / Pinecone", "FastAPI", "React"],
    },
    {
        "id": "ecommerce-marketplace",
        "title": "High-Throughput E-Commerce Marketplace & Checkout",
        "description": "Full-scale commerce platform with catalog search, multi-faceted filtering, shopping cart state, order tracking, and secure payment checkout integration.",
        "tech_stack": ["Next.js 15", "PostgreSQL", "Razorpay / Stripe", "Redis Caching", "Tailwind CSS"],
    },
    {
        "id": "devops-gitops-k8s",
        "title": "Cloud-Native GitOps CI/CD & Kubernetes Observability",
        "description": "Production Kubernetes deployment automated with ArgoCD / GitHub Actions, ingress routing, SSL termination, and Prometheus / Grafana monitoring dashboards.",
        "tech_stack": ["Kubernetes", "Helm", "GitHub Actions", "Prometheus", "Grafana", "Docker"],
    },
    {
        "id": "cyber-pentest-audit",
        "title": "Enterprise Security Hardening & Penetration Testing Suite",
        "description": "Comprehensive vulnerability assessment, automated penetration testing scripts, defensive firewall hardening, and executive remediation audit report.",
        "tech_stack": ["Burp Suite", "Nmap", "Wireshark", "Python Security", "Linux Hardening"],
    },
    {
        "id": "collab-workspace",
        "title": "Real-Time Collaborative Workspace & Kanban System",
        "description": "Interactive team board with drag-and-drop task workflows, real-time WebSocket notifications, user mentions, and cloud file attachments.",
        "tech_stack": ["React", "WebSockets", "Node / FastAPI", "PostgreSQL", "Tailwind CSS"],
    },
]

# ─── Helper Functions ─────────────────────────────────────────────────────────

def get_tasks_for_domain(role_preference: Optional[str], duration: Optional[str] = "1 Month"):
    """
    Returns domain tasks tailored for the specific domain and duration:
    - 1 Month: 4 Weeks (Month 1 Foundation)
    - 3 Months: 12 Weeks (Month 1 Foundation + Month 2 Project Sprints + Month 3 Portfolio & Defense)
    - 6 Months: 24 Weeks (Complete 6-Month Enterprise Engineering Lifecycle)
    """
    selected_key = "full-stack"
    if role_preference:
        r = role_preference.lower()
        if "ai" in r or "machine" in r:
            selected_key = "ai-ml"
        elif "data science" in r or "analytics" in r:
            selected_key = "data-science"
        elif "python" in r:
            selected_key = "python"
        elif "java" in r or "spring" in r:
            selected_key = "java"
        elif "backend" in r:
            selected_key = "backend"
        elif "frontend" in r:
            selected_key = "frontend"
        elif "android" in r or "app" in r or "kotlin" in r:
            selected_key = "android"
        elif "devops" in r or "cloud" in r or "docker" in r or "kubernetes" in r:
            selected_key = "devops"
        elif "cyber" in r or "security" in r or "ethical" in r:
            selected_key = "cyber-security"
        elif "design" in r or "ui" in r or "ux" in r:
            selected_key = "ui-ux"
        else:
            selected_key = "full-stack"

    selected_domain = DOMAIN_TASKS.get(selected_key, DOMAIN_TASKS["full-stack"])
    domain_title = selected_domain["title"]
    domain_desc = selected_domain.get("description", "")
    base_weeks = selected_domain["weeks"][:4]  # First 4 foundational weeks

    # Build full 24 weeks curriculum
    full_weeks = []
    # Month 1 (Weeks 1-4)
    for idx, w in enumerate(base_weeks, 1):
        full_weeks.append({
            **w,
            "week": idx,
            "month": 1,
            "month_title": "Month 1: Foundational Engineering Deliverables",
            "key": f"month1_week{idx}"
        })

    # Month 2 (Weeks 5-8) - Full-Scale Industry Project Implementation Sprints
    full_weeks.extend([
        {
            "week": 5,
            "month": 2,
            "month_title": "Month 2: Full-Scale Industry Project Implementation",
            "key": "month2_week5",
            "title": f"Week 5: {domain_title} Project Architecture & Entity Schema Design",
            "objective": f"Kick off your full-scale industry project in {domain_title}. Design system architecture, entity relationships (ERD), API contracts, and repository scaffolding.",
            "deliverables": [
                "System architecture diagram and complete database entity-relationship schema",
                "Monorepo / modular repository scaffolding with environment configuration",
                "API contract specification (OpenAPI / Swagger or schema definitions)",
                "Project sprint backlog & milestone breakdown documented in GitHub Projects"
            ],
            "tech_stack": base_weeks[0].get("tech_stack", []) + ["Git", "Architecture", "Docker"],
            "evaluation_focus": "System design depth, relational schema normalization, and modular repository structure"
        },
        {
            "week": 6,
            "month": 2,
            "month_title": "Month 2: Full-Scale Industry Project Implementation",
            "key": "month2_week6",
            "title": f"Week 6: {domain_title} Core Business Logic & Feature CRUD Implementation",
            "objective": f"Implement the core workflows, database migrations, authentication guards, and business logic for your {domain_title} project.",
            "deliverables": [
                "Complete CRUD implementation for primary domain business entities",
                "Secure authentication and session management integration",
                "Database seed scripts and verified migration procedures",
                "Weekly feature demo recording showing functional CRUD workflows"
            ],
            "tech_stack": base_weeks[1].get("tech_stack", []) + ["PostgreSQL", "JWT / Auth"],
            "evaluation_focus": "Business logic integrity, error handling, and clean controller/service separation"
        },
        {
            "week": 7,
            "month": 2,
            "month_title": "Month 2: Full-Scale Industry Project Implementation",
            "key": "month2_week7",
            "title": f"Week 7: {domain_title} Advanced Integrations, Security & Caching",
            "objective": f"Integrate third-party APIs (payment gateway, cloud storage, AI/ML models or notifications), implement caching, and conduct security audits.",
            "deliverables": [
                "Third-party service integrations (Cloudinary/S3, Webhooks, or AI endpoints)",
                "Redis / memory caching for high-frequency database read operations",
                "Defensive input validation, rate limiting, and CORS security hardening",
                "Integration test suite covering happy paths and failure scenarios"
            ],
            "tech_stack": ["Redis", "Cloud Storage", "Webhooks", "Security Auditing"],
            "evaluation_focus": "Resilience of external integrations, caching efficiency, and security posture"
        },
        {
            "week": 8,
            "month": 2,
            "month_title": "Month 2: Full-Scale Industry Project Implementation",
            "key": "month2_week8",
            "title": f"Week 8: {domain_title} Containerization, CI/CD & Production Cloud Deployment",
            "objective": f"Containerize the complete application with Docker, configure automated GitHub Actions CI/CD pipelines, and deploy live to production cloud infrastructure.",
            "deliverables": [
                "Multi-stage Dockerfile and docker-compose orchestration",
                "Automated GitHub Actions workflow running tests and build checks on push",
                "Live production cloud deployment URL with SSL certificate configured",
                "Comprehensive project README with setup instructions, architecture diagram, and API docs"
            ],
            "tech_stack": ["Docker", "GitHub Actions", "Cloud Hosting (Vercel/Render/AWS)", "Nginx"],
            "evaluation_focus": "Deployment reliability, container image optimization, and live demo polish"
        }
    ])

    # Month 3 (Weeks 9-12) - Optimization, Developer Portfolio & Exit Defense
    full_weeks.extend([
        {
            "week": 9,
            "month": 3,
            "month_title": "Month 3: Performance Optimization & Developer Portfolio",
            "key": "month3_week9",
            "title": f"Week 9: {domain_title} Performance Benchmarking, Indexing & Query Profiling",
            "objective": "Conduct load testing, database query analysis, optimize response times below 200ms, and benchmark system throughput under concurrent traffic.",
            "deliverables": [
                "Locust / k6 load testing script simulating concurrent user traffic",
                "Query execution analysis (EXPLAIN ANALYZE) and optimized database indexes",
                "Performance benchmark comparison report before and after optimizations",
                "Application monitoring / logging setup with structured JSON outputs"
            ],
            "tech_stack": ["Locust / k6", "PostgreSQL Indexing", "Profiling", "Structured Logging"],
            "evaluation_focus": "Latency reduction, throughput scalability, and systematic optimization analysis"
        },
        {
            "week": 10,
            "month": 3,
            "month_title": "Month 3: Performance Optimization & Developer Portfolio",
            "key": "month3_week10",
            "title": "Week 10: Personal Developer Portfolio & Project Showcase Architecture",
            "objective": "Design and architect a modern, responsive personal developer portfolio showcasing your internship engineering milestones, live demos, and technical skills.",
            "deliverables": [
                "Responsive portfolio repository with modern interactive UI components",
                "Interactive project showcase cards featuring live demo links and GitHub links",
                "Technical skills, certifications, and engineering journey narrative sections",
                "Contact form integration with automated email notification dispatch"
            ],
            "tech_stack": ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],
            "evaluation_focus": "Visual design excellence, interactive animations, and responsive cross-device layout"
        },
        {
            "week": 11,
            "month": 3,
            "month_title": "Month 3: Performance Optimization & Developer Portfolio",
            "key": "month3_week11",
            "title": "Week 11: Production Portfolio Cloud Deployment & SEO Optimization",
            "objective": "Deploy your personal developer portfolio to production CDN/cloud with custom domain routing, OpenGraph meta tags, and Lighthouse performance scores > 90.",
            "deliverables": [
                "Live production portfolio URL deployed on Vercel / Cloudflare with custom domain",
                "OpenGraph social preview metadata and semantic HTML SEO hierarchy",
                "Lighthouse performance, accessibility, best practices, and SEO audit report (>90)",
                "Interactive resume download and project walkthrough videos embedded"
            ],
            "tech_stack": ["Vercel / Cloudflare", "Lighthouse", "SEO Metadata", "Analytics"],
            "evaluation_focus": "Production deployment health, Lighthouse optimization, and portfolio presentation"
        },
        {
            "week": 12,
            "month": 3,
            "month_title": "Month 3: Performance Optimization & Developer Portfolio",
            "key": "month3_week12",
            "title": "Week 12: Final Evaluation, Exit Technical Defense & Capstone Submission",
            "objective": "Consolidate all project codebases, live deployments, documentation, and deliver a comprehensive technical defense for internship graduation and certificate issuance.",
            "deliverables": [
                "Consolidated internship capstone repository with all 12 weeks of code and documentation",
                "Comprehensive 5-minute video walkthrough explaining architecture, challenges, and live demos",
                "Completed student exit evaluation and technical defense submission form",
                "Verified links for all Month 1, Month 2, and Month 3 deliverables"
            ],
            "tech_stack": ["Full Engineering Stack", "Video Walkthrough", "Final Documentation"],
            "evaluation_focus": "Overall engineering competency, clarity of technical defense, and deliverable completeness"
        }
    ])

    # Months 4-6 (Weeks 13-24) - Enterprise Scalability & Cloud Orchestration (for 6M)
    # Month 4 (Weeks 13-16)
    for w_i, (t_title, t_obj) in enumerate([
        ("Enterprise Microservice Architecture & Event Bus", "Decompose monolithic services into decoupled microservices communicating via message brokers (RabbitMQ/Kafka/Redis PubSub)."),
        ("Asynchronous Background Workers & Distributed Queues", "Implement high-reliability background job processors with exponential retry policies and dead-letter queues."),
        ("Database Sharding, Read-Replicas & Connection Pooling", "Set up database read replicas with PgBouncer connection pooling and high-availability failover."),
        ("Zero-Trust API Gateway & OAuth2 Distributed Sessions", "Deploy an API Gateway with rate limiting, centralized token validation, and OAuth2 session management.")
    ], 13):
        full_weeks.append({
            "week": w_i,
            "month": 4,
            "month_title": "Month 4: Enterprise Scalability & Microservices Architecture",
            "key": f"month4_week{w_i}",
            "title": f"Week {w_i}: {t_title}",
            "objective": t_obj,
            "deliverables": [
                f"Production code and architectural blueprint for {t_title}",
                "Integration test harness verifying distributed reliability",
                "GitHub repository branch with documentation and setup commands",
                "Live demo recording showcasing distributed execution"
            ],
            "tech_stack": ["RabbitMQ/Kafka", "Microservices", "PgBouncer", "API Gateway"],
            "evaluation_focus": "Distributed systems reliability, data consistency, and architectural elegance"
        })

    # Month 5 (Weeks 17-20)
    for w_i, (t_title, t_obj) in enumerate([
        ("Enterprise AI Agent Integration & Multimodal RAG", "Build enterprise-grade AI copilots with vector search, hybrid retrieval, and streaming LLM responses."),
        ("Automated E2E Testing Suites & CI Regression Gates", "Implement end-to-end testing with Playwright/Cypress integrated into automated GitHub Actions pull request gates."),
        ("OWASP Top 10 Security Hardening & Vulnerability Remediation", "Conduct penetration testing, SAST/DAST static analysis, and harden application against SQLi, XSS, SSRF, and CSRF."),
        ("Real-Time Telemetry, Distributed Tracing & APM Dashboards", "Integrate OpenTelemetry, Prometheus, Grafana, and Sentry for real-time alerting and distributed request tracing.")
    ], 17):
        full_weeks.append({
            "week": w_i,
            "month": 5,
            "month_title": "Month 5: Enterprise AI, Automated QA & Security Audits",
            "key": f"month5_week{w_i}",
            "title": f"Week {w_i}: {t_title}",
            "objective": t_obj,
            "deliverables": [
                f"Implementation deliverables for {t_title}",
                "Automated test and security audit report with zero critical vulnerabilities",
                "Observability dashboard screenshots and trace metrics",
                "GitHub repository with configuration manifests"
            ],
            "tech_stack": ["OpenTelemetry", "Playwright", "OWASP Hardening", "Grafana", "LangChain"],
            "evaluation_focus": "Defensive security posture, testing coverage, and automated observability"
        })

    # Month 6 (Weeks 21-24)
    for w_i, (t_title, t_obj) in enumerate([
        ("Kubernetes Cluster Orchestration & Helm Charts", "Package and deploy the enterprise application to a Kubernetes cluster using custom Helm charts with auto-scaling (HPA)."),
        ("Infrastructure as Code (IaC) with Terraform & Cloud Provisioning", "Automate complete cloud infrastructure provisioning using Terraform scripts with modular state management."),
        ("Zero-Downtime Blue/Green & Canary Rollouts", "Implement progressive traffic splitting and automated zero-downtime rolling deployments with rollback triggers."),
        ("Grand Capstone Defense, Enterprise Audit & Fellowship Graduation", "Deliver the final 6-month enterprise capstone project defense before technical evaluation panel.")
    ], 21):
        full_weeks.append({
            "week": w_i,
            "month": 6,
            "month_title": "Month 6: Cloud Orchestration, Zero-Downtime Rollout & Grand Defense",
            "key": f"month6_week{w_i}",
            "title": f"Week {w_i}: {t_title}",
            "objective": t_obj,
            "deliverables": [
                f"Production deployment manifests and architecture for {t_title}",
                "Live Kubernetes/Terraform infrastructure verification recording",
                "Complete capstone technical documentation and executive summary",
                "Final 6-month exit evaluation and defense submission"
            ],
            "tech_stack": ["Kubernetes", "Helm", "Terraform", "CI/CD", "Cloud Architecture"],
            "evaluation_focus": "Cloud-native infrastructure mastery, high-availability architecture, and executive defense"
        })

    # Slice weeks based on duration:
    # 6 Months -> 24 Weeks (Months 1 to 6)
    # 3 Months -> 12 Weeks (Months 1, 2, 3)
    # 1 Month -> 4 Weeks (Month 1)
    dur_str = str(duration or "1 Month").strip().lower()
    if "6" in dur_str or dur_str == "6 months":
        target_weeks = full_weeks
    elif "3" in dur_str or dur_str == "3 months":
        target_weeks = full_weeks[:12]
    else:
        target_weeks = full_weeks[:4]

    return {
        "title": domain_title,
        "description": domain_desc,
        "weeks": target_weeks
    }


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
    submissions = db.query(InternshipSubmission).filter(
        (func.lower(InternshipSubmission.student_email) == clean_email) | (InternshipSubmission.application_id == app.id)
    ).all()
    sub_map = {s.task_key: s for s in submissions}

    # Fetch unlock requests
    unlock_requests = db.query(TaskUnlockRequest).filter(
        (func.lower(TaskUnlockRequest.student_email) == clean_email) | (TaskUnlockRequest.application_id == app.id)
    ).all()
    unlock_map = {u.task_key: u for u in unlock_requests}

    # Domain tasks
    duration_str = app.duration or "1 Month"
    domain_pack = get_tasks_for_domain(app.role_preference, duration_str)

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
        m_num = t.get("month", math.ceil(w_num / 4))
        t_key = t["key"]
        required_days = (w_num - 1) * 7
        
        # Match existing submission flexibly for backward compatibility
        existing_sub = sub_map.get(t_key)
        if not existing_sub:
            existing_sub = sub_map.get(f"week{w_num}")
        if not existing_sub and m_num == 2 and w_num in (5, 8):
            existing_sub = sub_map.get("month2_project")
        if not existing_sub and m_num == 3 and w_num in (9, 12):
            existing_sub = sub_map.get("month3_portfolio")
        if not existing_sub and m_num >= 4 and w_num in (13, 24):
            existing_sub = sub_map.get("month4_6_capstone")

        # Match existing unlock request flexibly
        existing_unlock_req = unlock_map.get(t_key)
        if not existing_unlock_req:
            existing_unlock_req = unlock_map.get(f"week{w_num}")
        if not existing_unlock_req and m_num == 2 and w_num in (5, 8):
            existing_unlock_req = unlock_map.get("month2_project")
        if not existing_unlock_req and m_num == 3 and w_num in (9, 12):
            existing_unlock_req = unlock_map.get("month3_portfolio")
        if not existing_unlock_req and m_num >= 4 and w_num in (13, 24):
            existing_unlock_req = unlock_map.get("month4_6_capstone")

        is_manually_unlocked = bool(existing_sub and existing_sub.is_unlocked)
        if existing_unlock_req and existing_unlock_req.status == "approved":
            is_manually_unlocked = True

        is_unlocked = (days_elapsed >= required_days) or is_manually_unlocked or (w_num == 1)

        weekly_tasks.append({
            **t,
            "required_days": required_days,
            "is_unlocked": is_unlocked,
            "submission": {
                "id": existing_sub.id,
                "project_topic": existing_sub.project_topic,
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
    email_filters = [StudentDoubt.student_email == clean_email, StudentDoubt.application_id == app.id]
    if app.email:
        email_filters.append(StudentDoubt.student_email == app.email.strip().lower())
    if app.google_email:
        email_filters.append(StudentDoubt.student_email == app.google_email.strip().lower())

    from sqlalchemy import or_
    doubts = db.query(StudentDoubt)\
               .filter(or_(*email_filters))\
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
    background_tasks: BackgroundTasks,
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

        background_tasks.add_task(
            send_submission_confirmation_email,
            student_email=clean_email,
            student_name=app.full_name,
            task_title=payload.title,
            github_url=payload.github_url,
            live_url=payload.live_url,
            is_resubmission=True
        )
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

        background_tasks.add_task(
            send_submission_confirmation_email,
            student_email=clean_email,
            student_name=app.full_name,
            task_title=payload.title,
            github_url=payload.github_url,
            live_url=payload.live_url,
            is_resubmission=False
        )
        return {"success": True, "message": "Task submitted successfully", "id": new_sub.id}


@router.post("/tasks/request-unlock")
def request_task_unlock(
    payload: UnlockRequestPayload,
    background_tasks: BackgroundTasks,
    email: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Student submits an unlock request for a locked / missed task.
    """
    clean_email = email.strip().lower()
    app = db.query(InternshipApplication)\
            .filter((func.lower(InternshipApplication.email) == clean_email) | (func.lower(InternshipApplication.google_email) == clean_email))\
            .order_by(InternshipApplication.created_at.desc())\
            .first()

    if not app:
        raise HTTPException(status_code=404, detail="Student internship application not found")

    existing = db.query(TaskUnlockRequest)\
                 .filter(
                     (func.lower(TaskUnlockRequest.student_email) == clean_email) | (TaskUnlockRequest.application_id == app.id),
                     TaskUnlockRequest.task_key == payload.task_key
                 )\
                 .first()

    if existing:
        existing.reason = payload.reason
        existing.status = "pending"
        existing.application_id = app.id
        existing.student_email = clean_email
        existing.student_name = app.full_name
        existing.updated_at = datetime.utcnow()
        db.commit()

        background_tasks.add_task(
            send_unlock_request_received_email,
            student_email=clean_email,
            student_name=app.full_name,
            task_title=payload.task_title,
            reason=payload.reason
        )
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

        background_tasks.add_task(
            send_unlock_request_received_email,
            student_email=clean_email,
            student_name=app.full_name,
            task_title=payload.task_title,
            reason=payload.reason
        )
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

