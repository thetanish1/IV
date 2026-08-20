# 🚀 Complete Deployment Guide: InternVision Tech

This comprehensive guide covers deploying **InternVision Tech** to production using **Render** (Backend), **Vercel** (Frontend), **MongoDB / Cloud Database**, **Persistent File Storage**, and connecting your custom **`.online` domain**.

---

## 📑 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Step 1: Backend Deployment on Render](#step-1-backend-deployment-on-render)
3. [Step 2: Database Configuration (PostgreSQL / MongoDB)](#step-2-database-configuration)
4. [Step 3: Upload File Storage Configuration](#step-3-upload-file-storage-configuration)
5. [Step 4: Frontend Deployment on Vercel](#step-4-frontend-deployment-on-vercel)
6. [Step 5: Custom `.online` Domain Setup](#step-5-custom-online-domain-setup)
7. [Step 6: CORS & Production Environment Variables Checklist](#step-6-cors--production-environment-variables-checklist)

---

## 1. Architecture Overview

```mermaid
flowchart TD
    User["🌐 User / Applicant"] --> Domain["yourdomain.online (DNS)"]
    Domain -->|Frontend Traffic| Vercel["⚡ Vercel (Next.js Frontend)"]
    Domain -->|API Traffic| Render["🚀 Render (FastAPI Backend)"]
    Render --> DB[(🗄️ Managed Database)]
    Render --> Disk["💾 Persistent Storage / Resumes Disk"]
```

---

## Step 1: Backend Deployment on Render

Render hosts Python FastAPI web services with automatic HTTPS and continuous deployment from GitHub.

### 1.1 Create Web Service
1. Log in to [Render.com](https://render.com).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select **Build and deploy from a Git repository** $\rightarrow$ connect `thetanish1/IV`.
4. Fill in the service details:
   - **Name**: `internvision-backend`
   - **Region**: Singapore (or closest to your users)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: Free (or Starter if using Render Disks)

### 1.2 Backend Environment Variables on Render
Under **Environment Variables**, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `SECRET_KEY` | *(Generate a random 64-character string)* | JWT Signing key |
| `ALGORITHM` | `HS256` | JWT Algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | Token expiration (7 days) |
| `ADMIN_EMAIL` | `tanishdewase222@gmail.com` | Superadmin Email |
| `ADMIN_PASSWORD` | `Admin@123456` | Superadmin Initial Password |
| `BACKEND_CORS_ORIGINS` | `https://yourdomain.online,https://www.yourdomain.online,https://your-app.vercel.app` | Allowed CORS origins |
| `DATABASE_URL` | `sqlite:///./sql_app.db` *(or PostgreSQL connection string)* | Database URI |
| `GOOGLE_CLIENT_ID` | `your-google-oauth-client-id.apps.googleusercontent.com` | Google Identity Client ID |

Click **Create Web Service**. Once built, note your backend URL (e.g. `https://internvision-backend.onrender.com`).

---

## Step 2: Database Configuration

### Option A: Render Managed PostgreSQL (Recommended for Relational Data)
1. On Render, click **New +** $\rightarrow$ **PostgreSQL Database**.
2. Name: `internvision-db`.
3. Copy the **Internal Database URL** (e.g. `postgresql://user:pass@host/internvision_db`).
4. Set `DATABASE_URL` in your backend Web Service environment variables to this URL (replace `postgres://` with `postgresql://`).
5. SQLAlchemy will automatically initialize tables on startup via `Base.metadata.create_all(bind=engine)`.

### Option B: MongoDB Atlas
If you choose MongoDB Atlas:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Database Access** $\rightarrow$ Create Database User.
3. Go to **Network Access** $\rightarrow$ Add `0.0.0.0/0` (Allow Access from Anywhere).
4. Get your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/internvision`.
5. Add `MONGODB_URL` to your Render environment variables.

---

## Step 3: Upload File Storage Configuration

### Option A: Render Persistent Disk (Simple & Direct)
1. In your Render Web Service dashboard, go to **Disks**.
2. Click **Add Disk**:
   - **Name**: `resumes-disk`
   - **Mount Path**: `/opt/render/project/src/backend/uploads`
   - **Size**: 1 GB - 10 GB
3. All uploaded candidate resumes in `backend/uploads/resumes/` will persist across deployments and server restarts.

### Option B: Cloudinary / AWS S3 (Cloud Storage)
1. For cloud object storage, set up a free [Cloudinary](https://cloudinary.com) or AWS S3 bucket.
2. Add `CLOUDINARY_URL` or `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` to Render environment variables.

---

## Step 4: Frontend Deployment on Vercel

Vercel provides native Next.js hosting with edge caching and zero-config builds.

### 4.1 Import Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select `thetanish1/IV`.
4. Configure settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend` (Click *Edit* $\rightarrow$ select `frontend`)
   - **Build Command**: `next build`
   - **Output Directory**: `.next`

### 4.2 Frontend Environment Variables on Vercel
Add the following under **Environment Variables**:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://internvision-backend.onrender.com/api` *(or your custom API domain)* | Render backend API endpoint |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `your-google-oauth-client-id.apps.googleusercontent.com` | Google OAuth Client ID |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_yourkey` *(or live key)* | Razorpay Key ID |

Click **Deploy**. Your frontend will be live at `https://your-project.vercel.app`.

---

## Step 5: Custom `.online` Domain Setup

Let's connect your custom `.online` domain (e.g. `internvision.online`) from Namecheap, Hostinger, GoDaddy, or Cloudflare.

### 5.1 Connect Domain to Frontend (Vercel)
1. In your Vercel Project dashboard, go to **Settings** $\rightarrow$ **Domains**.
2. Enter your domain: `yourdomain.online` and click **Add**.
3. Also add `www.yourdomain.online`.
4. Vercel will display the required DNS records:

| Record Type | Host / Name | Value / Destination | TTL |
| :--- | :--- | :--- | :--- |
| **A Record** | `@` (or blank) | `76.76.21.21` | Automatic / 300 |
| **CNAME Record** | `www` | `cname.vercel-dns.com` | Automatic / 300 |

### 5.2 Connect Subdomain to Backend API (Optional & Clean)
To give your API a clean custom domain like `api.yourdomain.online`:
1. In your **Render Web Service** $\rightarrow$ **Settings** $\rightarrow$ **Custom Domains**.
2. Add `api.yourdomain.online`.
3. Add a DNS CNAME record in your domain registrar:

| Record Type | Host / Name | Value / Destination | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME Record** | `api` | `internvision-backend.onrender.com` | Automatic / 300 |

4. Update your Vercel `NEXT_PUBLIC_API_URL` environment variable to:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.online/api
   ```

### 5.3 Configure DNS at Your Domain Registrar (e.g., Hostinger / Namecheap)
1. Open your domain provider's **DNS Management** panel.
2. Add the records listed above.
3. SSL Certificates (HTTPS) will be automatically generated and provisioned by Vercel and Render within 5-15 minutes.

---

## Step 6: CORS & Production Environment Variables Checklist

Ensure `BACKEND_CORS_ORIGINS` in your Render backend contains your live domains:
```env
BACKEND_CORS_ORIGINS="https://yourdomain.online,https://www.yourdomain.online,https://your-app.vercel.app"
```

### ✅ Verification Steps
1. Visit `https://yourdomain.online` $\rightarrow$ Home page loads securely with SSL (`https`).
2. Navigate to `https://yourdomain.online/apply` $\rightarrow$ Test Google Sign-in & application submission.
3. Navigate to `https://yourdomain.online/admin/login` $\rightarrow$ Log in with admin credentials and verify applicant resume downloads & password visibility.
