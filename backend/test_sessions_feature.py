import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.shared.database import SessionLocal
from app.shared.security import create_access_token
from app.auth.models import Admin

def test_sessions_suite():
    with TestClient(app) as client:
        db = SessionLocal()

        print("==================================================")
        print("Testing Live Sessions & Booking Feature Suite")
        print("==================================================")

        # 1. Test public GET /api/sessions
        res = client.get("/api/sessions")
        assert res.status_code == 200, f"Failed GET /api/sessions: {res.text}"
        sessions = res.json()
        print(f"[OK] Fetched {len(sessions)} public live sessions.")
        for s in sessions:
            price_tag = "FREE" if s.get("is_free") else f"₹{s.get('price_inr')}"
            print(f"  -> [{price_tag}] {s['title']} ({s['session_date']} @ {s['session_time']}) - /sessions/{s['slug']}")

        # 2. Test single session retrieval by slug
        slug = sessions[0]["slug"]
        res_single = client.get(f"/api/sessions/{slug}")
        assert res_single.status_code == 200, f"Failed GET /api/sessions/{slug}: {res_single.text}"
        single_data = res_single.json()
        assert single_data["slug"] == slug
        print(f"[OK] Retrieved single session by slug: {single_data['title']}")

        # 3. Test booking a seat (POST /api/sessions/book)
        book_payload = {
            "session_slug": slug,
            "student_name": "Antigravity Test Student",
            "student_email": "teststudent@internvisiontech.me",
            "student_phone": "+91 9999888877",
            "college_or_company": "National Institute of Technology"
        }
        res_book = client.post("/api/sessions/book", json=book_payload)
        assert res_book.status_code in [200, 201], f"Failed booking: {res_book.text}"
        book_data = res_book.json()
        assert book_data["success"] is True
        assert "ticket_code" in book_data
        print(f"[OK] Registered participant seat. Ticket Code: {book_data['ticket_code']}")

        # 4. Test duplicate booking idempotency
        res_dup = client.post("/api/sessions/book", json=book_payload)
        assert res_dup.status_code in [200, 201]
        dup_data = res_dup.json()
        assert dup_data["is_already_booked"] is True
        print(f"[OK] Duplicate registration handled gracefully: {dup_data['message']}")

        # 5. Admin Token Generation
        admin = db.query(Admin).filter(Admin.email == "tanishdewase222@gmail.com").first()
        if not admin:
            admin = db.query(Admin).first()
        admin_token = create_access_token({"sub": admin.email, "role": "super_admin"})
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 6. Admin Create Session (POST /api/sessions)
        new_sess_payload = {
            "title": "Cloud Native Kubernetes CI/CD Masterclass",
            "slug": "cloud-native-kubernetes-cicd-masterclass",
            "description": "Architect end-to-end GitOps delivery pipelines with Kubernetes, Helm, and ArgoCD.",
            "key_takeaways": [
                "GitOps principles with ArgoCD",
                "Helm chart packaging and parameterization",
                "Production cluster security and RBAC"
            ],
            "session_date": "Sunday, 08 Nov 2026",
            "session_time": "06:30 PM IST",
            "duration": "2 Hours",
            "is_free": False,
            "price_inr": 199,
            "thumbnail_url": "https://images.unsplash.com/photo-1605745341112-85968b19335b",
            "instructor_name": "Tanish Dewase",
            "instructor_role": "DevOps Architect",
            "meeting_platform": "Google Meet",
            "meeting_link": "https://meet.google.com/test-k8s",
            "max_seats": 100,
            "category": "Cloud & DevOps",
            "tags": ["Kubernetes", "GitOps", "ArgoCD", "Helm", "DevOps"],
            "is_published": True
        }
        res_create = client.post("/api/sessions", json=new_sess_payload, headers=admin_headers)
        assert res_create.status_code == 201, f"Failed create session: {res_create.text}"
        created_sess = res_create.json()
        created_id = created_sess["id"]
        print(f"[OK] Admin created new session ID {created_id} (Slug: {created_sess['slug']})")

        # 7. Admin View Bookings (GET /api/sessions/admin/bookings)
        res_bookings = client.get("/api/sessions/admin/bookings", headers=admin_headers)
        assert res_bookings.status_code == 200
        all_bookings = res_bookings.json()
        print(f"[OK] Admin retrieved {len(all_bookings)} participant bookings across all sessions.")

        # 8. Admin Update Session (PUT /api/sessions/{id})
        res_update = client.put(
            f"/api/sessions/{created_id}",
            json={"title": "Cloud Native Kubernetes CI/CD & GitOps Masterclass", "duration": "2.5 Hours"},
            headers=admin_headers
        )
        assert res_update.status_code == 200
        assert res_update.json()["duration"] == "2.5 Hours"
        print(f"[OK] Admin updated session ID {created_id}.")

        # 9. Clean up test session (DELETE /api/sessions/{id})
        res_del = client.delete(f"/api/sessions/{created_id}", headers=admin_headers)
        assert res_del.status_code == 200
        print(f"[OK] Admin deleted test session ID {created_id}.")

        db.close()
        print("==================================================")
        print("ALL SESSION & BOOKING TESTS PASSED PERFECTLY! 🚀")
        print("==================================================")

if __name__ == "__main__":
    test_sessions_suite()
