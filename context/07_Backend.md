# 07 Backend Architecture

## Tech Stack
- FastAPI (Python 3.11+)
- SQLAlchemy 2.0 ORM
- Pydantic v2 schemas
- Alembic DB migrations
- PyJWT & Passlib (Bcrypt) for JWT Auth
- Razorpay Python SDK / HMAC SHA256 signature verification
- OpenPyXL for Excel generation

## Security Controls
- **JWT Authentication**: 24-hour expiration token with Secret Key signing.
- **Password Hashing**: Bcrypt algorithm.
- **SQL Injection Defense**: Prepared statements via SQLAlchemy ORM.
- **XSS & Input Protection**: Strict Pydantic schema parsing & sanitization.
- **CORS Middleware**: Explicit origin authorization.
