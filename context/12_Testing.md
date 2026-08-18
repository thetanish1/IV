# 12 QA & Automated Testing Plan

## Backend Tests (Pytest)
- `tests/test_auth.py`: Admin login with valid/invalid credentials, JWT verification.
- `tests/test_courses.py`: Fetch courses, create course as admin.
- `tests/test_applications.py`: Submit internship application with validation checks.
- `tests/test_payments.py`: Create order and test mock Razorpay verification.
- `tests/test_export.py`: Download Excel file and verify `.xlsx` headers and non-empty file size.

## Frontend E2E Verification
- Complete form submissions (Internship Application).
- Registration checkout trigger and simulation modal.
- Admin dashboard filtering, searching, and export button click.
