import requests
import json
import os

BASE_URL = "http://localhost:8000/api"

def test_system():
    print("=" * 60)
    print("RUNNING END-TO-END VERIFICATION")
    print("=" * 60)

    # 1. Admin Login with tanishdewase222@gmail.com
    print("\n[TEST 1] Admin Authentication with tanishdewase222@gmail.com")
    admin_login_res = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": "tanishdewase222@gmail.com", "password": "Admin@123456"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert admin_login_res.status_code == 200, f"Admin login failed: {admin_login_res.text}"
    admin_token = admin_login_res.json()["access_token"]
    print(" -> Admin token obtained successfully!")

    # 2. Public User Registration & Google + Password Flow (Student)
    print("\n[TEST 2] Public User (Student) Google Sign-in & Password Setup")
    user_email = "student.applicant@gmail.com"
    user_password = "StudentPassword123!"
    user_auth_res = requests.post(
        f"{BASE_URL}/auth/user/google-with-password",
        json={
            "credential": "mock_token",
            "email": user_email,
            "password": user_password,
            "full_name": "Rohan Sharma"
        }
    )
    assert user_auth_res.status_code == 200, f"Google+password auth failed: {user_auth_res.text}"
    user_token = user_auth_res.json()["access_token"]
    print(f" -> Student Google authenticated with password: {user_email}")

    # 3. Resume File Upload
    print("\n[TEST 3] Resume File Upload")
    dummy_pdf_content = b"%PDF-1.4 dummy resume content for Rohan Sharma\n%%EOF"
    upload_res = requests.post(
        f"{BASE_URL}/applications/upload-resume",
        files={"file": ("rohan_sharma_resume.pdf", dummy_pdf_content, "application/pdf")}
    )
    assert upload_res.status_code == 200, f"Resume upload failed: {upload_res.text}"
    resume_data = upload_res.json()
    resume_filename = resume_data["filename"]
    print(f" -> Resume uploaded successfully! Filename: {resume_filename}")

    # 4. Resume File Retrieval / Download
    print("\n[TEST 4] Resume File Download / View Endpoint")
    download_res = requests.get(f"{BASE_URL}/applications/resume/{resume_filename}")
    assert download_res.status_code == 200, f"Resume download failed: {download_res.text}"
    assert b"%PDF-1.4" in download_res.content
    print(" -> Resume file served and verified successfully!")

    # 5. Internship Application Submission with All Fields
    print("\n[TEST 5] Internship Application Submission with Professional Description")
    app_payload = {
        "google_email": user_email,
        "full_name": "Rohan Sharma",
        "email": user_email,
        "phone": "+91 9876543210",
        "college": "Pune Institute of Computer Technology",
        "degree": "B.E. Computer Engineering",
        "year_of_study": "3rd Year",
        "skills": ["React", "Next.js", "Python", "FastAPI", "PostgreSQL"],
        "duration": "3 Months",
        "role_preference": "Full Stack Web Development",
        "linkedin_url": "https://linkedin.com/in/rohansharma",
        "github_url": "https://github.com/rohansharma",
        "portfolio_url": "https://rohansharma.dev",
        "experience_description": "Built full-stack applications with Next.js 15 and FastAPI. Designed relational schemas and REST APIs.",
        "cover_letter": "Passionate about full-stack engineering and building high-performance production products.",
        "resume_filename": resume_filename
    }
    app_res = requests.post(f"{BASE_URL}/applications", json=app_payload)
    assert app_res.status_code == 201, f"Application creation failed: {app_res.text}"
    created_app = app_res.json()
    app_id = created_app["id"]
    print(f" -> Application submitted successfully with ID: {app_id}")

    # 6. Admin User Accounts Table Retrieval & Password Visibility
    print("\n[TEST 6] Admin Section: User Accounts Table & Password Visibility (/admin/users)")
    admin_users_res = requests.get(
        f"{BASE_URL}/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_users_res.status_code == 200, f"Get users failed: {admin_users_res.text}"
    users_list = admin_users_res.json()["items"]
    found_user = next((u for u in users_list if u["email"] == user_email), None)
    assert found_user is not None, f"User {user_email} not found in admin table!"
    assert found_user.get("password") == user_password, f"Expected password '{user_password}', got '{found_user.get('password')}'"
    print(f" -> Found registered user in Admin section with password '{found_user['password']}' and {found_user['applications_count']} application(s)!")

    # 7. Admin Applications Table & Detail Review
    print("\n[TEST 7] Admin Section: Applications Table & Status Update")
    admin_apps_res = requests.get(
        f"{BASE_URL}/admin/applications",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_apps_res.status_code == 200, f"Get applications failed: {admin_apps_res.text}"
    apps_list = admin_apps_res.json()["items"]
    target_app = next((a for a in apps_list if a["id"] == app_id), None)
    assert target_app is not None, f"Application {app_id} not found in admin applications list!"
    assert target_app["resume_filename"] == resume_filename
    assert target_app["experience_description"] is not None
    print(f" -> Application verified in Admin list with resume {target_app['resume_filename']}")

    # Status update
    status_res = requests.patch(
        f"{BASE_URL}/admin/applications/{app_id}/status",
        json={"status": "accepted"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert status_res.status_code == 200, f"Status update failed: {status_res.text}"
    assert status_res.json()["status"] == "accepted"
    print(f" -> Application {app_id} status updated to 'accepted'!")

    # 8. Dashboard Stats
    print("\n[TEST 8] Admin Dashboard Stats")
    stats_res = requests.get(
        f"{BASE_URL}/admin/stats",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert stats_res.status_code == 200, f"Get stats failed: {stats_res.text}"
    stats_data = stats_res.json()
    print(f" -> Stats: Total Users = {stats_data.get('total_users')}, Total Applications = {stats_data['total_applications']}")

    print("\n" + "=" * 60)
    print("ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY! ✅")
    print("=" * 60)

if __name__ == "__main__":
    test_system()
