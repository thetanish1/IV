# 04 Database Schema Specification

## Schema Design

### 1. `admins` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer / UUID | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `email` | String(255) | UNIQUE, NOT NULL, INDEX | Login email |
| `hashed_password` | String(255) | NOT NULL | Bcrypt hash |
| `full_name` | String(255) | NOT NULL | Admin name |
| `is_active` | Boolean | DEFAULT True | Active flag |
| `created_at` | DateTime | DEFAULT utcnow | Creation timestamp |
| `updated_at` | DateTime | DEFAULT utcnow, ON UPDATE | Update timestamp |

### 2. `courses` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer / UUID | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `title` | String(255) | NOT NULL | Course title |
| `slug` | String(255) | UNIQUE, NOT NULL, INDEX | URL slug |
| `description` | Text | NOT NULL | Overview & syllabus |
| `price_inr` | Integer | NOT NULL | Price in INR |
| `duration` | String(100) | NOT NULL | e.g. "8 Weeks" |
| `level` | String(50) | NOT NULL | e.g. "Beginner", "Intermediate" |
| `technologies` | JSON / Text | NOT NULL | Tech stack badges |
| `is_published` | Boolean | DEFAULT True | Publication status |
| `created_at` | DateTime | DEFAULT utcnow | Creation timestamp |
| `updated_at` | DateTime | DEFAULT utcnow | Update timestamp |

### 3. `course_registrations` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer / UUID | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `course_id` | Integer | FOREIGN KEY(courses.id) | Enrolled course |
| `student_name` | String(255) | NOT NULL | Student full name |
| `student_email` | String(255) | NOT NULL, INDEX | Student email |
| `student_phone` | String(50) | NOT NULL | Student phone |
| `status` | String(50) | DEFAULT 'pending' | 'pending', 'confirmed', 'cancelled' |
| `created_at` | DateTime | DEFAULT utcnow | Creation timestamp |
| `updated_at` | DateTime | DEFAULT utcnow | Update timestamp |

### 4. `payments` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer / UUID | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `registration_id` | Integer | FOREIGN KEY(course_registrations.id), NULLABLE | Associated registration |
| `order_id` | String(255) | UNIQUE, NOT NULL, INDEX | Razorpay Order ID |
| `payment_id` | String(255) | NULLABLE, INDEX | Razorpay Payment ID |
| `signature` | String(255) | NULLABLE | Verification signature |
| `amount_inr` | Integer | NOT NULL | Amount in INR |
| `status` | String(50) | DEFAULT 'created' | 'created', 'captured', 'failed' |
| `student_email` | String(255) | NOT NULL, INDEX | Payer email |
| `raw_response` | JSON | NULLABLE | Provider response |
| `created_at` | DateTime | DEFAULT utcnow | Creation timestamp |
| `updated_at` | DateTime | DEFAULT utcnow | Update timestamp |

### 5. `internship_applications` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer / UUID | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `full_name` | String(255) | NOT NULL | Applicant name |
| `email` | String(255) | NOT NULL, INDEX | Applicant email |
| `phone` | String(50) | NOT NULL | Phone number |
| `college` | String(255) | NOT NULL | College name |
| `degree` | String(100) | NOT NULL | Degree / Major |
| `year_of_study` | String(50) | NOT NULL | Year (1st, 2nd, 3rd, 4th, Graduated) |
| `skills` | JSON / Text | NOT NULL | Array of skills |
| `duration` | String(50) | NOT NULL | '1 Month', '3 Months', '6 Months' |
| `status` | String(50) | DEFAULT 'pending' | 'pending', 'under_review', 'accepted', 'rejected' |
| `created_at` | DateTime | DEFAULT utcnow | Application timestamp |
| `updated_at` | DateTime | DEFAULT utcnow | Update timestamp |
