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
