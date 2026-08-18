# 10 Architecture Decision Records (ADR)

## ADR 1: Dual Database Support (PostgreSQL / SQLite)
- **Status**: Accepted
- **Context**: Need seamless production PostgreSQL support (Supabase/Railway) alongside zero-config local development and automated testing capability.
- **Decision**: Use SQLAlchemy database engine URL dispatcher allowing fallback to SQLite (`sqlite:///./sql_app.db`) when `DATABASE_URL` is omitted or local.

## ADR 2: OpenPyXL for Server-Side Excel Generation
- **Status**: Accepted
- **Context**: Need real binary `.xlsx` files generated with custom column widths and styled headers for Admin exports.
- **Decision**: Implement OpenPyXL service in Python backend to render binary stream directly to client response.

## ADR 3: Razorpay Test Mode Signature Validation
- **Status**: Accepted
- **Context**: Ensure secure payment processing in test mode without fake client bypasses.
- **Decision**: Perform HMAC-SHA256 signature verification on backend using `RAZORPAY_KEY_SECRET`.
