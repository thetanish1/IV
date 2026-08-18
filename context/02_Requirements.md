# 02 Technical Requirements

## Functional Requirements
1. **Course Listing & Details**:
   - Courses must display title, slug, description, price (INR), duration, level, and technology badges.
2. **Course Registration & Checkout**:
   - Users fill student details (Name, Email, Phone).
   - Server creates a Razorpay order ID (`order_...`).
   - Frontend invokes Razorpay Modal.
   - Payment response (`razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`) is verified on backend using HMAC-SHA256 signature check.
3. **Internship Application**:
   - Fields: Full Name, Email, Phone, College, Degree, Year of Study, Skills (Array), Duration (`1 Month`, `3 Months`, `6 Months`).
   - Validate with Zod & Pydantic.
   - Store in PostgreSQL DB.
4. **Admin Panel**:
   - Login with JWT token (stored securely in browser).
   - Stats summary: Total Revenue, Total Applicants, Enrolled Registrations, Completed Payments.
   - Filter applicants by duration or search by name/email/college.
   - Filter payments by status (`captured`, `created`, `failed`).
   - Export filtered/all applicants or payments directly to `.xlsx` download.

## Non-Functional Requirements
- **Performance**: <200ms API response time.
- **Security**: Password hashing via Bcrypt, JWT authentication for admin routes, CORS configuration, SQL injection defense via SQLAlchemy ORM.
- **Reliability**: Graceful error handling with unified error responses.
