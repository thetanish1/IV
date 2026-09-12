export interface Course {
 id: number;
 title: string;
 slug: string;
 description: string;
 price_inr: number;
 duration: string;
 level: string;
 technologies: string[];
 is_published: boolean;
 created_at: string;
 updated_at: string;
}

export interface InternshipApplicationInput {
  google_email?: string;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  year_of_study: string;
  skills: string[];
  duration: '1 Month' | '3 Months' | '6 Months';
  role_preference?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  experience_description?: string;
  cover_letter?: string;
  resume_filename?: string;
}

export interface InternshipApplicationResponse extends InternshipApplicationInput {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SiteUserItem {
  id: number;
  email: string;
  full_name: string;
  picture?: string | null;
  provider: string;
  password?: string;
  created_at: string;
  last_login?: string | null;
  applications_count: number;
}

export interface UserAuthData {
  access_token: string;
  token_type: string;
  user_email: string;
  user_name: string;
  user_picture?: string | null;
  role?: string;
}

export interface OrderCreateResponse {
  order_id: string;
  amount_inr: number;
  currency: string;
  key_id: string;
  registration_id: number;
}

export interface DashboardStats {
  total_revenue_inr: number;
  total_applications: number;
  total_registrations: number;
  total_payments: number;
  successful_payments: number;
  pending_applications: number;
  total_users?: number;
  total_contacts?: number;
  new_contacts?: number;
}

export interface ContactQueryItem {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | string;
  admin_reply?: string | null;
  replied_by?: string | null;
  replied_at?: string | null;
  created_at: string;
}

export interface PaginatedResult<T> {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  items: T[];
}

export interface PaymentItem {
  id: number;
  registration_id?: number;
  order_id: string;
  payment_id?: string;
  amount_inr: number;
  status: string;
  student_email: string;
  created_at: string;
}

export interface CourseRegistrationItem {
  id: number;
  course_id: number;
  course_title?: string;
  course_slug?: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  status: string;
  created_at: string;
}

export interface CertificateItem {
  id?: number;
  certificate_id: string;
  student_name: string;
  student_email: string;
  program_title: string;
  track_type: string;
  duration: string;
  issue_date: string;
  grade: string;
  skills_acquired: string[];
  instructor_name: string;
  is_valid: boolean;
  created_at?: string;
}

export interface SiteSettings {
  show_courses: boolean;
  show_careers: boolean;
}

export interface TaskSubmissionDetails {
  id?: number;
  project_topic?: string | null;
  github_url?: string | null;
  live_url?: string | null;
  documentation_url?: string | null;
  notes?: string | null;
  tools_used?: string[];
  status?: string;
  admin_feedback?: string | null;
  submitted_at?: string | null;
}

export interface WeeklyTaskItem {
  week: number;
  month?: number;
  month_title?: string;
  key: string;
  title: string;
  objective: string;
  deliverables: string[];
  tech_stack?: string[];
  evaluation_focus?: string;
  required_days: number;
  is_unlocked: boolean;
  submission?: TaskSubmissionDetails | null;
  unlock_request?: {
    status: string;
    reason: string;
  } | null;
}

export interface MilestoneProjectItem {
  key: string;
  title: string;
  objective: string;
  is_unlocked: boolean;
  curated_list?: Array<{
    id: string;
    title: string;
    description: string;
    tech_stack: string[];
  }>;
  submission?: TaskSubmissionDetails | null;
  unlock_request?: {
    status: string;
    reason: string;
  } | null;
}

export interface StudentDoubtItem {
  id: number;
  application_id?: number;
  student_email: string;
  student_name: string;
  domain_track: string;
  duration?: string;
  module_name: string;
  subject: string;
  question: string;
  code_snippet?: string | null;
  image_url?: string | null;
  status: "open" | "answered";
  admin_reply?: string | null;
  answered_by?: string | null;
  answered_at?: string | null;
  created_at: string;
}

export interface PortalData {
  has_application: boolean;
  is_accepted?: boolean;
  is_rejected?: boolean;
  id?: number;
  full_name?: string;
  email?: string;
  role_preference?: string;
  domain_title?: string;
  duration?: string;
  status?: string;
  days_elapsed?: number;
  start_date?: string | null;
  message?: string;
  weekly_tasks?: WeeklyTaskItem[];
  month2_project?: MilestoneProjectItem | null;
  month3_portfolio?: MilestoneProjectItem | null;
  month4_6_capstone?: MilestoneProjectItem | null;
  doubts?: StudentDoubtItem[];
}

export interface SubmissionAdminItem {
  id: number;
  application_id?: number;
  student_email: string;
  student_name: string;
  role_preference: string;
  duration: string;
  task_key: string;
  title: string;
  project_topic?: string | null;
  github_url?: string | null;
  live_url?: string | null;
  documentation_url?: string | null;
  notes?: string | null;
  tools_used: string[];
  is_unlocked: boolean;
  status: string;
  admin_feedback?: string | null;
  submitted_at?: string | null;
  updated_at?: string | null;
}

export interface UnlockRequestAdminItem {
  id: number;
  application_id?: number;
  student_email: string;
  student_name: string;
  role_preference?: string;
  duration?: string;
  task_key: string;
  task_title: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface SiteSettingItem {
  key: string;
  value: string;
  description?: string;
  updated_at?: string;
}

export interface ApplicantRecipientItem {
  email: string;
  name: string;
  type: "internship" | "course" | "user";
  role_preference: string;
  duration?: string;
  status: string;
  college?: string;
  created_at?: string | null;
}

export interface SentEmailItem {
  id: number;
  batch_id?: string | null;
  to: string;
  recipient_name?: string | null;
  subject: string;
  heading?: string | null;
  brand_name?: string | null;
  status: "success" | "failed";
  error_message?: string | null;
  message_id?: string | null;
  attachment_names: string[];
  created_at?: string | null;
}

export type AdminRole =
  | "super_admin"
  | "internship_manager"
  | "technical_mentor"
  | "course_coordinator"
  | "support_desk"
  | "custom";

export type AdminPermission =
  | "overview"
  | "applications"
  | "submissions"
  | "unlocks"
  | "doubts"
  | "users"
  | "enrollments"
  | "payments"
  | "certificates"
  | "contacts"
  | "mailer"
  | "settings";

export interface AdminAccountItem {
  id: number;
  email: string;
  full_name: string;
  role: AdminRole | string;
  permissions: AdminPermission[] | string[];
  is_active: boolean;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CurrentAdminProfile {
  id: number;
  email: string;
  full_name: string;
  role: AdminRole | string;
  permissions: string[];
  is_active: boolean;
  is_super_admin: boolean;
  created_by?: string | null;
  created_at?: string | null;
}



