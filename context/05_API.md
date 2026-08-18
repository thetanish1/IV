# 05 REST API Specification

## Endpoints Summary

### Authentication
- `POST /api/v1/auth/login` - Admin authentication returning JWT access token.
- `GET /api/v1/auth/me` - Get current authenticated admin user profile.

### Public Courses & Registrations
- `GET /api/v1/courses` - Fetch published courses (optional search query filter).
- `GET /api/v1/courses/{id}` - Fetch course detail by ID or slug.
- `POST /api/v1/courses` - Create new course (Admin only).
- `POST /api/v1/registrations` - Create a student course registration draft.

### Payments (Razorpay)
- `POST /api/v1/payments/create-order` - Generate Razorpay Order ID for registration or course.
- `POST /api/v1/payments/verify` - Verify HMAC signature & update payment/registration status to `captured`.

### Internship Applications
- `POST /api/v1/applications` - Submit student internship application (1/3/6 months).

### Admin Dashboard & Reports (Protected)
- `GET /api/v1/admin/stats` - Summary statistics (Revenue, Total Applicants, Registrations, Payments breakdown).
- `GET /api/v1/admin/applications` - Paginated applicants with search (`q`), filter (`duration`, `status`), page/limit.
- `GET /api/v1/admin/registrations` - Paginated course registrations.
- `GET /api/v1/admin/payments` - Paginated payments list with status filter.
- `GET /api/v1/admin/export/applications` - Download `.xlsx` spreadsheet of applications using OpenPyXL.
- `GET /api/v1/admin/export/payments` - Download `.xlsx` spreadsheet of payments using OpenPyXL.
