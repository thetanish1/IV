from app.shared.database import SessionLocal, Base, engine
from app.shared.security import get_password_hash
from app.auth.models import Admin
from app.courses.models import Course, CourseRegistration
from app.internship.models import InternshipApplication
from app.payments.models import Payment

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin_email = "admin@internvision.tech"
        existing_admin = db.query(Admin).filter(Admin.email == admin_email).first()
        if not existing_admin:
            admin = Admin(
                email=admin_email,
                hashed_password=get_password_hash("Admin@123456"),
                full_name="InternVision Admin",
                is_active=True
            )
            db.add(admin)
            print(f"[SEED] Created default Admin: {admin_email} / Admin@123456")

        if db.query(Course).count() == 0:
            sample_courses = [
                Course(
                    title="Full Stack Web Development Bootcamp",
                    slug="full-stack-web-development",
                    description="Master modern web development using Next.js 15, React 19, TypeScript, FastAPI, and PostgreSQL. Build production applications from scratch.",
                    price_inr=4999,
                    duration="8 Weeks",
                    level="Intermediate",
                    technologies=["Next.js", "React", "TypeScript", "FastAPI", "PostgreSQL"],
                    is_published=True
                ),
                Course(
                    title="AI & Machine Learning Engineering",
                    slug="ai-machine-learning-engineering",
                    description="Deep dive into Machine Learning, Neural Networks, PyTorch, Large Language Models (LLMs), and AI Agent development.",
                    price_inr=6999,
                    duration="12 Weeks",
                    level="Advanced",
                    technologies=["Python", "PyTorch", "OpenAI API", "LangChain", "Vector DBs"],
                    is_published=True
                ),
                Course(
                    title="Cloud DevOps & Kubernetes Mastery",
                    slug="cloud-devops-kubernetes-mastery",
                    description="Learn Docker, Kubernetes, CI/CD pipelines, AWS deployment, Terraform, and monitoring tools like Prometheus and Grafana.",
                    price_inr=5499,
                    duration="10 Weeks",
                    level="Intermediate",
                    technologies=["Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions"],
                    is_published=True
                ),
                Course(
                    title="Cyber Security & Ethical Hacking",
                    slug="cyber-security-ethical-hacking",
                    description="Understand network security, penetration testing, cryptography, web vulnerability assessment, and defensive security strategies.",
                    price_inr=5999,
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
                    full_name="Aarav Sharma",
                    email="aarav.sharma@example.com",
                    phone="+91 9876543210",
                    college="IIT Bombay",
                    degree="B.Tech Computer Science",
                    year_of_study="3rd Year",
                    skills=["React", "Node.js", "Python"],
                    duration="3 Months",
                    status="pending"
                ),
                InternshipApplication(
                    full_name="Priya Patel",
                    email="priya.patel@example.com",
                    phone="+91 9812345678",
                    college="BITS Pilani",
                    degree="B.E. Information Technology",
                    year_of_study="4th Year",
                    skills=["FastAPI", "PostgreSQL", "Docker"],
                    duration="6 Months",
                    status="accepted"
                ),
                InternshipApplication(
                    full_name="Rohan Verma",
                    email="rohan.verma@example.com",
                    phone="+91 9765432109",
                    college="NIT Trichy",
                    degree="B.Tech Mechanical Engineering",
                    year_of_study="2nd Year",
                    skills=["Python", "HTML/CSS", "Git"],
                    duration="1 Month",
                    status="pending"
                )
            ]
            db.add_all(sample_apps)
            print(f"[SEED] Seeded {len(sample_apps)} sample internship applications")

        db.commit()
        print("[SEED] Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"[SEED ERROR] Database seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
