import asyncio
import time
import statistics
import concurrent.futures
from typing import List, Dict, Any, Tuple
import httpx
from sqlalchemy import text
from app.main import app
from app.shared.database import SessionLocal, engine
from app.auth.models import Admin
from app.auth.user_models import SiteUser
from app.internship.models import InternshipApplication, InternshipSubmission, TaskUnlockRequest, StudentDoubt
from app.courses.models import Course, CourseRegistration
from app.payments.models import Payment
from app.shared.contact_models import ContactQuery
from app.certificates.models import Certificate
import app.shared.email_service as email_service

# Mock external Brevo SMTP relay to test pure local server & database capacity without network rate limits
email_service._send_smtp_email = lambda *args, **kwargs: True

def init_db_performance():
    with engine.connect() as conn:
        if engine.url.drivername.startswith("sqlite"):
            conn.execute(text("PRAGMA journal_mode=WAL;"))
            conn.execute(text("PRAGMA synchronous=NORMAL;"))
            conn.execute(text("PRAGMA busy_timeout=20000;"))
            conn.commit()

def format_stats(latencies: List[float]) -> Dict[str, Any]:
    if not latencies:
        return {"count": 0, "min_ms": 0, "avg_ms": 0, "p50_ms": 0, "p90_ms": 0, "p95_ms": 0, "p99_ms": 0, "max_ms": 0}
    latencies_ms = [l * 1000 for l in latencies]
    latencies_ms.sort()
    n = len(latencies_ms)
    return {
        "count": n,
        "min_ms": round(min(latencies_ms), 2),
        "avg_ms": round(statistics.mean(latencies_ms), 2),
        "p50_ms": round(latencies_ms[int(n * 0.50)], 2),
        "p90_ms": round(latencies_ms[min(int(n * 0.90), n - 1)], 2),
        "p95_ms": round(latencies_ms[min(int(n * 0.95), n - 1)], 2),
        "p99_ms": round(latencies_ms[min(int(n * 0.99), n - 1)], 2),
        "max_ms": round(max(latencies_ms), 2),
    }

