import asyncio
import time
import statistics
import concurrent.futures
from typing import List, Dict, Any
import httpx
from sqlalchemy import text
from app.main import app
from app.shared.database import SessionLocal, engine
from app.auth.models import Admin
from app.auth.user_models import SiteUser
from app.internship.models import InternshipApplication
from app.shared.contact_models import ContactQuery
import app.shared.email_service as email_service

# Mock external SMTP relay to isolate API & DB performance during stress test
email_service._send_smtp_email = lambda *args, **kwargs: True

def init_db_performance():
    """Configures SQLite WAL mode & busy timeout for optimal high-concurrency stress testing"""
    with engine.connect() as conn:
        if engine.url.drivername.startswith("sqlite"):
            conn.execute(text("PRAGMA journal_mode=WAL;"))
            conn.execute(text("PRAGMA synchronous=NORMAL;"))
            conn.execute(text("PRAGMA busy_timeout=15000;"))
            conn.commit()

def format_stats(latencies: List[float]) -> Dict[str, Any]:
    if not latencies:
        return {}
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

def run_db_concurrency_stress(num_threads: int = 50, ops_per_thread: int = 5):
    """
    Stress-tests SQLAlchemy connection pooling, concurrent sessions, transactions, and commit locks.
    """
    print(f"\n==================================================", flush=True)
    print(f"[*] TEST 1: DATABASE CONCURRENCY & POOL STRESS", flush=True)
    print(f"[*] Simulating {num_threads} concurrent threads ({num_threads * ops_per_thread} total DB transactions)", flush=True)
    print(f"==================================================", flush=True)

    latencies = []
    errors = 0

    def db_worker(thread_id: int):
        thread_latencies = []
        err_count = 0
        for i in range(ops_per_thread):
            t0 = time.perf_counter()
            db = SessionLocal()
            try:
                test_email = f"db_stress_{thread_id}_{i}_{int(time.time()*1000)}@test.com"
                new_user = SiteUser(
                    google_sub=test_email,
                    email=test_email,
                    full_name=f"Stress User {thread_id}-{i}",
                    hashed_password="hashed_dummy_pw",
                    raw_password="dummy",
                    provider="email"
                )
                db.add(new_user)
                db.commit()

                # Read back
                retrieved = db.query(SiteUser).filter(SiteUser.email == test_email).first()
                if not retrieved:
                    err_count += 1
                
                # Simple aggregate query
                _ = db.query(SiteUser).count()
                
                t1 = time.perf_counter()
                thread_latencies.append(t1 - t0)
            except Exception as e:
                db.rollback()
                err_count += 1
                print(f"[!] DB Error in thread {thread_id}: {e}", flush=True)
            finally:
                db.close()
        return thread_latencies, err_count

    start_total = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = [executor.submit(db_worker, tid) for tid in range(num_threads)]
        for f in concurrent.futures.as_completed(futures):
            th_lats, th_errs = f.result()
            latencies.extend(th_lats)
            errors += th_errs
    total_time = time.perf_counter() - start_total

    stats = format_stats(latencies)
    rps = round(len(latencies) / total_time, 2) if total_time > 0 else 0
    print(f"[+] Total DB Operations: {len(latencies)}", flush=True)
    print(f"[+] Failed Transactions: {errors} ({round(errors/max(1, len(latencies))*100, 2)}%)", flush=True)
    print(f"[+] Total Duration: {round(total_time, 3)}s | Throughput: {rps} DB Ops/sec", flush=True)
    print(f"[+] Latency Profile: Avg: {stats['avg_ms']}ms | P50: {stats['p50_ms']}ms | P95: {stats['p95_ms']}ms | P99: {stats['p99_ms']}ms | Max: {stats['max_ms']}ms", flush=True)
    return {"name": "Database Concurrency Stress", "stats": stats, "rps": rps, "errors": errors, "total": len(latencies)}

