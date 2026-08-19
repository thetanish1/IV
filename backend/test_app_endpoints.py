from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RUNNING FASTAPI TESTCLIENT VERIFICATION")
    print("=" * 60)

    # 1. Admin Login
    print("\n[TEST 1] Admin Authentication")
    res = client.post(
        "/api/auth/login",
        data={"username": "tanishdewase222@gmail.com", "password": "Admin@123456"}
    )
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_token = res.json()["access_token"]
    print(" -> Admin token obtained successfully!")

    # 2. Student Google Sign In with Password Setup
    print("\n[TEST 2] Student Google Sign-in with Password Setup")
    user_email = "applicant.candidate@gmail.com"
    user_password = "SecurePassword2026!"
    user_name = "Candidate Verma"

    user_res = client.post(
        "/api/auth/user/google-with-password",
        json={
            "credential": "mock_google_id_token",
            "email": user_email,
            "password": user_password,
            "full_name": user_name,
            "picture": "https://lh3.googleusercontent.com/a/mock"
        }
    )
    assert user_res.status_code == 200, f"User Google auth failed: {user_res.text}"
    user_data = user_res.json()
    assert user_data["user_email"] == user_email
    assert user_data["user_name"] == user_name
    user_token = user_data["access_token"]
    print(f" -> User authenticated via Google + password: {user_email}")

    # 3. Resume Upload
    print("\n[TEST 3] Resume Upload")
    dummy_pdf = b"%PDF-1.4 sample resume content\n%%EOF"
    upload_res = client.post(
        "/api/applications/upload-resume",
        files={"file": ("candidate_resume.pdf", dummy_pdf, "application/pdf")}
    )
    assert upload_res.status_code == 200, f"Upload resume failed: {upload_res.text}"
    resume_filename = upload_res.json()["filename"]
    print(f" -> Resume uploaded: {resume_filename}")

    # 4. Submit Internship Application
    print("\n[TEST 4] Submit Internship Application")
    app_res = client.post(
        "/api/applications",
        json={
            "google_email": user_email,
            "full_name": user_name,
            "email": user_email,
            "phone": "+91 9876543210",
            "college": "COEP Technological University",
            "degree": "B.Tech Information Technology",
            "year_of_study": "3rd Year",
            "skills": ["React", "FastAPI", "PostgreSQL"],
            "duration": "3 Months",
            "role_preference": "Full Stack Web Development",
            "experience_description": "Built full-stack web applications with Python & Next.js.",
            "resume_filename": resume_filename
        }
    )
    assert app_res.status_code == 201, f"Application creation failed: {app_res.text}"
    created_app = app_res.json()
    app_id = created_app["id"]
    print(f" -> Application created with ID: {app_id}")

    # 5. Admin Section: View Registered Users & Password Visibility
    print("\n[TEST 5] Admin /admin/users Password Visibility")
    users_res = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert users_res.status_code == 200, f"Get users failed: {users_res.text}"
    users = users_res.json()["items"]
    target_user = next((u for u in users if u["email"] == user_email), None)
    assert target_user is not None, f"User {user_email} not found in admin users table!"
    assert target_user["password"] == user_password, f"Expected password '{user_password}', got '{target_user.get('password')}'"
    print(f" -> Admin verified user password: '{target_user['password']}' for user: {target_user['email']}")

    # 6. Admin Applications Table
    print("\n[TEST 6] Admin /admin/applications Status Update")
    apps_res = client.get(
        "/api/admin/applications",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert apps_res.status_code == 200
    apps = apps_res.json()["items"]
    target_app = next((a for a in apps if a["id"] == app_id), None)
    assert target_app is not None
    assert target_app["resume_filename"] == resume_filename

    # Status update
    status_res = client.patch(
        f"/api/admin/applications/{app_id}/status",
        json={"status": "accepted"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "accepted"
    print(f" -> Application {app_id} status updated to 'accepted'!")

    print("\n" + "=" * 60)
    print("ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY! ✅")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
