import os
import sys
import time

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.shared.email_service import (
    send_welcome_login_email,
    send_internship_application_email,
    send_internship_acceptance_email,
    send_submission_due_reminder_email,
    send_submission_reviewed_email,
    send_doubt_answered_email,
    send_course_enrollment_request_received_email,
    send_course_enrollment_acceptance_email,
    send_internship_rejection_email,
    send_course_enrollment_rejection_email,
    _send_smtp_email,
    _build_base_email_template,
)

TARGET_EMAIL = "pathadesuraj75@gmail.com"
TARGET_NAME = "Suraj Pathade"

print(f"===========================================================")
print(f"INTERNVISION TECH - SENDING ALL TEST EMAILS TO: {TARGET_EMAIL}")
print(f"===========================================================\n")

results = {}

# 1. Welcome & Login Notification Email
print("1. Sending Welcome / Login Notification Email...")
try:
    res1 = send_welcome_login_email(TARGET_EMAIL, TARGET_NAME)
    results["1. Welcome & Login Email"] = "SUCCESS" if res1 else "FAILED"
    print(f"   -> Result: {results['1. Welcome & Login Email']}")
except Exception as e:
    results["1. Welcome & Login Email"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

time.sleep(1)

# 2. Internship Application Received (1 Month)
print("\n2. Sending Application Received Confirmation Email (1 Month Track)...")
try:
    res2 = send_internship_application_email(
        user_email=TARGET_EMAIL,
        user_name=TARGET_NAME,
        duration="1 Month",
        role_preference="Full Stack Web Development",
        college="Pune Institute of Computer Technology (PICT)"
    )
    results["2. Application Received (1 Month)"] = "SUCCESS" if res2 else "FAILED"
    print(f"   -> Result: {results['2. Application Received (1 Month)']}")
except Exception as e:
    results["2. Application Received (1 Month)"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

time.sleep(1)

# 3. Official Offer Letter & Roadmap (1 Month Track)
print("\n3. Sending Official Selection & Offer Letter (1 Month Track)...")
try:
    res3 = send_internship_acceptance_email(
        student_email=TARGET_EMAIL,
        student_name=TARGET_NAME,
        duration="1 Month",
        role_preference="Full Stack Web Development"
    )
    results["3. Offer Letter (1 Month Track)"] = "SUCCESS" if res3 else "FAILED"
    print(f"   -> Result: {results['3. Offer Letter (1 Month Track)']}")
except Exception as e:
    results["3. Offer Letter (1 Month Track)"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

time.sleep(1)

# 4. Official Offer Letter & Roadmap (3 Months Track - Capstone & Portfolio)
print("\n4. Sending Official Selection & Offer Letter (3 Months Track)...")
try:
    res4 = send_internship_acceptance_email(
        student_email=TARGET_EMAIL,
        student_name=TARGET_NAME,
        duration="3 Months",
        role_preference="AI & Machine Learning Engineering"
    )
    results["4. Offer Letter (3 Months Track)"] = "SUCCESS" if res4 else "FAILED"
    print(f"   -> Result: {results['4. Offer Letter (3 Months Track)']}")
except Exception as e:
    results["4. Offer Letter (3 Months Track)"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

time.sleep(1)

# 5. Official Offer Letter & Roadmap (6 Months Enterprise Pre-Placement Track)
print("\n5. Sending Official Selection & Offer Letter (6 Months Enterprise Track)...")
try:
    res5 = send_internship_acceptance_email(
        student_email=TARGET_EMAIL,
        student_name=TARGET_NAME,
        duration="6 Months",
        role_preference="Cloud DevOps & Kubernetes Mastery"
    )
    results["5. Offer Letter (6 Months Track)"] = "SUCCESS" if res5 else "FAILED"
    print(f"   -> Result: {results['5. Offer Letter (6 Months Track)']}")
except Exception as e:
    results["5. Offer Letter (6 Months Track)"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

time.sleep(1)

# 6. Milestone Due Today Reminder
print("\n6. Sending Milestone Due Today Reminder Email...")
try:
    res6 = send_submission_due_reminder_email(
        student_email=TARGET_EMAIL,
        student_name=TARGET_NAME,
        task_title="Production API Security & OAuth2 Integration",
        task_key="month1_week2",
        duration="1 Month",
        role_preference="Full Stack Web Development"
    )
    results["6. Milestone Due Today Email"] = "SUCCESS" if res6 else "FAILED"
    print(f"   -> Result: {results['6. Milestone Due Today Email']}")
except Exception as e:
    results["6. Milestone Due Today Email"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

time.sleep(1)

# 7. Task Deliverable Reviewed & Approved Email
print("\n7. Sending Submission Review & Feedback Email (Approved)...")
try:
    res7 = send_submission_reviewed_email(
        student_email=TARGET_EMAIL,
        student_name=TARGET_NAME,
        task_title="Modern UI Architecture & Responsive Component Trees",
        status="approved",
        admin_feedback="Excellent job! Clean Next.js component hierarchy and responsive Tailwind layout. Approved for Week 2 module access."
    )
    results["7. Task Submission Approved Email"] = "SUCCESS" if res7 else "FAILED"
    print(f"   -> Result: {results['7. Task Submission Approved Email']}")
except Exception as e:
    results["7. Task Submission Approved Email"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

time.sleep(1)

# 8. Task Deliverable Review with Feedback (Changes Requested)
print("\n8. Sending Submission Review & Feedback Email (Changes Requested)...")
try:
    res8 = send_submission_reviewed_email(
        student_email=TARGET_EMAIL,
        student_name=TARGET_NAME,
        task_title="RESTful Backend Architecture & Database Relational Modeling",
        status="needs_revision",
        admin_feedback="Please ensure all API endpoints include Pydantic schema validation and error handling for 404/500 responses before final approval."
    )
    results["8. Task Changes Requested Email"] = "SUCCESS" if res8 else "FAILED"
    print(f"   -> Result: {results['8. Task Changes Requested Email']}")
except Exception as e:
    results["8. Task Changes Requested Email"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

time.sleep(1)

# 9. Certificate Verified & Issued Notification Email
print("\n9. Sending Certificate Issued & Verified Email...")
try:
    cert_subject = f"🎓 Certificate Issued & Verified: Java Developer | InternVision Tech"
    cert_html = f"""
    <p>Dear <strong>{TARGET_NAME}</strong>,</p>
    <p>Congratulations on successfully completing your <strong>Java Developer Virtual Internship</strong> at <strong>InternVision Tech</strong>!</p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #10b981; padding: 18px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px; color: #065f46;">Verified Completion Credential</h3>
      <table style="font-size: 13px; color: #1e293b; line-height: 1.8;">
        <tr><td style="font-weight: 600;">Certificate ID:</td><td><strong>IVT/JUN26/2026/0201</strong></td></tr>
        <tr><td style="font-weight: 600;">Candidate:</td><td>{TARGET_NAME} ({TARGET_EMAIL})</td></tr>
        <tr><td style="font-weight: 600;">Program:</td><td>Java Developer (1 Month)</td></tr>
        <tr><td style="font-weight: 600;">Grade:</td><td style="color: #059669; font-weight: bold;">Distinction (Grade A+)</td></tr>
        <tr><td style="font-weight: 600;">Verification Status:</td><td style="color: #10b981; font-weight: bold;">✓ 100% Authenticated & QR-Verified</td></tr>
      </table>
    </div>
    <p>You can view and verify your official credential at any time using our public verification portal.</p>
    """
    cert_full_html = _build_base_email_template(
        badge_text="Certificate Verified & Issued",
        badge_color="#10b981",
        title="Official Internship Certificate",
        body_content_html=cert_html,
        cta_text="Verify Certificate Online →",
        cta_url="https://iv-theta.vercel.app/verify-certificate?id=IVT/JUN26/2026/0201",
        accent_color="#10b981"
    )
    res9 = _send_smtp_email(TARGET_EMAIL, cert_subject, cert_full_html, f"Certificate Issued to {TARGET_NAME}")
    results["9. Certificate Issued Email"] = "SUCCESS" if res9 else "FAILED"
    print(f"   -> Result: {results['9. Certificate Issued Email']}")
except Exception as e:
    results["9. Certificate Issued Email"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

time.sleep(1)

# 10. Technical Query / Doubt Mentor Resolution Email
print("\n10. Sending Doubt / Technical Query Resolved Email...")
try:
    res10 = send_doubt_answered_email(
        student_email=TARGET_EMAIL,
        student_name=TARGET_NAME,
        module_name="Week 2 Backend APIs & Docker",
        question="Docker port binding error (0.0.0.0:8000 already in use)",
        mentor_reply="This error occurs when another process (such as a previous container or local uvicorn instance) is already occupying port 8000. Run 'docker ps' to locate the running container and 'docker stop <container_id>', or map to an alternate external port using '-p 8001:8000' in your docker run command.",
        answered_by="Senior Technical Mentor Desk"
    )
    results["10. Query Resolution Email"] = "SUCCESS" if res10 else "FAILED"
    print(f"   -> Result: {results['10. Query Resolution Email']}")
except Exception as e:
    results["10. Query Resolution Email"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

time.sleep(1)

# 11. Bootcamp Course Enrollment Request Received
print("\n11. Sending Bootcamp Course Enrollment Request Received Email...")
try:
    res11 = send_course_enrollment_request_received_email(
        student_email=TARGET_EMAIL,
        student_name=TARGET_NAME,
        course_title="Full Stack Cloud & GenAI Engineering Masterclass"
    )
    results["11. Bootcamp Request Received Email"] = "SUCCESS" if res11 else "FAILED"
    print(f"   -> Result: {results['11. Bootcamp Request Received Email']}")
except Exception as e:
    results["11. Bootcamp Request Received Email"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

time.sleep(1)

# 12. Bootcamp Course Enrollment Approved
print("\n12. Sending Bootcamp Course Enrollment Approved Email...")
try:
    res12 = send_course_enrollment_acceptance_email(
        student_email=TARGET_EMAIL,
        student_name=TARGET_NAME,
        course_title="Full Stack Cloud & GenAI Engineering Masterclass",
        course_duration="8 Weeks"
    )
    results["12. Bootcamp Enrollment Approved Email"] = "SUCCESS" if res12 else "FAILED"
    print(f"   -> Result: {results['12. Bootcamp Enrollment Approved Email']}")
except Exception as e:
    results["12. Bootcamp Enrollment Approved Email"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

time.sleep(1)

# 13. Internship Rejection / Polite Notice Email
print("\n13. Sending Internship Application Notice (Rejection)...")
try:
    res13 = send_internship_rejection_email(
        student_email=TARGET_EMAIL,
        student_name=TARGET_NAME,
        duration="1 Month",
        role_preference="Cybersecurity & Ethical Hacking"
    )
    results["13. Internship Polite Notice Email"] = "SUCCESS" if res13 else "FAILED"
    print(f"   -> Result: {results['13. Internship Polite Notice Email']}")
except Exception as e:
    results["13. Internship Polite Notice Email"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

time.sleep(1)

# 14. Course Enrollment Rejection / Full Notice Email
print("\n14. Sending Bootcamp Application Notice (Capacity Full)...")
try:
    res14 = send_course_enrollment_rejection_email(
        student_email=TARGET_EMAIL,
        student_name=TARGET_NAME,
        course_title="Autonomous AI Agents Bootcamp",
        course_duration="6 Weeks"
    )
    results["14. Bootcamp Capacity Full Email"] = "SUCCESS" if res14 else "FAILED"
    print(f"   -> Result: {results['14. Bootcamp Capacity Full Email']}")
except Exception as e:
    results["14. Bootcamp Capacity Full Email"] = f"ERROR: {e}"
    print(f"   -> Error: {e}")

print("\n===========================================================")
print("EMAIL DISPATCH SUMMARY:")
print("===========================================================")
for test_name, status in results.items():
    print(f" • {test_name}: {status}")
print("===========================================================\n")