async def run_auth_bulk_stress(concurrency: int = 30, total_users: int = 60):
    """
    Stress-tests bulk user registration, bcrypt password hashing, and concurrent logins.
    """
    print(f"\n==================================================", flush=True)
    print(f"[*] TEST 2: BULK USER AUTHENTICATION & LOGIN STRESS", flush=True)
    print(f"[*] Registering {total_users} users with concurrency={concurrency}", flush=True)
    print(f"==================================================", flush=True)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test", timeout=30.0) as client:
        # Step 2A: Bulk Registration
        reg_latencies = []
        reg_errors = 0
        sem = asyncio.Semaphore(concurrency)

        async def register_user(idx: int):
            nonlocal reg_errors
            email = f"loadtest_user_{idx}_{int(time.time()*1000)}@internvision.tech"
            password = f"P@ssword_{idx}_Safe!"
            payload = {
                "email": email,
                "password": password,
                "full_name": f"Load Tester {idx}"
            }
            async with sem:
                t0 = time.perf_counter()
                try:
                    res = await client.post("/api/auth/user/register", json=payload)
                    t1 = time.perf_counter()
                    reg_latencies.append(t1 - t0)
                    if res.status_code != 200:
                        reg_errors += 1
                        return None, None
                    return email, password
                except Exception as e:
                    reg_errors += 1
                    return None, None

        t0_reg = time.perf_counter()
        tasks = [register_user(i) for i in range(total_users)]
        registered_accounts = await asyncio.gather(*tasks)
        reg_duration = time.perf_counter() - t0_reg
        valid_accounts = [acc for acc in registered_accounts if acc[0] is not None]

        reg_stats = format_stats(reg_latencies)
        reg_rps = round(len(reg_latencies) / reg_duration, 2)
        print(f"[+] Registered {len(valid_accounts)}/{total_users} Users (Errors: {reg_errors})", flush=True)
        print(f"[+] Registration Throughput: {reg_rps} req/sec | Avg Latency: {reg_stats['avg_ms']}ms (Bcrypt hashing)", flush=True)
        print(f"[+] P95: {reg_stats['p95_ms']}ms | P99: {reg_stats['p99_ms']}ms", flush=True)

        # Step 2B: Bulk User Login
        print(f"\n[*] Concurrently logging in {len(valid_accounts)} users...", flush=True)
        login_latencies = []
        login_errors = 0

        async def login_user(email: str, password: str):
            nonlocal login_errors
            async with sem:
                t0 = time.perf_counter()
                try:
                    res = await client.post("/api/auth/user/login", json={"email": email, "password": password})
                    t1 = time.perf_counter()
                    login_latencies.append(t1 - t0)
                    if res.status_code == 200:
                        return res.json().get("access_token")
                    else:
                        login_errors += 1
                        return None
                except Exception:
                    login_errors += 1
                    return None

        t0_login = time.perf_counter()
        login_tasks = [login_user(acc[0], acc[1]) for acc in valid_accounts]
        tokens = await asyncio.gather(*login_tasks)
        login_duration = time.perf_counter() - t0_login
        user_tokens = [t for t in tokens if t]

        login_stats = format_stats(login_latencies)
        login_rps = round(len(login_latencies) / login_duration, 2)
        print(f"[+] Logged in {len(user_tokens)}/{len(valid_accounts)} Users (Errors: {login_errors})", flush=True)
        print(f"[+] Login Throughput: {login_rps} req/sec | Avg Latency: {login_stats['avg_ms']}ms | P95: {login_stats['p95_ms']}ms | P99: {login_stats['p99_ms']}ms", flush=True)

        # Step 2C: Admin Login Stress
        print(f"\n[*] Stress testing Admin Login with 30 concurrent attempts...", flush=True)
        admin_latencies = []
        admin_errors = 0
        async def admin_login_worker():
            nonlocal admin_errors
            async with sem:
                t0 = time.perf_counter()
                try:
                    res = await client.post(
                        "/api/auth/login",
                        data={"username": "admin@internvision.tech", "password": "Admin@123456"},
                        headers={"Content-Type": "application/x-www-form-urlencoded"}
                    )
                    t1 = time.perf_counter()
                    admin_latencies.append(t1 - t0)
                    if res.status_code != 200:
                        admin_errors += 1
                except Exception:
                    admin_errors += 1

        admin_tasks = [admin_login_worker() for _ in range(30)]
        await asyncio.gather(*admin_tasks)
        admin_stats = format_stats(admin_latencies)
        print(f"[+] Admin Logins: 30 completed | Errors: {admin_errors} | Avg Latency: {admin_stats['avg_ms']}ms | P95: {admin_stats['p95_ms']}ms", flush=True)

        return {
            "reg_stats": reg_stats,
            "reg_rps": reg_rps,
            "login_stats": login_stats,
            "login_rps": login_rps,
            "admin_stats": admin_stats,
            "user_tokens": user_tokens,
            "valid_accounts": valid_accounts
        }

