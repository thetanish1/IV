# 08 Deployment Guide

## Target Environments
- **Frontend**: Vercel (Next.js 15 App Router)
- **Backend**: Railway / Docker container (FastAPI ASGI Uvicorn)
- **Database**: Supabase PostgreSQL / Managed PostgreSQL

## Deployment Steps
1. **Database Setup**: Create PostgreSQL instance on Supabase/Railway, update `DATABASE_URL`.
2. **Backend Deployment**:
   - Environment Variables: `DATABASE_URL`, `SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
   - Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
3. **Frontend Deployment**:
   - Environment Variables: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
   - Build: `npm run build`.
