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
    resume_filename TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_internship_apps_email ON internship_applications (email);
CREATE INDEX IF NOT EXISTS idx_internship_apps_status ON internship_applications (status);

-- 5. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price_inr INTEGER NOT NULL DEFAULT 0,
    duration VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    technologies JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Courses
INSERT INTO courses (title, slug, description, level, duration, price_inr, technologies, is_published)
VALUES 
(
    'Full Stack Web Development Bootcamp',
    'full-stack-web-development',
    'Master Next.js 15, React 19, FastAPI, PostgreSQL, and modern Tailwind CSS. Build production-scale full stack web applications.',
    'Intermediate',
    '8 Weeks',
    0,
    '["Next.js", "React", "FastAPI", "PostgreSQL", "Tailwind CSS"]'::jsonb,
    TRUE
),
(
    'Data Science & AI Bootcamp',
    'data-science-ai',
    'Master statistical modeling, Exploratory Data Analysis (EDA), machine learning pipelines, Scikit-Learn, deep learning with TensorFlow, and data visualization.',
    'Intermediate',
    '10 Weeks',
    0,
    '["Python", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "Tableau"]'::jsonb,
    TRUE
),
(
    'Java Programming & Core Engineering',
    'java-programming',
    'Master Core Java 21, Object-Oriented Programming (OOP), Data Structures & Algorithms (DSA), multithreading, and enterprise Spring Boot microservices.',
    'Beginner',
    '8 Weeks',
    0,
    '["Java 21", "Spring Boot", "OOP", "DSA", "Hibernate", "MySQL"]'::jsonb,
    TRUE
),
(
    'Android App Development Bootcamp',
    'android-app-development',
    'Build high-performance native Android apps with Kotlin, declarative Jetpack Compose UI, MVVM architecture, Coroutines, Retrofit, and Firebase.',
    'Intermediate',
    '8 Weeks',
    0,
    '["Kotlin", "Jetpack Compose", "Android Studio", "Coroutines", "Retrofit", "Firebase"]'::jsonb,
    TRUE
),
(
    'AI & Machine Learning Engineering Bootcamp',
    'ai-machine-learning-engineering',
    'Build cutting-edge AI models, fine-tune LLMs, integrate PyTorch and Vector DBs into production systems.',
    'Advanced',
    '12 Weeks',
    0,
    '["Python", "PyTorch", "OpenAI API", "LangChain", "FastAPI", "Vector DBs"]'::jsonb,
    TRUE
),
(
    'Cloud DevOps & Kubernetes Mastery',
    'cloud-devops-kubernetes-mastery',
    'Architect high-availability infrastructure with Docker, Kubernetes, Terraform, AWS, and production CI/CD automation pipelines.',
    'Intermediate',
    '10 Weeks',
    0,
    '["Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions"]'::jsonb,
    TRUE
),
(
    'Cyber Security & Ethical Hacking',
    'cyber-security-ethical-hacking',
    'Understand network security, penetration testing, cryptography, web vulnerability assessment, and defensive security strategies.',
    'Beginner',
    '8 Weeks',
    0,
    '["Linux", "Metasploit", "Wireshark", "Burp Suite", "Python"]'::jsonb,
    TRUE
)
ON CONFLICT (slug) DO NOTHING;

-- 6. Course Registrations Table
CREATE TABLE IF NOT EXISTS course_registrations (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_course_reg_email ON course_registrations (student_email);
CREATE INDEX IF NOT EXISTS idx_course_reg_status ON course_registrations (status);

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
    'IVT/JUN26/2026/0201',
    'Tanish Dewase',
    'tanishdewase222@gmail.com',
    'Java Developer',
    'Virtual Internship',
    '1 Month',
    '30 June 2026',
    'Distinction (Grade A+)',
    '["Java", "SQL", "GitHub", "Git", "Docker"]'::jsonb,
    'Suraj Kumar, HR & Manager',
    TRUE
),
(
    'IVT/JUN26/2026/0202',
    'Neha Mahule',
    'nehamahule28@gmail.com',
    'Web Developer',
    'Virtual Internship',
    '1 Month',
    '30 June 2026',
    'Distinction (Grade A+)',
    '["Basic HTML", "CSS", "JavaScript", "Git"]'::jsonb,
    'Suraj Kumar, HR & Manager',
    TRUE
),
(
    'IVT/JUN26/2026/0203',
    'Jay Doble',
    'jaydoble56@gmail.com',
    'Java Developer',
    'Virtual Internship',
    '1 Month',
    '30 June 2026',
    'Distinction (Grade A+)',
    '["Java", "SQL", "GitHub", "Git", "Docker"]'::jsonb,
    'Suraj Kumar, HR & Manager',
    TRUE
),
(
    'IVT/JUN26/2026/0204',
    'Paridhi Kshirsagar',
    'paridhikshirsagar16@gmail.com',
    'Java Developer',
    'Virtual Internship',
    '1 Month',
    '30 June 2026',
    'Distinction (Grade A+)',
    '["Java", "SQL", "GitHub", "Git", "Docker"]'::jsonb,
    'Suraj Kumar, HR & Manager',
    TRUE
)
ON CONFLICT (certificate_id) DO NOTHING;