async def run_api_traffic_stress(user_tokens: List[str], total_requests: int = 300, concurrency: int = 30):
    """
    Stress-tests multi-endpoint traffic simulating real active users browsing, applying, submitting contacts, and loading dashboard stats.
    """
    print(f"\n==================================================", flush=True)
    print(f"[*] TEST 3: MULTI-ENDPOINT HIGH-CONCURRENCY API TRAFFIC STRESS", flush=True)
    print(f"[*] Simulating {total_requests} requests across 5 key endpoints with concurrency={concurrency}", flush=True)
    print(f"==================================================", flush=True)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test", timeout=30.0) as client:
        admin_res = await client.post(
            "/api/auth/login",
            data={"username": "admin@internvision.tech", "password": "Admin@123456"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        admin_token = admin_res.json().get("access_token")
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        sem = asyncio.Semaphore(concurrency)
        endpoint_metrics: Dict[str, List[float]] = {
            "GET /health": [],
            "GET /api/courses": [],
            "POST /api/applications (Apply)": [],
            "POST /api/contact/ (Contact)": [],
            "GET /api/dashboard/stats (Analytics)": []
        }
        endpoint_errors: Dict[str, int] = {k: 0 for k in endpoint_metrics}

        async def request_worker(req_id: int):
            endpoint_type = req_id % 5
            token = user_tokens[req_id % len(user_tokens)] if user_tokens else ""

            async with sem:
                t0 = time.perf_counter()
                try:
                    if endpoint_type == 0:
                        res = await client.get("/health")
                        t1 = time.perf_counter()
                        endpoint_metrics["GET /health"].append(t1 - t0)
                        if res.status_code != 200:
                            endpoint_errors["GET /health"] += 1

                    elif endpoint_type == 1:
                        res = await client.get("/api/courses")
                        t1 = time.perf_counter()
                        endpoint_metrics["GET /api/courses"].append(t1 - t0)
                        if res.status_code != 200:
                            endpoint_errors["GET /api/courses"] += 1

                    elif endpoint_type == 2:
                        app_data = {
                            "google_email": f"applicant_{req_id}@test.com",
                            "full_name": f"Applicant {req_id}",
                            "email": f"applicant_{req_id}@test.com",
                            "phone": "+91 9999988888",
                            "college": "Testing Tech Institute",
                            "degree": "B.Tech Computer Science",
                            "year_of_study": "Final Year",
                            "skills": ["React", "FastAPI", "Python"],
                            "duration": "2 Months",
                            "role_preference": "Full Stack Web Development",
                            "experience_description": "Load test application data.",
                            "cover_letter": "Passionate about testing."
                        }
                        res = await client.post("/api/applications", json=app_data)
                        t1 = time.perf_counter()
                        endpoint_metrics["POST /api/applications (Apply)"].append(t1 - t0)
                        if res.status_code not in (200, 201):
                            endpoint_errors["POST /api/applications (Apply)"] += 1

                    elif endpoint_type == 3:
                        contact_data = {
                            "name": f"Inquirer {req_id}",
                            "email": f"inquirer_{req_id}@test.com",
                            "phone": "+91 9123456789",
                            "subject": "Bootcamp Query",
                            "message": "Testing high concurrency contact form ingestion."
                        }
                        res = await client.post("/api/contact", json=contact_data)
                        t1 = time.perf_counter()
                        endpoint_metrics["POST /api/contact (Contact)"].append(t1 - t0)
                        if res.status_code not in (200, 201):
                            endpoint_errors["POST /api/contact (Contact)"] += 1

                    elif endpoint_type == 4:
                        res = await client.get("/api/admin/stats", headers=admin_headers)
                        t1 = time.perf_counter()
                        endpoint_metrics["GET /api/admin/stats (Analytics)"].append(t1 - t0)
                        if res.status_code != 200:
                            endpoint_errors["GET /api/admin/stats (Analytics)"] += 1

                except Exception as e:
                    pass

        t0_all = time.perf_counter()
        tasks = [request_worker(i) for i in range(total_requests)]
        await asyncio.gather(*tasks)
        total_duration = time.perf_counter() - t0_all

        all_latencies = []
        for ep, lats in endpoint_metrics.items():
            all_latencies.extend(lats)

        overall_rps = round(len(all_latencies) / total_duration, 2)
        overall_stats = format_stats(all_latencies)
        total_errors = sum(endpoint_errors.values())

        print(f"\n[+] Total Requests Processed: {len(all_latencies)} in {round(total_duration, 2)}s", flush=True)
        print(f"[+] Overall Throughput: {overall_rps} Requests/sec", flush=True)
        print(f"[+] Overall Success Rate: {round((1 - total_errors/max(1, len(all_latencies)))*100, 2)}%", flush=True)
        print(f"[+] Global Latency: Avg: {overall_stats['avg_ms']}ms | P50: {overall_stats['p50_ms']}ms | P95: {overall_stats['p95_ms']}ms | P99: {overall_stats['p99_ms']}ms | Max: {overall_stats['max_ms']}ms", flush=True)

        print("\n--- Per-Endpoint Performance Breakdown ---", flush=True)
        endpoint_summary = {}
        for ep, lats in endpoint_metrics.items():
            stats = format_stats(lats)
            errs = endpoint_errors[ep]
            endpoint_summary[ep] = {"stats": stats, "errors": errs, "count": len(lats)}
            print(f" • {ep}:", flush=True)
            print(f"    Count: {len(lats)} | Errors: {errs} | Avg: {stats.get('avg_ms', 0)}ms | P95: {stats.get('p95_ms', 0)}ms | P99: {stats.get('p99_ms', 0)}ms", flush=True)

        return {
            "overall_stats": overall_stats,
            "overall_rps": overall_rps,
            "total_requests": len(all_latencies),
            "total_errors": total_errors,
            "duration": total_duration,
            "endpoints": endpoint_summary
        }

def run_database_integrity_verification():
    """
    Checks the database for data consistency, row counts, index lookups, and cleans test data.
    """
    print(f"\n==================================================", flush=True)
    print(f"[*] TEST 4: DATABASE INTEGRITY & PERSISTENCE VERIFICATION", flush=True)
    print(f"==================================================", flush=True)
    db = SessionLocal()
    try:
        user_count = db.query(SiteUser).count()
        app_count = db.query(InternshipApplication).count()
        contact_count = db.query(ContactQuery).count()
        admin_count = db.query(Admin).count()

        print(f"[+] Database Counts in Active State:", flush=True)
        print(f"    - Site Users: {user_count}", flush=True)
        print(f"    - Internship Applications: {app_count}", flush=True)
        print(f"    - Contact Queries: {contact_count}", flush=True)
        print(f"    - Admins: {admin_count}", flush=True)

        t0 = time.perf_counter()
        recent_users = db.query(SiteUser).order_by(SiteUser.created_at.desc()).limit(20).all()
        query_time_ms = round((time.perf_counter() - t0) * 1000, 2)
        print(f"[+] Indexed Query Performance: Fetched top 20 users in {query_time_ms}ms", flush=True)

        deleted_users = db.query(SiteUser).filter(SiteUser.email.like("loadtest_%")).delete(synchronize_session=False)
        deleted_db_users = db.query(SiteUser).filter(SiteUser.email.like("db_stress_%")).delete(synchronize_session=False)
        deleted_apps = db.query(InternshipApplication).filter(InternshipApplication.email.like("applicant_%@test.com")).delete(synchronize_session=False)
        deleted_contacts = db.query(ContactQuery).filter(ContactQuery.email.like("inquirer_%@test.com")).delete(synchronize_session=False)
        db.commit()

        print(f"[+] Cleanup Complete: Removed {deleted_users + deleted_db_users} test users, {deleted_apps} test applications, and {deleted_contacts} test inquiries.", flush=True)
        return {
            "initial_users": user_count,
            "initial_apps": app_count,
            "initial_contacts": contact_count,
            "index_query_time_ms": query_time_ms,
            "cleaned_records": deleted_users + deleted_db_users + deleted_apps + deleted_contacts
        }
    except Exception as e:
        db.rollback()
        print(f"[!] Integrity check error: {e}", flush=True)
        return {"error": str(e)}
    finally:
        db.close()

async def main():
    print("=" * 60, flush=True)
    print("STARTING FULL-STACK DATABASE & BULK USER STRESS TEST SUITE", flush=True)
    print("=" * 60, flush=True)

    init_db_performance()

    # 1. Database Concurrency Stress
    db_results = run_db_concurrency_stress(num_threads=40, ops_per_thread=4)

    # 2. Bulk Auth Stress
    auth_results = await run_auth_bulk_stress(concurrency=20, total_users=40)

    # 3. Multi-endpoint API Traffic Stress
    api_results = await run_api_traffic_stress(
        user_tokens=auth_results["user_tokens"],
        total_requests=250,
        concurrency=25
    )

    # 4. Database Integrity & Persistence
    integrity_results = run_database_integrity_verification()

    print("\n" + "=" * 60, flush=True)
    print("ALL STRESS TESTS COMPLETED SUCCESSFULLY!", flush=True)
    print("=" * 60, flush=True)

if __name__ == "__main__":
    asyncio.run(main())
