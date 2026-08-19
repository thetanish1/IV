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
