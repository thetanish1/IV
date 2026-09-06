-- ============================================================================
-- INTERNVISION TECH - SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Superadmin (Password: Admin@123456)
INSERT INTO admins (email, hashed_password, full_name, is_active)
VALUES (
    'tanishdewase222@gmail.com',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Tanish Dewase (Admin)',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- 3. Site Users Table (Firebase Google & Email/Password Applicants)
CREATE TABLE IF NOT EXISTS site_users (
    id SERIAL PRIMARY KEY,
    google_sub VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    picture VARCHAR(500),
    hashed_password VARCHAR(255),
    raw_password VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'google',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_site_users_email ON site_users (email);

-- 4. Internship Applications Table
CREATE TABLE IF NOT EXISTS internship_applications (
    id SERIAL PRIMARY KEY,
    google_email VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    college VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    year_of_study VARCHAR(50) NOT NULL,
    skills TEXT[] DEFAULT '{}',
    duration VARCHAR(50) NOT NULL,
    role_preference VARCHAR(255) NOT NULL,
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    experience_description TEXT,
    cover_letter TEXT,
    resume_filename VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_internship_apps_email ON internship_applications (email);
CREATE INDEX IF NOT EXISTS idx_internship_apps_status ON internship_applications (status);

-- 5. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    level VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    technologies TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Courses
INSERT INTO courses (id, title, slug, description, level, duration, price, technologies)
VALUES 
(
    'full-stack-web-development',
    'Full Stack Web Development Bootcamp',
    'full-stack-web-development',
    'Master Next.js 15, React 19, FastAPI, PostgreSQL, and modern Tailwind CSS. Build production-scale full stack web applications.',
    'Intermediate',
    '8 Weeks',
    4999.00,
    ARRAY['Next.js', 'React', 'FastAPI', 'PostgreSQL', 'Tailwind CSS']
),
(
    'ai-machine-learning-engineering',
    'AI & Machine Learning Engineering Bootcamp',
    'ai-machine-learning-engineering',
    'Build cutting-edge AI models, fine-tune LLMs, integrate PyTorch and Vector DBs into production systems.',
    'Advanced',
    '12 Weeks',
    6999.00,
    ARRAY['Python', 'PyTorch', 'OpenAI API', 'LangChain', 'FastAPI', 'Vector DBs']
)
ON CONFLICT (id) DO NOTHING;

-- 6. Payments Table (Razorpay Orders & Transactions)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(100) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_phone VARCHAR(50) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(500),
    status VARCHAR(50) DEFAULT 'created',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments (razorpay_order_id);

-- 7. Certificates Table (Digital Credential Verification Registry)
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    certificate_id VARCHAR(64) UNIQUE NOT NULL,
    student_name VARCHAR(128) NOT NULL,
    student_email VARCHAR(128) NOT NULL,
    program_title VARCHAR(255) NOT NULL,
    track_type VARCHAR(64) DEFAULT 'Internship',
    duration VARCHAR(64) NOT NULL,
    issue_date VARCHAR(64) NOT NULL,
    grade VARCHAR(64) DEFAULT 'Excellence',
    skills_acquired JSONB DEFAULT '[]'::jsonb,
    instructor_name VARCHAR(128) DEFAULT 'InternVision Tech Academic Council',
    credential_url VARCHAR(255),
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON certificates (certificate_id);

-- Sample Verified Certificates Seed
INSERT INTO certificates (certificate_id, student_name, student_email, program_title, track_type, duration, issue_date, grade, skills_acquired, instructor_name, is_valid)
VALUES
(
    'IVT-2026-FS-8492',
    'Aarav Sharma',
    'aarav.sharma@example.com',
    'Full Stack Web Development Co-Op',
    'Virtual Internship',
    '3 Months',
    'August 15, 2026',
    'Distinction (Grade A+)',
    '["Next.js 15", "React 19", "TypeScript", "FastAPI", "PostgreSQL", "Tailwind CSS"]'::jsonb,
    'Tanish Dewase, Lead Architect & Academic Director',
    TRUE
),
(
    'IVT-2026-AIML-5521',
    'Ananya Verma',
    'ananya.verma@example.com',
    'AI & Machine Learning Engineering Track',
    'Bootcamp',
    '12 Weeks',
    'August 20, 2026',
    'Excellence (Grade O)',
    '["Python", "PyTorch", "LLM APIs", "LangChain", "RAG Systems", "Vector DBs"]'::jsonb,
    'InternVision Tech AI Research Group',
    TRUE
),
(
    'IVT-2026-DO-9104',
    'Rohan Kulkarni',
    'rohan.kulkarni@example.com',
    'Cloud DevOps & Kubernetes Mastery',
    'Virtual Internship',
    '6 Months Industrial Co-Op',
    'August 28, 2026',
    'Distinction (Grade A+)',
    '["Docker", "Kubernetes", "AWS Cloud", "Terraform", "CI/CD Pipelines", "Linux"]'::jsonb,
    'Tanish Dewase, Lead Architect',
    TRUE
),
(
    'IVT-2026-CS-3382',
    'Priya Patel',
    'priya.patel@example.com',
    'Cyber Security & Ethical Hacking Track',
    'Bootcamp',
    '8 Weeks',
    'September 01, 2026',
    'Merit (Grade A)',
    '["Penetration Testing", "Wireshark", "Burp Suite", "OWASP Top 10", "Network Security"]'::jsonb,
    'InternVision Tech Security Operations',
    TRUE
)
ON CONFLICT (certificate_id) DO NOTHING;
