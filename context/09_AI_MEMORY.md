# 09 AI Memory, Log & Code Patterns

## Key Memory & Implementation Records

1. **Authentication & Password Hashing**:
   - Used direct `bcrypt.hashpw` and `bcrypt.checkpw` with utf-8 encoding to avoid Python 3.14 passlib compatibility errors.
   - Enforced 72-byte password truncation safety.

2. **Database Engine & Compatibility**:
   - SQLAlchemy 2.0 ORM with PostgreSQL URL parser (`postgresql://` vs legacy `postgres://`).
   - SQLite fallback for zero-dependency local testing (`sqlite:///./sql_app.db`).

3. **Payment Gateway (Razorpay Test Mode)**:
   - Server-side order creation (`POST /api/v1/payments/create-order`) producing `order_...` receipt.
   - Client checkout modal invocation via `https://checkout.razorpay.com/v1/checkout.js`.
   - Backend HMAC-SHA256 signature verification (`POST /api/v1/payments/verify`) marking registration as `confirmed` and payment as `captured`.

4. **Excel Export Engine (OpenPyXL)**:
   - Built `ExcelService` with openpyxl to generate binary stream `.xlsx` spreadsheets for Applications and Payments.
   - Styled dark headers (`#1E293B` background, bold white text, thin light border) and dynamic column width auto-calculation.

5. **Frontend Architecture**:
   - Next.js 15 App Router (`src/app`), React 19, TypeScript, Tailwind CSS.
   - 11 production routes compiled with zero build errors.
