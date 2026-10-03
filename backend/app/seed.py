from app.shared.database import SessionLocal, Base, engine
from app.shared.security import get_password_hash
from app.auth.models import Admin
from app.courses.models import Course, CourseRegistration
from app.internship.models import InternshipApplication
from app.payments.models import Payment
from app.core.config import settings

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admins_to_seed = [
            ("admin@internvision.tech", "InternVision Super Admin"),
            ("admin@internvisiontech.me", "InternVision Super Admin"),
        ]
        if settings.ADMIN_EMAIL:
            admins_to_seed.append((settings.ADMIN_EMAIL, "InternVision Super Admin"))

        for admin_email, name in admins_to_seed:
            existing_admin = db.query(Admin).filter(Admin.email == admin_email).first()
            if not existing_admin:
                admin = Admin(
                    email=admin_email,
                    hashed_password=get_password_hash("Admin@123456"),
                    full_name=name,
                    is_active=True,
                    role="super_admin"
                )
                db.add(admin)
                print(f"[SEED] Created Admin: {admin_email} / Admin@123456")

        if db.query(Course).count() == 0:
            sample_courses = [
                Course(
                    title="Full Stack Web Development Bootcamp",
                    slug="full-stack-web-development",
                    description="Master modern web development using Next.js 15, React 19, TypeScript, FastAPI, and PostgreSQL. Build production applications from scratch.",
                    price_inr=1,
                    duration="8 Weeks",
                    level="Intermediate",
                    technologies=["Next.js", "React", "TypeScript", "FastAPI", "PostgreSQL"],
                    is_published=True
                ),
                Course(
                    title="AI & Machine Learning Engineering",
                    slug="ai-machine-learning-engineering",
                    description="Deep dive into Machine Learning, Neural Networks, PyTorch, Large Language Models (LLMs), and AI Agent development.",
                    price_inr=1,
                    duration="12 Weeks",
                    level="Advanced",
                    technologies=["Python", "PyTorch", "OpenAI API", "LangChain", "Vector DBs"],
                    is_published=True
                ),
                Course(
                    title="Cloud DevOps & Kubernetes Mastery",
                    slug="cloud-devops-kubernetes-mastery",
                    description="Learn Docker, Kubernetes, CI/CD pipelines, AWS deployment, Terraform, and monitoring tools like Prometheus and Grafana.",
                    price_inr=1,
                    duration="10 Weeks",
                    level="Intermediate",
                    technologies=["Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions"],
                    is_published=True
                ),
                Course(
                    title="Cyber Security & Ethical Hacking",
                    slug="cyber-security-ethical-hacking",
                    description="Understand network security, penetration testing, cryptography, web vulnerability assessment, and defensive security strategies.",
                    price_inr=1,
                    duration="8 Weeks",
                    level="Beginner",
                    technologies=["Linux", "Metasploit", "Wireshark", "Burp Suite", "Python"],
                    is_published=True
                )
            ]
            db.add_all(sample_courses)
            print(f"[SEED] Seeded {len(sample_courses)} courses")

        if db.query(InternshipApplication).count() == 0:
            sample_apps = [
                InternshipApplication(
                    full_name="Alice",
                    email="alice@example.com",
                    phone="+91 9876543210",
                    college="Institute of Technology",
                    degree="B.Tech Computer Science",
                    year_of_study="3rd Year",
                    skills=["React", "Node.js", "Python"],
                    duration="3 Months",
                    status="pending"
                ),
                InternshipApplication(
                    full_name="Bob",
                    email="bob@example.com",
                    phone="+91 9812345678",
                    college="University of Engineering",
                    degree="B.E. Information Technology",
                    year_of_study="4th Year",
                    skills=["FastAPI", "PostgreSQL", "Docker"],
                    duration="2 Months",
                    status="accepted"
                ),
            ]
            db.add_all(sample_apps)
            print(f"[SEED] Seeded {len(sample_apps)} sample internship applications")

        from app.sessions.models import LiveSession
        if db.query(LiveSession).count() == 0:
            sample_sessions = [
                LiveSession(
                    title="GitHub Mastery & Open Source Engineering",
                    slug="github-mastery-open-source-engineering",
                    description="Master enterprise Git workflows, GitHub Actions CI/CD automation, pull request reviews, and building impactful open-source contributions.",
                    key_takeaways=[
                        "Advanced Git branching, rebasing, stash & conflict resolution",
                        "Building automated CI/CD workflows with GitHub Actions",
                        "Crafting high-impact GitHub portfolios & open source contributions",
                        "Production Pull Request reviews and collaborative workflow"
                    ],
                    session_date="Saturday, 25 Oct 2026",
                    session_time="06:00 PM IST",
                    duration="90 Mins",
                    is_free=True,
                    price_inr=0,
                    thumbnail_url="https://images.unsplash.com/photo-1618401471353-b98aedd04e11?q=80&w=1000&auto=format&fit=crop",
                    instructor_name="InternVision Mentorship Team",
                    instructor_role="Senior Engineering Lead & Mentor",
                    meeting_platform="Google Meet",
                    max_seats=200,
                    category="Git & Open Source",
                    tags=["GitHub", "Git", "Open Source", "CI/CD", "DevOps"],
                    is_published=True
                ),
                LiveSession(
                    title="Docker & Kubernetes Containerization Deep Dive",
                    slug="docker-kubernetes-containerization-deep-dive",
                    description="From zero to production microservices: Learn multi-stage Docker builds, container orchestration, Kubernetes pods, deployments, and cloud scalability.",
                    key_takeaways=[
                        "Writing ultra-lightweight multi-stage Dockerfiles for apps",
                        "Multi-container orchestration with Docker Compose",
                        "Core Kubernetes primitives: Pods, Services & Deployments",
                        "Zero-downtime rolling updates & cloud microservices scaling"
                    ],
                    session_date="Sunday, 26 Oct 2026",
                    session_time="05:30 PM IST",
                    duration="2 Hours",
                    is_free=True,
                    price_inr=0,
                    thumbnail_url="https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=1000&auto=format&fit=crop",
                    instructor_name="InternVision Mentorship Team",
                    instructor_role="Cloud DevOps Architect",
                    meeting_platform="Google Meet",
                    max_seats=150,
                    category="Cloud & DevOps",
                    tags=["Docker", "Kubernetes", "DevOps", "Microservices", "Containers"],
                    is_published=True
                ),
                LiveSession(
                    title="Full Stack Architecture with Next.js 15 & FastAPI",
                    slug="fullstack-nextjs15-fastapi-architecture",
                    description="Build enterprise web applications using React Server Components, Next.js 15 App Router, high-throughput asynchronous Python FastAPI, and PostgreSQL.",
                    key_takeaways=[
                        "Architecting scalable Next.js 15 App Router with SSR & SSG",
                        "High-speed Async REST API design & validation with FastAPI",
                        "PostgreSQL connection pooling and query optimization",
                        "Securing production applications with JWT & rate limiting"
                    ],
                    session_date="Saturday, 01 Nov 2026",
                    session_time="07:00 PM IST",
                    duration="2.5 Hours",
                    is_free=False,
                    price_inr=99,
                    thumbnail_url="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
                    instructor_name="InternVision Mentorship Team",
                    instructor_role="Principal Full Stack Architect",
                    meeting_platform="Google Meet",
                    max_seats=100,
                    category="Web Development",
                    tags=["Next.js 15", "FastAPI", "React", "TypeScript", "PostgreSQL"],
                    is_published=True
                ),
                LiveSession(
                    title="Python AI & Generative AI Engineering Masterclass",
                    slug="python-ai-generative-ai-masterclass",
                    description="Learn to construct production-ready AI pipelines, LangChain integrations, OpenAI APIs, vector databases, and custom Retrieval-Augmented Generation (RAG) agents.",
                    key_takeaways=[
                        "Building multi-modal AI agents with Python & LangChain",
                        "Vector embeddings & retrieval using Pinecone and ChromaDB",
                        "Prompt engineering and automated tool calling workflows",
                        "Deploying scalable AI microservices on cloud infrastructure"
                    ],
                    session_date="Sunday, 02 Nov 2026",
                    session_time="06:30 PM IST",
                    duration="2 Hours",
                    is_free=False,
                    price_inr=149,
                    thumbnail_url="https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1000&auto=format&fit=crop",
                    instructor_name="InternVision Mentorship Team",
                    instructor_role="AI & Machine Learning Lead",
                    meeting_platform="Google Meet",
                    max_seats=120,
                    category="AI & Data Science",
                    tags=["Python", "Generative AI", "LangChain", "OpenAI", "RAG"],
                    is_published=True
                ),
                LiveSession(
                    title="High-Performance Backend System Design & Microservices",
                    slug="backend-system-design-microservices",
                    description="Master distributed system concepts, Redis caching tiers, Kafka event-driven architectures, database sharding, and high-availability design for tech interviews.",
                    key_takeaways=[
                        "Designing high-scale distributed systems from scratch",
                        "Redis caching patterns, cache invalidation & write strategies",
                        "Asynchronous message broker architecture using Apache Kafka",
                        "Database partitioning, replication, and CAP theorem trade-offs"
                    ],
                    session_date="Saturday, 08 Nov 2026",
                    session_time="06:00 PM IST",
                    duration="2.5 Hours",
                    is_free=False,
                    price_inr=199,
                    thumbnail_url="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop",
                    instructor_name="InternVision Mentorship Team",
                    instructor_role="Enterprise Systems Architect",
                    meeting_platform="Google Meet",
                    max_seats=80,
                    category="Backend & System Design",
                    tags=["System Design", "Microservices", "Redis", "Kafka", "Databases"],
                    is_published=True
                ),
                LiveSession(
                    title="Cyber Security, Ethical Hacking & Web App Defense",
                    slug="cyber-security-ethical-hacking-defense",
                    description="Explore OWASP Top 10 web vulnerabilities, SQL injection, XSS defense, penetration testing methodologies, and secure cloud infrastructure hardening.",
                    key_takeaways=[
                        "Practical identification & exploitation of OWASP Top 10 flaws",
                        "Network scanning, traffic analysis, and Burp Suite techniques",
                        "Securing APIs and implementing defense-in-depth protocols",
                        "Live vulnerability assessment walkthrough on demo applications"
                    ],
                    session_date="Sunday, 09 Nov 2026",
                    session_time="05:00 PM IST",
                    duration="2 Hours",
                    is_free=True,
                    price_inr=0,
                    thumbnail_url="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
                    instructor_name="InternVision Mentorship Team",
                    instructor_role="Information Security Specialist",
                    meeting_platform="Google Meet",
                    max_seats=180,
                    category="Cyber Security",
                    tags=["Cyber Security", "Ethical Hacking", "OWASP", "Network Security"],
                    is_published=True
                )
            ]
            db.add_all(sample_sessions)
            print(f"[SEED] Seeded {len(sample_sessions)} live masterclass sessions")

        db.commit()
        print("[SEED] Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"[SEED ERROR] Database seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
