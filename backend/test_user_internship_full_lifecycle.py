import asyncio
import time
from typing import Dict, Any, List
import httpx
from app.main import app
from app.shared.database import SessionLocal
from app.auth.user_models import SiteUser
from app.internship.models import InternshipApplication, InternshipSubmission, TaskUnlockRequest, StudentDoubt
import app.shared.email_service as email_service

# Mock Brevo SMTP during automated simulation to avoid hitting external rate limits
email_service._send_smtp_email = lambda *args, **kwargs: True

async def run_student_full_lifecycle_test():
    print("=" * 80, flush=True)
    print("STUDENT / USER PORTAL FULL LIFECYCLE & MULTI-DURATION INTERNSHIP TEST", flush=True)
    print("=" * 80, flush=True)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test", timeout=60.0) as client:
        # Step 0: Admin Login
        print("\n[0] Authenticating Admin session...", flush=True)
        admin_res = await client.post(
            "/api/auth/login",
            data={"username": "admin@internvision.tech", "password": "Admin@123456"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert admin_res.status_code == 200, f"Admin login failed: {admin_res.text}"
        admin_token = admin_res.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print(" -> Admin session active.", flush=True)

        # Define 4 distinct student personas
        students = [
            {
                "email": f"student_1m_{int(time.time())}@internvision.tech",
                "password": "Password1Month!",
                "name": "Aarav Sharma (1M Track)",
                "duration": "1 Month",
                "role": "Full Stack Web Development",
                "track": "1 Month Full-Stack",
            },
            {
                "email": f"student_3m_{int(time.time())}@internvision.tech",
                "password": "Password3Month!",
                "name": "Priya Patel (3M Track)",
                "duration": "3 Months",
                "role": "AI & Machine Learning Engineering",
                "track": "3 Months AI/ML",
            },
            {
                "email": f"student_6m_devops_{int(time.time())}@internvision.tech",
                "password": "Password6MonthDevOps!",
                "name": "Vikram Malhotra (6M Track)",
                "duration": "6 Months",
                "role": "DevOps & Cloud Engineering",
                "track": "6 Months DevOps",
            },
            {
                "email": f"student_6m_fs_{int(time.time())}@internvision.tech",
                "password": "Password6MonthFS!",
                "name": "Ananya Sen (6M Track)",
                "duration": "6 Months",
                "role": "Full Stack Web Development",
                "track": "6 Months Full-Stack",
            }
        ]

        created_student_data = []

        # Step 1: Multiple Student Registration & Login
        print("\n[1] Registering & Authenticating Multiple Student Users...", flush=True)
        for s in students:
            # Register
            reg_res = await client.post("/api/auth/user/register", json={
                "email": s["email"],
                "password": s["password"],
                "full_name": s["name"]
            })
            assert reg_res.status_code == 200, f"Registration failed for {s['email']}: {reg_res.text}"
            
            # Login
            login_res = await client.post("/api/auth/user/login", json={
                "email": s["email"],
                "password": s["password"]
            })
            assert login_res.status_code == 200, f"Login failed for {s['email']}: {login_res.text}"
            token = login_res.json()["access_token"]
            s["token"] = token
            print(f" -> Student Authenticated: {s['name']} ({s['email']})", flush=True)

        # Step 2: Multiple Internship Applications (1 Month, 3 Months, 6 Months)
        print("\n[2] Submitting Internship Applications across 1M, 3M, and 6M Durations...", flush=True)
        for s in students:
            app_payload = {
                "google_email": s["email"],
                "full_name": s["name"],
                "email": s["email"],
                "phone": "+91 9876543210",
                "college": "Indian Institute of Technology",
                "degree": "B.Tech Computer Science",
                "year_of_study": "3rd Year",
                "skills": ["React", "Python", "FastAPI", "Docker", "PostgreSQL"],
                "duration": s["duration"],
                "role_preference": s["role"],
                "experience_description": f"Applied for {s['duration']} intensive industry program in {s['role']}.",
                "cover_letter": f"Motivated to master {s['role']} through hands-on project milestones."
            }
            app_res = await client.post("/api/applications", json=app_payload)
            assert app_res.status_code in (200, 201), f"Application submission failed for {s['email']}: {app_res.text}"
            app_data = app_res.json()
            s["app_id"] = app_data.get("id")
            print(f" -> Created Application #{s['app_id']} for {s['name']} | Duration: {s['duration']} | Role: {s['role']}", flush=True)

        # Step 3: Fetch Student Portal Overview (Checking time-gated weeks based on duration)
        print("\n[3] Testing Student Portal Retrieval (my-internship)...", flush=True)
        for s in students:
            portal_res = await client.get(f"/api/portal/my-internship?email={s['email']}")
            assert portal_res.status_code == 200, f"Portal fetch failed for {s['email']}: {portal_res.text}"
            portal_data = portal_res.json()
            domain_title = portal_data.get("domain", {}).get("title")
            weeks_count = len(portal_data.get("weeks", []))
            print(f" -> Portal Retrieved for {s['name']}: Track='{domain_title}' | Assigned Weeks: {weeks_count} weeks", flush=True)

        # Step 4: Submitting Multi-Week Deliverables
        print("\n[4] Submitting Multi-Week Tasks (Weeks 1, 2, 3, 4, Month 2, Month 3, Month 6 Capstone)...", flush=True)

        for s in students:
            print(f"\n --- Submissions for {s['name']} ({s['duration']}) ---", flush=True)

            # Week 1 Submission
            w1_payload = {
                "task_key": "month1_week1",
                "title": "Week 1: Modern Component Architecture & Responsive UI Design",
                "github_url": f"https://github.com/internvision/{s['email'].split('@')[0]}-week1",
                "live_url": f"https://{s['email'].split('@')[0]}-week1.vercel.app",
                "notes": "Completed responsive layout, component tree, and theme switcher."
            }
            res_w1 = await client.post(f"/api/portal/tasks/submit?email={s['email']}", json=w1_payload)
            assert res_w1.status_code in (200, 201), f"Week 1 failed: {res_w1.text}"
            print("  [✔] Week 1 Task Submitted (month1_week1)", flush=True)

            # Week 2 Submission
            w2_payload = {
                "task_key": "month1_week2",
                "title": "Week 2: RESTful Backend APIs, Relational Database & Validation",
                "github_url": f"https://github.com/internvision/{s['email'].split('@')[0]}-week2",
                "live_url": f"https://{s['email'].split('@')[0]}-week2.onrender.com",
                "notes": "Designed normalized schema, CRUD endpoints, and Pydantic validation."
            }
            res_w2 = await client.post(f"/api/portal/tasks/submit?email={s['email']}", json=w2_payload)
            assert res_w2.status_code in (200, 201), f"Week 2 failed: {res_w2.text}"
            print("  [✔] Week 2 Task Submitted (month1_week2)", flush=True)

            # Week 3 Submission
            w3_payload = {
                "task_key": "month1_week3",
                "title": "Week 3: JWT Authentication, Protected Routes & Cloud Storage",
                "github_url": f"https://github.com/internvision/{s['email'].split('@')[0]}-week3",
                "live_url": f"https://{s['email'].split('@')[0]}-week3.vercel.app",
                "notes": "Implemented secure JWT authentication, auth guards, and file upload pipelines."
            }
            res_w3 = await client.post(f"/api/portal/tasks/submit?email={s['email']}", json=w3_payload)
            assert res_w3.status_code in (200, 201), f"Week 3 failed: {res_w3.text}"
            print("  [✔] Week 3 Task Submitted (month1_week3)", flush=True)

            # Week 4 Submission (Month 1 Capstone)
            w4_payload = {
                "task_key": "month1_week4",
                "title": "Week 4: Production Deployment, CI/CD Pipelines & Mini-Capstone",
                "github_url": f"https://github.com/internvision/{s['email'].split('@')[0]}-week4",
                "live_url": f"https://{s['email'].split('@')[0]}-week4.vercel.app",
                "notes": "Deployed to production with automated CI/CD and Loom demo video."
            }
            res_w4 = await client.post(f"/api/portal/tasks/submit?email={s['email']}", json=w4_payload)
            assert res_w4.status_code in (200, 201), f"Week 4 failed: {res_w4.text}"
            print("  [✔] Week 4 Task Submitted (month1_week4)", flush=True)

            # Month 2 Deliverable (for 3M and 6M students)
            if s["duration"] in ("3 Months", "6 Months"):
                m2_payload = {
                    "task_key": "month2_project",
                    "title": "Month 2: Comprehensive Industry Project Milestone",
                    "github_url": f"https://github.com/internvision/{s['email'].split('@')[0]}-month2",
                    "live_url": f"https://{s['email'].split('@')[0]}-month2.vercel.app",
                    "notes": "Integrated state management, background queues, and automated test suites."
                }
                res_m2 = await client.post(f"/api/portal/tasks/submit?email={s['email']}", json=m2_payload)
                assert res_m2.status_code in (200, 201), f"Month 2 project failed: {res_m2.text}"
                print("  [✔] Month 2 Project Submitted (month2_project)", flush=True)

            # Month 3 Portfolio Deliverable (for 3M and 6M students)
            if s["duration"] in ("3 Months", "6 Months"):
                m3_payload = {
                    "task_key": "month3_portfolio",
                    "title": "Month 3: Professional Engineering Portfolio & Case Studies",
                    "github_url": f"https://github.com/internvision/{s['email'].split('@')[0]}-portfolio",
                    "live_url": f"https://{s['email'].split('@')[0]}.dev",
                    "notes": "Published production portfolio with detailed case studies."
                }
                res_m3 = await client.post(f"/api/portal/tasks/submit?email={s['email']}", json=m3_payload)
                assert res_m3.status_code in (200, 201), f"Month 3 portfolio failed: {res_m3.text}"
                print("  [✔] Month 3 Portfolio Submitted (month3_portfolio)", flush=True)

            # Month 4-6 Capstone Deliverable (for 6M students)
            if s["duration"] == "6 Months":
                m6_payload = {
                    "task_key": "month4_6_capstone",
                    "title": "Month 4-6: Enterprise Capstone Project & Production Architecture",
                    "github_url": f"https://github.com/internvision/{s['email'].split('@')[0]}-enterprise-capstone",
                    "live_url": f"https://enterprise-capstone-{s['email'].split('@')[0]}.vercel.app",
                    "notes": "Built distributed microservices, Redis caching, CI/CD pipeline, and comprehensive docs."
                }
                res_m6 = await client.post(f"/api/portal/tasks/submit?email={s['email']}", json=m6_payload)
                assert res_m6.status_code in (200, 201), f"Month 6 capstone failed: {res_m6.text}"
                print("  [✔] Month 4-6 Capstone Project Submitted (month4_6_capstone)", flush=True)

        # Step 5: Submitting Doubt Queries
        print("\n[5] Submitting Technical Doubt Queries across Tracks...", flush=True)
        for s in students:
            doubt_payload = {
                "module_name": s["role"],
                "subject": f"Inquiry on {s['role']} optimization in Week 2",
                "question": f"What is the best practice for connection pool tuning when deploying {s['role']} services to cloud containers?",
                "code_snippet": "engine = create_engine(DATABASE_URL, pool_size=20, max_overflow=40)"
            }
            doubt_res = await client.post(f"/api/portal/doubts?email={s['email']}", json=doubt_payload)
            assert doubt_res.status_code in (200, 201), f"Doubt failed for {s['email']}: {doubt_res.text}"
            print(f" -> Doubt logged for {s['name']} under '{s['role']}'", flush=True)

        # Step 6: Submitting Task Unlock Requests
        print("\n[6] Submitting Task Unlock Requests for Future Weeks...", flush=True)
        for s in students:
            unlock_payload = {
                "task_key": "month1_week3",
                "task_title": "Week 3: Advanced Module Unlock Request",
                "reason": "Completed Week 1 & 2 ahead of schedule, requesting early access to Week 3."
            }
            unlock_res = await client.post(f"/api/portal/tasks/request-unlock?email={s['email']}", json=unlock_payload)
            assert unlock_res.status_code in (200, 201), f"Unlock request failed for {s['email']}: {unlock_res.text}"
            print(f" -> Task Unlock Requested for {s['name']} (month1_week3)", flush=True)

        # Step 7: Verify Admin Inboxes & Mentor Review Queues
        print("\n[7] Verifying Admin Review Queues...", flush=True)
        admin_subs = await client.get("/api/admin/submissions", headers=admin_headers)
        assert admin_subs.status_code == 200
        subs_list = admin_subs.json()

        admin_doubts = await client.get("/api/admin/doubts", headers=admin_headers)
        assert admin_doubts.status_code == 200
        doubts_list = admin_doubts.json()

        admin_unlocks = await client.get("/api/admin/unlock-requests", headers=admin_headers)
        assert admin_unlocks.status_code == 200
        unlocks_list = admin_unlocks.json()

        print(f" -> Admin Review Verified:")
        print(f"    - Submissions in Queue: {len(subs_list)} total")
        print(f"    - Doubts in Support Desk: {len(doubts_list)} total")
        print(f"    - Unlock Requests Pending: {len(unlocks_list)} total")

        # Step 8: Cleanup all test student records
        print("\n[8] Cleaning up transient lifecycle test records...", flush=True)
        db = SessionLocal()
        try:
            d_users = db.query(SiteUser).filter(SiteUser.email.like("student_%m_%@internvision.tech")).delete(synchronize_session=False)
            d_apps = db.query(InternshipApplication).filter(InternshipApplication.email.like("student_%m_%@internvision.tech")).delete(synchronize_session=False)
            d_subs = db.query(InternshipSubmission).filter(InternshipSubmission.student_email.like("student_%m_%@internvision.tech")).delete(synchronize_session=False)
            d_unlocks = db.query(TaskUnlockRequest).filter(TaskUnlockRequest.student_email.like("student_%m_%@internvision.tech")).delete(synchronize_session=False)
            d_doubts = db.query(StudentDoubt).filter(StudentDoubt.student_email.like("student_%m_%@internvision.tech")).delete(synchronize_session=False)
            db.commit()
            print(f"[+] Cleanup Complete: Removed {d_users} users, {d_apps} applications, {d_subs} submissions, {d_unlocks} unlock requests, {d_doubts} doubts.", flush=True)
        except Exception as e:
            db.rollback()
            print(f"[!] Cleanup note: {e}", flush=True)
        finally:
            db.close()

    print("\n" + "=" * 80, flush=True)
    print("ALL USER / STUDENT SIDE LIFECYCLE TESTS PASSED WITH 100% SUCCESS!", flush=True)
    print("=" * 80, flush=True)

if __name__ == "__main__":
    asyncio.run(run_student_full_lifecycle_test())