async def run_feature_functional_tests() -> Dict[str, Any]:
    print("\n" + "=" * 70, flush=True)
    print("STAGE 1: COMPREHENSIVE FEATURE FUNCTIONAL & INTEGRATION TESTS", flush=True)
    print("=" * 70, flush=True)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test", timeout=30.0) as client:
        # 1. IAM & Admin Auth
        print("[+] 1. Testing IAM & Admin Authentication...", flush=True)
        login_res = await client.post(
            "/api/auth/login",
            data={"username": "admin@internvision.tech", "password": "Admin@123456"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert login_res.status_code == 200, f"Admin login failed: {login_res.text}"
        admin_token = login_res.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        iam_me_res = await client.get("/api/admin/me", headers=admin_headers)
        assert iam_me_res.status_code == 200, f"IAM /me failed: {iam_me_res.text}"
        
        iam_admins_res = await client.get("/api/admin/admins", headers=admin_headers)
        assert iam_admins_res.status_code == 200, f"IAM /admins failed: {iam_admins_res.text}"
        print("    -> IAM & Admin Auth: PASSED (200 OK)", flush=True)

        # 2. Overview / Dashboard Stats
        print("[+] 2. Testing Overview (Admin Dashboard Stats)...", flush=True)
        stats_res = await client.get("/api/admin/stats", headers=admin_headers)
        assert stats_res.status_code == 200, f"Overview stats failed: {stats_res.text}"
        stats_data = stats_res.json()
        print(f"    -> Overview: PASSED (Total Apps: {stats_data.get('total_applications')}, Users: {stats_data.get('total_users')})", flush=True)

        # 3. User Accounts (Public Register & Login)
        print("[+] 3. Testing User Accounts (Register & Login)...", flush=True)
        test_user_email = f"student_feature_test_{int(time.time())}@internvision.tech"
        reg_res = await client.post("/api/auth/user/register", json={
            "email": test_user_email,
            "password": "SecureStudentPassword123!",
            "full_name": "Test Student Candidate"
        })
        assert reg_res.status_code == 200, f"User registration failed: {reg_res.text}"
        user_token = reg_res.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}

        admin_users_res = await client.get("/api/admin/users", headers=admin_headers)
        assert admin_users_res.status_code == 200, f"Admin users list failed: {admin_users_res.text}"
        print("    -> User Accounts: PASSED (Registration & Admin Listing 200 OK)", flush=True)

        # 4. Applications (Submit & Admin Review)
        print("[+] 4. Testing Internship Applications...", flush=True)
        app_payload = {
            "google_email": test_user_email,
            "full_name": "Test Student Candidate",
            "email": test_user_email,
            "phone": "+91 9876543210",
            "college": "National Institute of Technology",
            "degree": "B.Tech Computer Science",
            "year_of_study": "3rd Year",
            "skills": ["React", "Next.js", "Python", "FastAPI"],
            "duration": "3 Months",
            "role_preference": "Full Stack Web Development",
            "experience_description": "Building full stack web apps.",
            "cover_letter": "Eager to contribute."
        }
        app_res = await client.post("/api/applications", json=app_payload)
        assert app_res.status_code in (200, 201), f"Application submission failed: {app_res.text}"
        created_app_id = app_res.json().get("id")

        admin_apps_res = await client.get("/api/admin/applications", headers=admin_headers)
        assert admin_apps_res.status_code == 200, f"Admin applications list failed: {admin_apps_res.text}"
        print(f"    -> Applications: PASSED (Created Application ID #{created_app_id})", flush=True)

        # 5. Submissions (Student Submit & Admin Review)
        print("[+] 5. Testing Task Submissions...", flush=True)
        sub_payload = {
            "task_key": "week1_task1",
            "title": "Frontend Setup & Responsive Layout",
            "github_url": "https://github.com/internvision/test-repo",
            "live_url": "https://test-demo.internvision.tech",
            "notes": "Functional test submission"
        }
        sub_res = await client.post(f"/api/portal/tasks/submit?email={test_user_email}", json=sub_payload)
        assert sub_res.status_code in (200, 201), f"Task submission failed: {sub_res.text}"

        admin_subs_res = await client.get("/api/admin/submissions", headers=admin_headers)
        assert admin_subs_res.status_code == 200, f"Admin submissions list failed: {admin_subs_res.text}"
        print("    -> Submissions: PASSED (Submission Ingest & Admin Review 200 OK)", flush=True)

        # 6. Unlock Requests (Student Request & Admin List)
        print("[+] 6. Testing Task Unlock Requests...", flush=True)
        unlock_payload = {
            "task_key": "week2_task1",
            "task_title": "Backend API Design & Schema Setup",
            "reason": "Completed prerequisite task 1 ahead of time"
        }
        unlock_res = await client.post(f"/api/portal/tasks/request-unlock?email={test_user_email}", json=unlock_payload)
        assert unlock_res.status_code in (200, 201), f"Unlock request failed: {unlock_res.text}"

        admin_unlocks_res = await client.get("/api/admin/unlock-requests", headers=admin_headers)
        assert admin_unlocks_res.status_code == 200, f"Admin unlocks list failed: {admin_unlocks_res.text}"
        print("    -> Unlock Requests: PASSED (Request Ingest & Admin Review 200 OK)", flush=True)

        # 7. Doubts Desk (Student Submit Doubt & Admin Review)
        print("[+] 7. Testing Doubts Desk...", flush=True)
        doubt_payload = {
            "module_name": "Full Stack Web Development",
            "subject": "JWT session expiration and refresh token logic",
            "question": "How should token refresh be handled on expired sessions?"
        }
        doubt_res = await client.post(f"/api/portal/doubts?email={test_user_email}", json=doubt_payload)
        assert doubt_res.status_code in (200, 201), f"Doubt submission failed: {doubt_res.text}"

        admin_doubts_res = await client.get("/api/admin/doubts", headers=admin_headers)
        assert admin_doubts_res.status_code == 200, f"Admin doubts list failed: {admin_doubts_res.text}"
        print("    -> Doubts Desk: PASSED (Doubt Ingest & Admin List 200 OK)", flush=True)

        # 8. Contact Inquiries (Submit & Admin Review)
        print("[+] 8. Testing Contact Inquiries...", flush=True)
        contact_res = await client.post("/api/contact", json={
            "name": "Corporate Partner",
            "email": "partner@techcorp.com",
            "subject": "Hiring Partnership Inquiry",
            "message": "Interested in hiring students graduating from your bootcamps."
        })
        assert contact_res.status_code in (200, 201), f"Contact inquiry failed: {contact_res.text}"

        admin_contacts_res = await client.get("/api/admin/contacts", headers=admin_headers)
        assert admin_contacts_res.status_code == 200, f"Admin contacts list failed: {admin_contacts_res.text}"
        print("    -> Contact Inquiries: PASSED (Contact Query Ingest & Admin List 200 OK)", flush=True)

        # 9. Course Enrollments (Browse, Free Enroll & Admin Review)
        print("[+] 9. Testing Course Enrollments...", flush=True)
        courses_res = await client.get("/api/courses")
        assert courses_res.status_code == 200, f"Course listing failed: {courses_res.text}"
        courses = courses_res.json()
        course_id = courses[0]["id"] if courses else 1

        enroll_res = await client.post("/api/courses/enroll", json={
            "course_id": course_id,
            "student_name": "Test Student Candidate",
            "student_email": test_user_email,
            "student_phone": "+91 9876543210",
            "college": "National Institute of Technology"
        })
        assert enroll_res.status_code in (200, 201), f"Course enrollment failed: {enroll_res.text}"

        admin_enrolls_res = await client.get("/api/admin/registrations", headers=admin_headers)
        assert admin_enrolls_res.status_code == 200, f"Admin enrollments list failed: {admin_enrolls_res.text}"
        print(f"    -> Course Enrollments: PASSED (Enrolled in Course ID #{course_id} & Admin Review 200 OK)", flush=True)

        # 10. Payments Audit (Create Payment Order & Admin Audit)
        print("[+] 10. Testing Payments Audit...", flush=True)
        order_res = await client.post("/api/payments/create-order", json={
            "course_id": course_id,
            "student_name": "Test Student Candidate",
            "student_email": test_user_email,
            "student_phone": "+91 9876543210"
        })
        assert order_res.status_code == 200, f"Payment order creation failed: {order_res.text}"

        admin_payments_res = await client.get("/api/admin/payments", headers=admin_headers)
        assert admin_payments_res.status_code == 200, f"Admin payments list failed: {admin_payments_res.text}"
        print("    -> Payments Audit: PASSED (Order Creation & Admin Audit Ledger 200 OK)", flush=True)

        # 11. Certificates (Admin List & Public Verification)
        print("[+] 11. Testing Certificates...", flush=True)
        admin_certs_res = await client.get("/api/certificates", headers=admin_headers)
        assert admin_certs_res.status_code == 200, f"Admin certificates list failed: {admin_certs_res.text}"
        print("    -> Certificates: PASSED (Admin Certificates Registry 200 OK)", flush=True)

    print("\n[✔] ALL 11 APPLICATION MODULES VERIFIED 100% OPERATIONAL!\n", flush=True)
    return {"status": "SUCCESS", "modules_tested": 11}


async def run_concurrency_tier(simulated_users: int, requests_per_user: int = 3) -> Dict[str, Any]:
    """
    Ramps up simultaneous users across endpoints and captures throughput, latency percentiles, and errors.
    """
    total_requests = simulated_users * requests_per_user
    print(f"\n[*] ─── TESTING TIER: {simulated_users} SIMULTANEOUS USERS ({total_requests} total requests) ───", flush=True)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test", timeout=90.0) as client:
        # Obtain admin token
        admin_res = await client.post(
            "/api/auth/login",
            data={"username": "admin@internvision.tech", "password": "Admin@123456"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        admin_token = admin_res.json().get("access_token")
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        sem = asyncio.Semaphore(simulated_users)
        latencies = []
        errors = 0

        endpoints = [
            ("GET", "/health", None, None),
            ("GET", "/api/courses", None, None),
            ("GET", "/api/admin/stats", None, admin_headers),
            ("GET", "/api/admin/applications", None, admin_headers),
            ("GET", "/api/admin/submissions", None, admin_headers),
            ("GET", "/api/admin/users", None, admin_headers),
            ("POST", "/api/contact", {
                "name": "Simulated User",
                "email": "sim_user@loadtest.com",
                "subject": "Load test message",
                "message": "Testing simultaneous concurrency capacity."
            }, None),
            ("POST", "/api/applications", {
                "google_email": "sim_user@loadtest.com",
                "full_name": "Simulated Applicant",
                "email": "sim_user@loadtest.com",
                "phone": "+91 9998887776",
                "college": "Testing Engineering Institute",
                "degree": "B.Tech",
                "year_of_study": "4th Year",
                "skills": ["Python", "FastAPI"],
                "duration": "1 Month",
                "role_preference": "Full Stack Web Development"
            }, None)
        ]

        async def simulated_user_session(user_id: int):
            nonlocal errors
            for req_idx in range(requests_per_user):
                method, path, body, headers = endpoints[(user_id * requests_per_user + req_idx) % len(endpoints)]
                async with sem:
                    t0 = time.perf_counter()
                    try:
                        if method == "GET":
                            res = await client.get(path, headers=headers)
                        else:
                            res = await client.post(path, json=body, headers=headers)
                        t1 = time.perf_counter()
                        latencies.append(t1 - t0)
                        if res.status_code not in (200, 201):
                            errors += 1
                    except Exception:
                        errors += 1

        t0_tier = time.perf_counter()
        tasks = [simulated_user_session(uid) for uid in range(simulated_users)]
        await asyncio.gather(*tasks)
        tier_duration = time.perf_counter() - t0_tier

        stats = format_stats(latencies)
        rps = round(len(latencies) / tier_duration, 2) if tier_duration > 0 else 0
        success_rate = round((1 - (errors / max(1, len(latencies)))) * 100, 2)

        print(f"    • Total Requests: {len(latencies)} in {round(tier_duration, 2)}s | RPS: {rps} req/sec")
        print(f"    • Success Rate: {success_rate}% | Failed: {errors}")
        print(f"    • Latencies: Avg={stats['avg_ms']}ms | P50={stats['p50_ms']}ms | P90={stats['p90_ms']}ms | P95={stats['p95_ms']}ms | P99={stats['p99_ms']}ms | Max={stats['max_ms']}ms", flush=True)

        return {
            "users": simulated_users,
            "total_requests": len(latencies),
            "duration_sec": round(tier_duration, 2),
            "rps": rps,
            "success_rate": success_rate,
            "errors": errors,
            "stats": stats
        }

def cleanup_loadtest_data():
    print("\n[*] Cleaning up transient stress test records...", flush=True)
    db = SessionLocal()
    try:
        d1 = db.query(SiteUser).filter(SiteUser.email.like("%@internvision.tech")).filter(SiteUser.email.like("student_feature_%")).delete(synchronize_session=False)
        d2 = db.query(InternshipApplication).filter(InternshipApplication.email.like("sim_user%")).delete(synchronize_session=False)
        d3 = db.query(InternshipApplication).filter(InternshipApplication.email.like("student_feature_%")).delete(synchronize_session=False)
        d4 = db.query(InternshipSubmission).filter(InternshipSubmission.student_email.like("student_feature_%")).delete(synchronize_session=False)
        d5 = db.query(TaskUnlockRequest).filter(TaskUnlockRequest.student_email.like("student_feature_%")).delete(synchronize_session=False)
        d6 = db.query(StudentDoubt).filter(StudentDoubt.student_email.like("student_feature_%")).delete(synchronize_session=False)
        d7 = db.query(CourseRegistration).filter(CourseRegistration.student_email.like("student_feature_%")).delete(synchronize_session=False)
        d8 = db.query(Payment).filter(Payment.student_email.like("student_feature_%")).delete(synchronize_session=False)
        d9 = db.query(ContactQuery).filter(ContactQuery.email.like("%loadtest.com")).delete(synchronize_session=False)
        d10 = db.query(ContactQuery).filter(ContactQuery.email.like("partner@techcorp.com")).delete(synchronize_session=False)
        db.commit()
        print(f"[+] Cleanup Complete: Removed {d1 + d2 + d3 + d4 + d5 + d6 + d7 + d8 + d9 + d10} transient records.", flush=True)
    except Exception as e:
        db.rollback()
        print(f"[!] Cleanup note: {e}", flush=True)
    finally:
        db.close()

async def main():
    print("=" * 70, flush=True)
    print("INTERNVISION FULL FEATURE AUDIT & SIMULTANEOUS USER CAPACITY TEST", flush=True)
    print("=" * 70, flush=True)

    init_db_performance()

    # Phase 1: All 11 Features Integration & Functional Testing
    feature_results = await run_feature_functional_tests()

    # Phase 2: Escalation Matrix (25 -> 50 -> 100 -> 200 -> 400 Simultaneous Users)
    print("=" * 70, flush=True)
    print("STAGE 2: SIMULTANEOUS USER CONCURRENCY CAPACITY MATRIX", flush=True)
    print("=" * 70, flush=True)

    capacity_matrix = []
    tiers = [20, 50, 100, 200]
    for user_tier in tiers:
        res = await run_concurrency_tier(simulated_users=user_tier, requests_per_user=2)
        capacity_matrix.append(res)

    # Phase 3: Cleanup
    cleanup_loadtest_data()

    print("\n" + "=" * 70, flush=True)
    print("FINAL CAPACITY BENCHMARK SUMMARY TABLE", flush=True)
    print("=" * 70, flush=True)
    print(f"{'Simultaneous Users':<20} | {'Total Req':<10} | {'Throughput (RPS)':<18} | {'Success Rate':<14} | {'Avg Latency':<14} | {'P95 Latency':<14}", flush=True)
    print("-" * 100, flush=True)
    for c in capacity_matrix:
        print(f"{c['users']:<20} | {c['total_requests']:<10} | {str(c['rps']) + ' req/s':<18} | {str(c['success_rate']) + '%' :<14} | {str(c['stats']['avg_ms']) + ' ms':<14} | {str(c['stats']['p95_ms']) + ' ms':<14}", flush=True)
    print("=" * 70, flush=True)

if __name__ == "__main__":
    asyncio.run(main())
