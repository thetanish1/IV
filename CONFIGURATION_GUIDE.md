# InternVision Tech - Configuration & Setup Guide

This guide covers step-by-step instructions to configure **Supabase**, **Firebase Auth**, **SMTP Email Notifications**, and **Cashfree Payment Gateway** for the InternVision Tech platform.

---

## 1. Supabase Database Configuration

InternVision Tech is built to connect seamlessly with **Supabase PostgreSQL**.

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project** and choose a project name (e.g., `internvision-db`) and database password.
3. Select your preferred region (e.g., `South Asia (Mumbai)` or closest to your users).

### Step 2: Get Connection String
1. In your Supabase Project Dashboard, go to **Project Settings** → **Database**.
2. Scroll to **Connection string**:
   - **Transaction Pooler (Port 6543 - Recommended for Serverless/FastAPI)**:
     ```env
     DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
   - **Direct Connection (Port 5432)**:
     ```env
     DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
     ```
3. Copy this string into `backend/.env` as `DATABASE_URL`.

### Step 3: Run Database Tables / Schema
You have two options:
- **Automatic**: When you start the FastAPI backend (`python -m uvicorn app.main:app`), SQLAlchemy automatically creates all tables and seeds the admin and default courses.
- **Manual (SQL Editor)**: Open **SQL Editor** in your Supabase dashboard and run the [`supabase_schema.sql`](./supabase_schema.sql) file.

---

## 2. SMTP Email Notifications Configuration

InternVision Tech automatically sends:
1. **Welcome / Login Notification Email** whenever a candidate logs in or registers.
2. **Tailored Application Confirmation Email** when an applicant submits an internship application for **1 Month**, **3 Months**, or **6 Months**.

### Using Gmail SMTP (Recommended for Quick Setup):
1. Enable 2-Step Verification on your Gmail account (`internvisiontechhr@gmail.com`).
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords).
3. Create a new App Password named `InternVision API`.
4. Copy the generated 16-character password into `backend/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=internvisiontechhr@gmail.com
   SMTP_PASSWORD=your_16_char_app_password
   SMTP_FROM_EMAIL=internvisiontechhr@gmail.com
   SMTP_FROM_NAME=InternVision Tech
   SMTP_TLS=True
   ```

*(If SMTP credentials are not yet added, the system automatically runs in simulation mode and logs email previews without crashing).*

---

## 3. Firebase Authentication Setup

Firebase handles **1-Click Google Sign-In** (without requiring or storing passwords) and **Email/Password** registration.

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named `internvision-tech`.
3. Go to **Build** → **Authentication** → **Sign-in method**:
   - Enable **Google** provider.
   - Enable **Email/Password** provider.
4. Go to **Settings** → **Authorized domains** and ensure `localhost` is listed.

### Step 2: Get Firebase Web Config
1. Go to **Project Settings** → **General** → **Your apps** → Click Web `</>`.
2. Copy the config keys into `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=internvision-tech.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=internvision-tech
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=internvision-tech.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
   ```

---

## 4. Cashfree Payment Gateway Configuration

InternVision Tech integrates **Cashfree Payment Gateway** ([merchant.cashfree.com](https://merchant.cashfree.com/)) with automated JS SDK checkout modal, order verification, and signed webhooks.

### Step 1: Obtain Cashfree API Keys
1. Go to [https://merchant.cashfree.com/](https://merchant.cashfree.com/) and create/sign in to your merchant account.
2. Navigate to **Payment Gateway** → **Developers** → **API Keys**.
3. Generate and copy your **App ID** and **Secret Key** (Test / Sandbox or Production).

### Step 2: Configure Environment Variables
- In `backend/.env`:
  ```env
  CASHFREE_APP_ID=your_cashfree_app_id
  CASHFREE_SECRET_KEY=your_cashfree_secret_key
  CASHFREE_ENVIRONMENT=sandbox          # 'sandbox' for testing, 'production' for live
  CASHFREE_API_VERSION=2023-08-01
  ```
- In `frontend/.env.local`:
  ```env
  NEXT_PUBLIC_CASHFREE_MODE=sandbox    # 'sandbox' or 'production'
  ```

*(For detailed integration architecture, test cards, and webhook setup, see the [CASHFREE_INTEGRATION_GUIDE.md](./CASHFREE_INTEGRATION_GUIDE.md)).*

---

## 5. Superadmin Access

- **Admin Login Route**: `/admin/login`
- **Superadmin Email**: `tanishdewase222@gmail.com`
- **Default Password**: `Admin@123456`
- Once logged in, the **Admin Portal** button unlocks on the Navbar with full access to:
  - Total applicants and applications management.
  - Resume viewing/downloading.
  - Applicant user accounts and contact records.
  - Payments Audit ledger and Excel exports.
  - Application status updates (`pending` → `accepted` / `shortlisted`).

---

## 6. Running the Application Locally

### Backend (FastAPI):
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (Next.js 15):
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
