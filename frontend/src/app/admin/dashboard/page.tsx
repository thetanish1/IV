"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  LogOut,
  Users,
  CreditCard,
  BookOpen,
  Download,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  DollarSign,
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
  ExternalLink,
  Link2,
  Code2,
  Globe,
  X,
  FileCheck,
  Building2,
  Phone,
  Mail,
  User,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Key,
  Award,
  Plus,
  Trash2,
  ShieldCheck,
  BadgeCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  Unlock,
  Lock,
  MessageSquare,
  Send,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Sliders,
  CheckCircle,
  XCircle,
  RefreshCw,
  FolderGit2,
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";
import {
  DashboardStats,
  PaginatedResult,
  InternshipApplicationResponse,
  PaymentItem,
  SiteUserItem,
  CourseRegistrationItem,
  CertificateItem,
  SiteSettingItem,
  SubmissionAdminItem,
  UnlockRequestAdminItem,
  StudentDoubtItem,
  ContactQueryItem,
} from "@/types";
import { apiRequest, getImageUrl } from "@/lib/api-client";
import { formatINR } from "@/lib/utils";
import { FadeIn } from "@/components/animations/FadeIn";
import AuthGuard from "@/components/AuthGuard";
import BrandedMailerTab from "@/components/admin/BrandedMailerTab";

const apiBase = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api"
).replace(/\/$/, "");

const getResumeUrl = (filename?: string | null) => {
  if (!filename) return "";
  if (filename.startsWith("http://") || filename.startsWith("https://")) return filename;
  return `${apiBase}/applications/resume/${filename}`;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "applications" | "users" | "enrollments" | "payments" | "certificates" | "submissions" | "unlocks" | "doubts" | "contacts" | "mailer"
  >("overview");

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Resume Preview State
  const [previewResume, setPreviewResume] = useState<{ url: string; name: string } | null>(null);

  // Doubt Image Zoom State
  const [expandedDoubtImage, setExpandedDoubtImage] = useState<string | null>(null);

  // Site Settings Feature Toggles State (Courses, Careers)
  const [siteSettings, setSiteSettings] = useState<{ show_courses: boolean; show_careers: boolean }>({
    show_courses: false,
    show_careers: false,
  });
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Submissions State
  const [submissionsList, setSubmissionsList] = useState<SubmissionAdminItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [subSearch, setSubSearch] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState("all");
  const [selectedSub, setSelectedSub] = useState<SubmissionAdminItem | null>(null);
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewUnlocked, setReviewUnlocked] = useState(true);
  const [savingReview, setSavingReview] = useState(false);

  // Unlock Requests State
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequestAdminItem[]>([]);
  const [loadingUnlocks, setLoadingUnlocks] = useState(false);
  const [actioningUnlockId, setActioningUnlockId] = useState<number | null>(null);

  // Student Doubts Helpdesk State
  const [doubtsList, setDoubtsList] = useState<StudentDoubtItem[]>([]);
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [doubtFilter, setDoubtFilter] = useState("all");
  const [replyingDoubt, setReplyingDoubt] = useState<StudentDoubtItem | null>(null);
  const [doubtReplyText, setDoubtReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Contact Queries State
  const [contactsList, setContactsList] = useState<ContactQueryItem[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactFilter, setContactFilter] = useState("all");
  const [contactSearch, setContactSearch] = useState("");
  const [contactPage, setContactPage] = useState(1);
  const [contactTotalPages, setContactTotalPages] = useState(1);
  const [contactTotalCount, setContactTotalCount] = useState(0);
  const [replyingContact, setReplyingContact] = useState<ContactQueryItem | null>(null);
  const [contactReplyText, setContactReplyText] = useState("");
  const [sendingContactReply, setSendingContactReply] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<number | null>(null);
  const [deletingAllContacts, setDeletingAllContacts] = useState(false);

  // Applications Table State
  const [appsData, setAppsData] = useState<PaginatedResult<InternshipApplicationResponse>>({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 1,
    items: [],
  });
  const [appsSearch, setAppsSearch] = useState("");
  const [appsDuration, setAppsDuration] = useState("all");
  const [appsPage, setAppsPage] = useState(1);
  const [loadingApps, setLoadingApps] = useState(false);

  // Selected Application for Detail Modal
  const [selectedApp, setSelectedApp] = useState<InternshipApplicationResponse | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingAppId, setDeletingAppId] = useState<number | null>(null);
  const [deletingAllApps, setDeletingAllApps] = useState(false);

  // Users Table State
  const [usersData, setUsersData] = useState<PaginatedResult<SiteUserItem>>({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 1,
    items: [],
  });
  const [usersSearch, setUsersSearch] = useState("");
  const [usersProvider, setUsersProvider] = useState("all");
  const [usersPage, setUsersPage] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<number, boolean>>({});

  // Course Registrations / Free Enrollments State
  const [registrationsData, setRegistrationsData] = useState<PaginatedResult<CourseRegistrationItem>>({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 1,
    items: [],
  });
  const [regSearch, setRegSearch] = useState("");
  const [regStatus, setRegStatus] = useState("all");
  const [regPage, setRegPage] = useState(1);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [updatingRegId, setUpdatingRegId] = useState<number | null>(null);

  // Payments Table State
  const [paymentsData, setPaymentsData] = useState<PaginatedResult<PaymentItem>>({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 1,
    items: [],
  });
  const [pmtSearch, setPmtSearch] = useState("");
  const [pmtStatus, setPmtStatus] = useState("all");
  const [pmtPage, setPmtPage] = useState(1);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Certificates State
  const [certificatesList, setCertificatesList] = useState<CertificateItem[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [certSearch, setCertSearch] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [certError, setCertError] = useState("");
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);

  const initialCertForm = {
    certificate_id: "",
    student_name: "",
    student_email: "",
    program_title: "Full Stack Web Development Co-Op",
    track_type: "Virtual Internship",
    duration: "3 Months",
    issue_date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    grade: "Distinction (Grade A+)",
    skills_acquired: "Next.js 15, React 19, TypeScript, FastAPI, PostgreSQL",
    instructor_name: "Suraj Kumar, HR & Manager",
  };
  const [newCertForm, setNewCertForm] = useState(initialCertForm);

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000/api"
  ).replace(/\/$/, "");

  useEffect(() => {
    fetchStats();
    fetchSiteSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "applications" || activeTab === "overview") {
      fetchApplications();
    }
    if (activeTab === "users" || activeTab === "overview") {
      fetchUsers();
    }
    if (activeTab === "enrollments" || activeTab === "overview") {
      fetchRegistrations();
    }
    if (activeTab === "payments" || activeTab === "overview") {
      fetchPayments();
    }
    if (activeTab === "certificates" || activeTab === "overview") {
      fetchCertificates();
    }
    if (activeTab === "submissions" || activeTab === "overview") {
      fetchSubmissions();
    }
    if (activeTab === "unlocks" || activeTab === "overview") {
      fetchUnlockRequests();
    }
    if (activeTab === "doubts" || activeTab === "overview") {
      fetchDoubts();
    }
    if (activeTab === "contacts" || activeTab === "overview") {
      fetchContacts();
    }
  }, [
    activeTab,
    appsSearch,
    appsDuration,
    appsPage,
    usersSearch,
    usersProvider,
    usersPage,
    regSearch,
    regStatus,
    regPage,
    pmtSearch,
    pmtStatus,
    pmtPage,
    certSearch,
    subStatusFilter,
    doubtFilter,
    contactFilter,
    contactSearch,
    contactPage,
  ]);

  const fetchStats = async () => {
    try {
      const data = await apiRequest<DashboardStats>("/admin/stats");
      setStats(data);
    } catch (err: unknown) {
      console.error("Failed to fetch admin stats:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (
        errMsg.includes("401") ||
        errMsg.toLowerCase().includes("unauthorized") ||
        errMsg.toLowerCase().includes("could not validate credentials") ||
        errMsg.toLowerCase().includes("token expired")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("admin_email");
        router.push("/admin/login");
      }
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const params = new URLSearchParams({
        page: appsPage.toString(),
        limit: "10",
      });
      if (appsSearch) params.set("q", appsSearch);
      if (appsDuration !== "all") params.set("duration", appsDuration);

      const data = await apiRequest<PaginatedResult<InternshipApplicationResponse>>(
        `/admin/applications?${params.toString()}`
      );
      setAppsData(data && Array.isArray(data.items) ? data : { total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
    } catch (err) {
      console.error(err);
      setAppsData({ total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams({
        page: usersPage.toString(),
        limit: "10",
      });
      if (usersSearch) params.set("q", usersSearch);
      if (usersProvider !== "all") params.set("provider", usersProvider);

      const data = await apiRequest<PaginatedResult<SiteUserItem>>(`/admin/users?${params.toString()}`);
      setUsersData(data && Array.isArray(data.items) ? data : { total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
    } catch (err) {
      console.error(err);
      setUsersData({ total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const params = new URLSearchParams({
        page: pmtPage.toString(),
        limit: "10",
      });
      if (pmtSearch) params.set("q", pmtSearch);
      if (pmtStatus !== "all") params.set("status", pmtStatus);

      const data = await apiRequest<PaginatedResult<PaymentItem>>(`/admin/payments?${params.toString()}`);
      setPaymentsData(data && Array.isArray(data.items) ? data : { total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
    } catch (err) {
      console.error(err);
      setPaymentsData({ total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchRegistrations = async () => {
    setLoadingRegs(true);
    try {
      const params = new URLSearchParams({
        page: regPage.toString(),
        limit: "10",
      });
      if (regSearch) params.set("q", regSearch);
      if (regStatus !== "all") params.set("status", regStatus);

      const data = await apiRequest<PaginatedResult<CourseRegistrationItem>>(`/admin/registrations?${params.toString()}`);
      setRegistrationsData(data && Array.isArray(data.items) ? data : { total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
    } catch (err) {
      console.error(err);
      setRegistrationsData({ total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleUpdateRegStatus = async (regId: number, newStatus: string) => {
    setUpdatingRegId(regId);
    try {
      await apiRequest(`/admin/registrations/${regId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      fetchRegistrations();
      fetchStats();
    } catch (err) {
      console.error("Failed to update registration status", err);
    } finally {
      setUpdatingRegId(null);
    }
  };

  const handleUpdateAppStatus = async (appId: number, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const updated = await apiRequest<InternshipApplicationResponse>(`/admin/applications/${appId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setSelectedApp(updated);
      // Update in appsData list
      setAppsData((prev) => ({
        ...prev,
        items: (prev?.items || []).map((item) => (item.id === appId ? { ...item, status: newStatus } : item)),
      }));
      fetchStats();
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteApp = async (appId: number, studentName?: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete the application for "${studentName || `ID #${appId}`}" from the database?\n\nThis will also remove any related submissions, unlock requests, and doubts.`
      )
    ) {
      return;
    }
    setDeletingAppId(appId);
    try {
      await apiRequest(`/admin/applications/${appId}`, {
        method: "DELETE",
      });
      if (selectedApp?.id === appId) {
        setSelectedApp(null);
      }
      setAppsData((prev) => ({
        ...prev,
        total: Math.max(0, (prev?.total || 1) - 1),
        items: (prev?.items || []).filter((item) => item.id !== appId),
      }));
      fetchStats();
    } catch (err) {
      console.error("Failed to delete application", err);
      alert("Failed to delete application. Please try again.");
    } finally {
      setDeletingAppId(null);
    }
  };

  const handleDeleteAllApps = async () => {
    const confirmation = prompt(
      "⚠️ DANGER: Type 'DELETE ALL' to permanently erase ALL internship applications and student submissions from the database:"
    );
    if (confirmation !== "DELETE ALL") {
      if (confirmation !== null) alert("Operation cancelled. Confirmation text did not match.");
      return;
    }
    setDeletingAllApps(true);
    try {
      await apiRequest("/admin/applications/all", {
        method: "DELETE",
      });
      setSelectedApp(null);
      setAppsData({ total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
      fetchStats();
      alert("All internship applications have been successfully deleted from the database.");
    } catch (err) {
      console.error("Failed to delete all applications", err);
      alert("Failed to delete all applications. Please try again.");
    } finally {
      setDeletingAllApps(false);
    }
  };

  const fetchCertificates = async () => {
    setLoadingCerts(true);
    try {
      let endpoint = "/certificates";
      if (certSearch) {
        endpoint += `?search=${encodeURIComponent(certSearch)}`;
      }
      const data = await apiRequest<CertificateItem[]>(endpoint);
      setCertificatesList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load certificates", err);
      setCertificatesList([]);
    } finally {
      setLoadingCerts(false);
    }
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertForm.student_name.trim() || !newCertForm.student_email.trim() || !newCertForm.program_title.trim()) {
      setCertError("Please fill in recipient name, email, and program title.");
      return;
    }
    setIssuing(true);
    setCertError("");
    try {
      const now = new Date();
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const mmm = months[now.getMonth()];
      const yy = String(now.getFullYear()).slice(-2);
      const yyyy = String(now.getFullYear());
      const randSeq = String(Math.floor(1 + Math.random() * 9999)).padStart(4, "0");
      const autoId = `IVT/${mmm}${yy}/${yyyy}/${randSeq}`;
      const generatedId = newCertForm.certificate_id.trim().toUpperCase() || autoId;

      const payload = {
        certificate_id: generatedId,
        student_name: newCertForm.student_name.trim(),
        student_email: newCertForm.student_email.trim().toLowerCase(),
        program_title: newCertForm.program_title.trim(),
        track_type: newCertForm.track_type,
        duration: newCertForm.duration.trim(),
        issue_date: newCertForm.issue_date.trim() || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        grade: newCertForm.grade.trim() || "Distinction (Grade A+)",
        skills_acquired: newCertForm.skills_acquired.split(",").map((s) => s.trim()).filter(Boolean),
        instructor_name: newCertForm.instructor_name.trim() || "Suraj Kumar, HR & Manager",
      };

      await apiRequest<CertificateItem>("/certificates", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setShowIssueModal(false);
      setNewCertForm(initialCertForm);
      fetchCertificates();
    } catch (err: any) {
      setCertError(err.message || "Failed to issue certificate");
    } finally {
      setIssuing(false);
    }
  };

  const handleDeleteCertificate = async (certId: string) => {
    if (!confirm(`Are you sure you want to delete and revoke Certificate ${certId}?`)) return;
    setDeletingCertId(certId);
    try {
      await apiRequest(`/certificates/${encodeURIComponent(certId)}`, {
        method: "DELETE",
      });
      setCertificatesList((prev) => (Array.isArray(prev) ? prev : []).filter((c) => c.certificate_id !== certId));
    } catch (err) {
      console.error("Failed to delete certificate", err);
    } finally {
      setDeletingCertId(null);
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const data = await apiRequest<{ show_courses?: boolean | string; show_careers?: boolean | string }>("/admin/settings");
      setSiteSettings({
        show_courses: data?.show_courses === true || data?.show_courses === "true",
        show_careers: data?.show_careers === true || data?.show_careers === "true",
      });
    } catch (err) {
      console.error("Failed to load site settings", err);
    }
  };

  const handleToggleSetting = async (key: "show_courses" | "show_careers") => {
    const nextVal = !siteSettings[key];
    setUpdatingSettings(true);
    try {
      const updated = await apiRequest<{ show_courses?: boolean | string; show_careers?: boolean | string }>("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ [key]: nextVal }),
      });
      setSiteSettings({
        show_courses: updated?.show_courses === true || updated?.show_courses === "true",
        show_careers: updated?.show_careers === true || updated?.show_careers === "true",
      });
      window.dispatchEvent(new Event("site-settings-changed"));
    } catch (err) {
      console.error(`Failed to toggle ${key}:`, err);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const params = new URLSearchParams();
      if (subStatusFilter !== "all") params.set("status", subStatusFilter);
      if (subSearch) params.set("search", subSearch);
      const data = await apiRequest<SubmissionAdminItem[]>(`/admin/submissions?${params.toString()}`);
      setSubmissionsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch submissions", err);
      setSubmissionsList([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleOpenReviewModal = (sub: SubmissionAdminItem) => {
    setSelectedSub(sub);
    setReviewStatus(sub.status || "approved");
    setReviewFeedback(sub.admin_feedback || "");
    setReviewUnlocked(sub.is_unlocked ?? true);
  };

  const handleSaveReview = async () => {
    if (!selectedSub) return;
    setSavingReview(true);
    try {
      const updated = await apiRequest<SubmissionAdminItem>(`/admin/submissions/${selectedSub.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: reviewStatus,
          admin_feedback: reviewFeedback,
          is_unlocked: reviewUnlocked,
        }),
      });
      setSubmissionsList((prev) => (Array.isArray(prev) ? prev : []).map((s) => (s.id === selectedSub.id ? { ...s, ...updated } : s)));
      setSelectedSub(null);
    } catch (err) {
      console.error("Failed to save review", err);
    } finally {
      setSavingReview(false);
    }
  };

  const fetchUnlockRequests = async () => {
    setLoadingUnlocks(true);
    try {
      const data = await apiRequest<UnlockRequestAdminItem[]>("/admin/unlock-requests");
      setUnlockRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load unlock requests", err);
      setUnlockRequests([]);
    } finally {
      setLoadingUnlocks(false);
    }
  };

  const handleUnlockAction = async (id: number, action: "approve" | "reject") => {
    setActioningUnlockId(id);
    try {
      await apiRequest(`/admin/unlock-requests/${id}/action`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      setUnlockRequests((prev) =>
        (Array.isArray(prev) ? prev : []).map((r) => (r.id === id ? { ...r, status: action === "approve" ? "approved" : "rejected" } : r))
      );
      // Refresh submissions if an unlock occurred
      if (action === "approve") {
        fetchSubmissions();
      }
    } catch (err) {
      console.error(`Failed to ${action} unlock request`, err);
    } finally {
      setActioningUnlockId(null);
    }
  };

  const fetchDoubts = async () => {
    setLoadingDoubts(true);
    try {
      const params = new URLSearchParams();
      if (doubtFilter !== "all") params.set("status", doubtFilter);
      const data = await apiRequest<StudentDoubtItem[]>(`/admin/doubts?${params.toString()}`);
      setDoubtsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load doubts", err);
      setDoubtsList([]);
    } finally {
      setLoadingDoubts(false);
    }
  };

  const handleSendDoubtReply = async () => {
    if (!replyingDoubt || !doubtReplyText.trim()) return;
    setSendingReply(true);
    try {
      const updated = await apiRequest<StudentDoubtItem>(`/admin/doubts/${replyingDoubt.id}/reply`, {
        method: "POST",
        body: JSON.stringify({
          admin_reply: doubtReplyText.trim(),
        }),
      });
      setDoubtsList((prev) => (Array.isArray(prev) ? prev : []).map((d) => (d.id === replyingDoubt.id ? { ...d, admin_reply: doubtReplyText.trim(), status: "answered" } : d)));
      setReplyingDoubt(null);
      setDoubtReplyText("");
    } catch (err) {
      console.error("Failed to send doubt reply", err);
      alert("Failed to send reply. Please check your connection.");
    } finally {
      setSendingReply(false);
    }
  };

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const params = new URLSearchParams();
      if (contactFilter !== "all") params.set("status", contactFilter);
      if (contactSearch.trim()) params.set("q", contactSearch.trim());
      params.set("page", String(contactPage));
      params.set("limit", "15");
      const data = await apiRequest<{
        total: number;
        page: number;
        limit: number;
        total_pages: number;
        items: ContactQueryItem[];
      }>(`/admin/contacts?${params.toString()}`);
      if (data && Array.isArray(data.items)) {
        setContactsList(data.items);
        setContactTotalPages(data.total_pages || 1);
        setContactTotalCount(data.total || 0);
      } else {
        setContactsList([]);
      }
    } catch (err) {
      console.error("Failed to load contact queries", err);
      setContactsList([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleUpdateContactStatus = async (id: number, newStatus: string) => {
    try {
      await apiRequest(`/admin/contacts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setContactsList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      fetchStats();
    } catch (err) {
      console.error("Failed to update contact status", err);
    }
  };

  const handleSendContactReply = async () => {
    if (!replyingContact || !contactReplyText.trim()) return;
    setSendingContactReply(true);
    try {
      await apiRequest(`/admin/contacts/${replyingContact.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ admin_reply: contactReplyText.trim() }),
      });
      setContactsList((prev) =>
        prev.map((c) =>
          c.id === replyingContact.id
            ? {
                ...c,
                status: "replied",
                admin_reply: contactReplyText.trim(),
                replied_at: new Date().toISOString(),
              }
            : c
        )
      );
      setReplyingContact(null);
      setContactReplyText("");
      fetchStats();
    } catch (err) {
      console.error("Failed to send contact reply", err);
      alert("Failed to send reply email. Please check your network connection.");
    } finally {
      setSendingContactReply(false);
    }
  };

  const handleDeleteContact = async (id: number, senderName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the inquiry from "${senderName}"?`)) return;
    setDeletingContactId(id);
    try {
      await apiRequest(`/admin/contacts/${id}`, { method: "DELETE" });
      setContactsList((prev) => prev.filter((c) => c.id !== id));
      setContactTotalCount((prev) => Math.max(0, prev - 1));
      fetchStats();
    } catch (err) {
      console.error("Failed to delete contact inquiry", err);
      alert("Failed to delete contact inquiry.");
    } finally {
      setDeletingContactId(null);
    }
  };

  const handleDeleteAllContacts = async () => {
    const filterText = contactFilter !== "all" ? ` with status "${contactFilter}"` : " all";
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE${filterText} contact queries from the database? This action cannot be undone.`)) return;
    setDeletingAllContacts(true);
    try {
      const params = contactFilter !== "all" ? `?status=${contactFilter}` : "";
      await apiRequest(`/admin/contacts/all${params}`, { method: "DELETE" });
      fetchContacts();
      fetchStats();
    } catch (err) {
      console.error("Failed to delete all contact queries", err);
      alert("Failed to delete contact queries.");
    } finally {
      setDeletingAllContacts(false);
    }
  };

  const handleExportExcel = (type: "applications" | "payments") => {
    const token = localStorage.getItem("token");
    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
    let exportUrl = `${baseUrl}/admin/export/${type}?token=${token}`;
    if (type === "applications" && appsDuration !== "all") {
      exportUrl += `&duration=${encodeURIComponent(appsDuration)}`;
    }
    if (type === "payments" && pmtStatus !== "all") {
      exportUrl += `&status=${encodeURIComponent(pmtStatus)}`;
    }

    fetch(exportUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `internvision_${type}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error("Export download failed", err));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin_email");
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("user-auth-change"));
    router.push("/admin/login");
  };

  const pendingUnlocksCount = (Array.isArray(unlockRequests) ? unlockRequests : []).filter((u) => u?.status === "pending").length;
  const openDoubtsCount = (Array.isArray(doubtsList) ? doubtsList : []).filter((d) => d?.status === "open").length;
  const newContactsCount = stats?.new_contacts !== undefined ? stats.new_contacts : (Array.isArray(contactsList) ? contactsList : []).filter((c) => c?.status === "new").length;
  const totalContactsCount = stats?.total_contacts !== undefined ? stats.total_contacts : contactTotalCount;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-ink-50 font-sans selection:bg-brand-500/30 pb-20">
        {/* TOP BAR */}
        <header className="border-b border-ink-800 bg-ink-950/80 sticky top-0 z-40 backdrop-blur-xl">
          <div className="max-w-[90rem] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white uppercase">
                InternVision <span className="text-brand-400">Admin Control</span>
              </span>
            </div>

            {/* Feature Toggles: Courses & Careers */}
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                disabled={updatingSettings}
                onClick={() => handleToggleSetting("show_courses")}
                className={`px-3 py-1.5 rounded text-xs font-semibold border flex items-center gap-1.5 transition ${
                  siteSettings.show_courses
                    ? "bg-brand-500/10 text-brand-400 border-brand-500/30 hover:bg-brand-500/20"
                    : "bg-ink-900 text-ink-400 border-ink-800 hover:text-ink-200"
                }`}
                title="Toggle Course Catalog visibility on frontend"
              >
                {siteSettings.show_courses ? (
                  <ToggleRight className="w-4 h-4 text-brand-400" />
                ) : (
                  <ToggleLeft className="w-4 h-4 text-ink-500" />
                )}
                <span>Courses: {siteSettings.show_courses ? "ON" : "OFF"}</span>
              </button>

              <button
                type="button"
                disabled={updatingSettings}
                onClick={() => handleToggleSetting("show_careers")}
                className={`px-3 py-1.5 rounded text-xs font-semibold border flex items-center gap-1.5 transition ${
                  siteSettings.show_careers
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                    : "bg-ink-900 text-ink-400 border-ink-800 hover:text-ink-200"
                }`}
                title="Toggle Careers Page visibility on frontend"
              >
                {siteSettings.show_careers ? (
                  <ToggleRight className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-4 h-4 text-ink-500" />
                )}
                <span>Careers: {siteSettings.show_careers ? "ON" : "OFF"}</span>
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-medium text-ink-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 bg-ink-900 border border-ink-800 rounded hover:border-ink-700"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </header>

        <div className="max-w-[90rem] mx-auto px-6 py-8 space-y-8">
          {/* STATS CARDS */}
          <FadeIn delay={0.1} direction="up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:bg-ink-900/50 transition-colors">
                <div className="flex items-center justify-between text-ink-400 mb-3">
                  <span className="text-xs font-medium tracking-wide">Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-semibold text-white">
                  {stats ? formatINR(stats.total_revenue_inr) : "—"}
                </div>
              </div>

              <div className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:bg-ink-900/50 transition-colors">
                <div className="flex items-center justify-between text-ink-400 mb-3">
                  <span className="text-xs font-medium tracking-wide">Registered Users</span>
                  <UserCheck className="w-4 h-4 text-brand-400" />
                </div>
                <div className="text-2xl font-semibold text-white">
                  {stats?.total_users !== undefined ? stats.total_users : "—"}
                </div>
              </div>

              <div className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:bg-ink-900/50 transition-colors">
                <div className="flex items-center justify-between text-ink-400 mb-3">
                  <span className="text-xs font-medium tracking-wide">Intern Applications</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-semibold text-white">
                  {stats ? stats.total_applications : "—"}
                </div>
              </div>

              <div className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:bg-ink-900/50 transition-colors">
                <div className="flex items-center justify-between text-ink-400 mb-3">
                  <span className="text-xs font-medium tracking-wide">Course Registrations</span>
                  <BookOpen className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-semibold text-white">
                  {stats ? stats.total_registrations : "—"}
                </div>
              </div>

              <div className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:bg-ink-900/50 transition-colors">
                <div className="flex items-center justify-between text-ink-400 mb-3">
                  <span className="text-xs font-medium tracking-wide">Completed Tx</span>
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-semibold text-white">
                  {stats ? stats.successful_payments : "—"}
                </div>
              </div>

              <div
                onClick={() => setActiveTab("contacts")}
                className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:border-cyan-500/40 hover:bg-ink-900/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-ink-400 mb-3">
                  <span className="text-xs font-medium tracking-wide group-hover:text-cyan-400 transition-colors">Contact Inquiries</span>
                  <Mail className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-semibold text-white">
                    {totalContactsCount}
                  </div>
                  {newContactsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                      {newContactsCount} NEW
                    </span>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* NAVIGATION TABS */}
          <div className="flex items-center gap-6 border-b border-ink-800 overflow-x-auto pb-0.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap relative ${
                activeTab === "overview" ? "text-white" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              Overview
              {activeTab === "overview" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === "applications" ? "text-white" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              Applicants
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-ink-800 text-ink-300">
                {stats?.total_applications || 0}
              </span>
              {activeTab === "applications" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === "submissions" ? "text-white" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
              Submissions
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                {submissionsList.length}
              </span>
              {activeTab === "submissions" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("unlocks")}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === "unlocks" ? "text-white" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              <Unlock className="w-3.5 h-3.5 text-amber-400" />
              Unlock Requests
              {pendingUnlocksCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                  {pendingUnlocksCount} PENDING
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-ink-800 text-ink-400">
                  {unlockRequests.length}
                </span>
              )}
              {activeTab === "unlocks" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("doubts")}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === "doubts" ? "text-white" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
              Doubts Helpdesk
              {openDoubtsCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30 animate-pulse">
                  {openDoubtsCount} OPEN
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-ink-800 text-ink-400">
                  {doubtsList.length}
                </span>
              )}
              {activeTab === "doubts" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === "contacts" ? "text-white" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              Contact Queries
              {newContactsCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                  {newContactsCount} NEW
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-ink-800 text-ink-400">
                  {totalContactsCount}
                </span>
              )}
              {activeTab === "contacts" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === "users" ? "text-white" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              User Accounts
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-brand-600/20 text-brand-400 border border-brand-500/30">
                {stats?.total_users || 0}
              </span>
              {activeTab === "users" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("enrollments")}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === "enrollments" ? "text-white" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              Course Enrollments
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-purple-600/20 text-purple-400 border border-purple-500/30">
                {stats?.total_registrations || 0}
              </span>
              {activeTab === "enrollments" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === "payments" ? "text-white" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              Payments
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-ink-800 text-ink-300">
                {stats?.total_payments || 0}
              </span>
              {activeTab === "payments" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("certificates")}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === "certificates" ? "text-white" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Certificates
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                {certificatesList.length}
              </span>
              {activeTab === "certificates" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("mailer")}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap relative ${
                activeTab === "mailer" ? "text-white" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-brand-400" />
              Branded Mailer
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                SMTP
              </span>
              {activeTab === "mailer" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-full" />}
            </button>
          </div>

          {/* ─────────────────── USERS SECTION (REQUIREMENT 2) ─────────────────── */}
          {(activeTab === "users" || activeTab === "overview") && (
            <FadeIn delay={0.2} direction="up">
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-brand-400" /> Registered User Accounts
                    </h2>
                    <p className="text-xs text-ink-400 mt-0.5">
                      Public users who logged in via Google OAuth or verified email before applying.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={usersSearch}
                        onChange={(e) => {
                          setUsersSearch(e.target.value);
                          setUsersPage(1);
                        }}
                        className="w-full bg-ink-950 border border-ink-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                    <select
                      value={usersProvider}
                      onChange={(e) => {
                        setUsersProvider(e.target.value);
                        setUsersPage(1);
                      }}
                      className="bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
                    >
                      <option value="all">All Providers</option>
                      <option value="google">Google Sign-In</option>
                      <option value="email">Email Account</option>
                    </select>
                  </div>
                </div>

                <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-950/40 shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-ink-900/60 text-ink-400 font-medium border-b border-ink-800 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3.5 font-medium">User Profile</th>
                          <th className="px-5 py-3.5 font-medium">Auth Provider</th>
                          <th className="px-5 py-3.5 font-medium">Password (Admin View)</th>
                          <th className="px-5 py-3.5 font-medium">Applications</th>
                          <th className="px-5 py-3.5 font-medium">Registered Date</th>
                          <th className="px-5 py-3.5 font-medium">Last Login</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-800/50">
                        {loadingUsers ? (
                          <tr>
                            <td colSpan={6} className="text-center py-12">
                              <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-400" />
                            </td>
                          </tr>
                        ) : usersData.items.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-ink-500 text-sm">
                              No registered user accounts found.
                            </td>
                          </tr>
                        ) : (
                          usersData.items.map((u) => (
                            <tr key={u.id} className="hover:bg-ink-900/40 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-400 font-bold flex items-center justify-center text-xs">
                                    {u.full_name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-white">{u.full_name}</div>
                                    <div className="text-xs text-ink-400">{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider border ${
                                    u.provider === "google"
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                      : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                  }`}
                                >
                                  {u.provider === "google" ? "✦ Google OAuth" : "Email & Pass"}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-ink-900 border border-ink-700/80 rounded font-mono text-xs text-white">
                                  <Key className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                                  <span>
                                    {revealedPasswords[u.id] ? (u.password || "—") : (u.password ? "••••••••" : "—")}
                                  </span>
                                  {u.password && u.password !== "—" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setRevealedPasswords((prev) => ({
                                          ...prev,
                                          [u.id]: !prev[u.id],
                                        }))
                                      }
                                      className="text-ink-400 hover:text-white transition ml-1"
                                      title={revealedPasswords[u.id] ? "Hide password" : "Show password"}
                                    >
                                      {revealedPasswords[u.id] ? (
                                        <EyeOff className="w-3.5 h-3.5" />
                                      ) : (
                                        <Eye className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span className="px-2.5 py-1 rounded-full bg-ink-900 border border-ink-800 text-xs font-semibold text-white">
                                  {u.applications_count} Submitted
                                </span>
                              </td>
                              <td className="px-5 py-4 text-xs text-ink-400">
                                {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                              </td>
                              <td className="px-5 py-4 text-xs text-ink-400">
                                {u.last_login ? new Date(u.last_login).toLocaleString() : "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-ink-800 bg-ink-900/30">
                    <span className="text-xs text-ink-400">
                      Showing page {usersData.page} of {usersData.total_pages} ({usersData.total} users)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={usersPage <= 1}
                        onClick={() => setUsersPage((p) => p - 1)}
                        className="p-1.5 rounded bg-ink-900 border border-ink-800 text-ink-300 hover:text-white disabled:opacity-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={usersPage >= usersData.total_pages}
                        onClick={() => setUsersPage((p) => p + 1)}
                        className="p-1.5 rounded bg-ink-900 border border-ink-800 text-ink-300 hover:text-white disabled:opacity-50 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* ─────────────────── APPLICATIONS SECTION (REQUIREMENT 3) ─────────────────── */}
          {(activeTab === "applications" || activeTab === "overview") && (
            <FadeIn delay={0.25} direction="up">
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-brand-400" /> Internship Applications
                    </h2>
                    <p className="text-xs text-ink-400 mt-0.5">
                      Review applicant resumes, professional descriptions, academic profiles, and track statuses.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-400" />
                      <input
                        type="text"
                        placeholder="Search applicants..."
                        value={appsSearch}
                        onChange={(e) => {
                          setAppsSearch(e.target.value);
                          setAppsPage(1);
                        }}
                        className="w-full bg-ink-950 border border-ink-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                    <select
                      value={appsDuration}
                      onChange={(e) => {
                        setAppsDuration(e.target.value);
                        setAppsPage(1);
                      }}
                      className="bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
                    >
                      <option value="all">All Durations</option>
                      <option value="1 Month">1 Month</option>
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                    </select>
                    <button
                      onClick={() => handleExportExcel("applications")}
                      className="px-3 py-1.5 text-sm font-medium bg-ink-900 border border-ink-800 hover:bg-ink-800 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Excel
                    </button>
                    <button
                      onClick={handleDeleteAllApps}
                      disabled={deletingAllApps}
                      className="px-3 py-1.5 text-sm font-medium bg-red-950/60 border border-red-800/70 hover:bg-red-900 text-red-300 hover:text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      title="Delete all internship applications from database"
                    >
                      {deletingAllApps ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      )}
                      Delete All
                    </button>
                  </div>
                </div>

                <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-950/40 shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-ink-900/60 text-ink-400 font-medium border-b border-ink-800 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3.5 font-medium">Applicant</th>
                          <th className="px-5 py-3.5 font-medium">College & Degree</th>
                          <th className="px-5 py-3.5 font-medium">Track / Skills</th>
                          <th className="px-5 py-3.5 font-medium">Duration</th>
                          <th className="px-5 py-3.5 font-medium">Resume</th>
                          <th className="px-5 py-3.5 font-medium">Status</th>
                          <th className="px-5 py-3.5 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-800/50">
                        {loadingApps ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12">
                              <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-400" />
                            </td>
                          </tr>
                        ) : appsData.items.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-ink-500 text-sm">
                              No internship applications found.
                            </td>
                          </tr>
                        ) : (
                          appsData.items.map((app) => (
                            <tr key={app.id} className="hover:bg-ink-900/40 transition-colors">
                              <td className="px-5 py-4">
                                <div className="font-semibold text-white">{app.full_name}</div>
                                <div className="text-xs text-ink-400">{app.email}</div>
                                {app.phone && <div className="text-[11px] text-ink-500">{app.phone}</div>}
                              </td>
                              <td className="px-5 py-4">
                                <div className="text-ink-200 font-medium">{app.college}</div>
                                <div className="text-xs text-ink-400">
                                  {app.degree} · {app.year_of_study}
                                </div>
                              </td>
                              <td className="px-5 py-4 max-w-[220px]">
                                {app.role_preference && (
                                  <div className="text-xs font-semibold text-brand-400 truncate mb-1">
                                    {app.role_preference}
                                  </div>
                                )}
                                <div className="text-ink-400 text-xs truncate">
                                  {app.skills?.join(", ") || "None"}
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span className="px-2.5 py-1 rounded bg-ink-900 text-ink-300 text-xs font-medium border border-ink-800">
                                  {app.duration}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                {app.resume_filename ? (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => setPreviewResume({ url: getResumeUrl(app.resume_filename), name: app.full_name })}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/40 text-brand-300 rounded text-xs font-semibold transition"
                                      title="Preview Resume in Modal"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                    <a
                                      href={getResumeUrl(app.resume_filename)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-300 hover:text-white rounded text-xs font-medium transition"
                                      title="Open in new tab"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-xs text-ink-500 italic">No resume</span>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    app.status === "accepted"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                      : app.status === "rejected"
                                      ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setSelectedApp(app)}
                                    className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-white rounded text-xs font-semibold border border-ink-700 flex items-center gap-1.5 transition"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> Review
                                  </button>
                                  <button
                                    disabled={deletingAppId === app.id}
                                    onClick={() => handleDeleteApp(app.id, app.full_name)}
                                    className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-800/50 rounded transition disabled:opacity-50"
                                    title={`Delete application for ${app.full_name}`}
                                  >
                                    {deletingAppId === app.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-ink-800 bg-ink-900/30">
                    <span className="text-xs text-ink-400">
                      Showing page {appsData.page} of {appsData.total_pages} ({appsData.total} applications)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={appsPage <= 1}
                        onClick={() => setAppsPage((p) => p - 1)}
                        className="p-1.5 rounded bg-ink-900 border border-ink-800 text-ink-300 hover:text-white disabled:opacity-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={appsPage >= appsData.total_pages}
                        onClick={() => setAppsPage((p) => p + 1)}
                        className="p-1.5 rounded bg-ink-900 border border-ink-800 text-ink-300 hover:text-white disabled:opacity-50 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* ─────────────────── PAYMENTS SECTION ─────────────────── */}
          {(activeTab === "payments" || activeTab === "overview") && (
            <FadeIn delay={0.3} direction="up">
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Transactions</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-400" />
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={pmtSearch}
                        onChange={(e) => {
                          setPmtSearch(e.target.value);
                          setPmtPage(1);
                        }}
                        className="w-full bg-ink-950 border border-ink-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-ink-600 transition-colors"
                      />
                    </div>
                    <select
                      value={pmtStatus}
                      onChange={(e) => {
                        setPmtStatus(e.target.value);
                        setPmtPage(1);
                      }}
                      className="bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-ink-600 transition-colors cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="captured">Captured</option>
                      <option value="created">Created</option>
                      <option value="failed">Failed</option>
                    </select>
                    <button
                      onClick={() => handleExportExcel("payments")}
                      className="px-3 py-1.5 text-sm font-medium bg-ink-900 border border-ink-800 hover:bg-ink-800 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Export
                    </button>
                  </div>
                </div>

                <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-950/30">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-ink-900/50 text-ink-400 font-medium border-b border-ink-800">
                        <tr>
                          <th className="px-5 py-3 font-medium">Order ID</th>
                          <th className="px-5 py-3 font-medium">Student</th>
                          <th className="px-5 py-3 font-medium">Amount</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                          <th className="px-5 py-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-800/50">
                        {loadingPayments ? (
                          <tr>
                            <td colSpan={5} className="text-center py-12">
                              <Loader2 className="w-5 h-5 animate-spin mx-auto text-ink-500" />
                            </td>
                          </tr>
                        ) : paymentsData.items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-ink-500 text-sm">
                              No transactions found.
                            </td>
                          </tr>
                        ) : (
                          paymentsData.items.map((pmt) => (
                            <tr key={pmt.id} className="hover:bg-ink-900/30 transition-colors">
                              <td className="px-5 py-4 font-mono text-xs text-ink-400">{pmt.order_id}</td>
                              <td className="px-5 py-4">
                                <span className="text-ink-200">{pmt.student_email}</span>
                              </td>
                              <td className="px-5 py-4 font-medium text-white">{formatINR(pmt.amount_inr)}</td>
                              <td className="px-5 py-4">
                                <span className="text-xs font-medium">
                                  {pmt.status === "captured" ? (
                                    <span className="text-emerald-400 flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Captured
                                    </span>
                                  ) : pmt.status === "failed" ? (
                                    <span className="text-red-400 flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Failed
                                    </span>
                                  ) : (
                                    <span className="text-yellow-400 flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Pending
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-ink-400 text-xs">
                                {new Date(pmt.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Payments Pagination */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-ink-800 bg-ink-900/30">
                    <span className="text-xs text-ink-400">
                      Showing page {paymentsData.page} of {paymentsData.total_pages}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={pmtPage <= 1}
                        onClick={() => setPmtPage((p) => p - 1)}
                        className="p-1.5 rounded bg-ink-900 border border-ink-800 text-ink-300 hover:text-white disabled:opacity-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={pmtPage >= paymentsData.total_pages}
                        onClick={() => setPmtPage((p) => p + 1)}
                        className="p-1.5 rounded bg-ink-900 border border-ink-800 text-ink-300 hover:text-white disabled:opacity-50 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* ─────────────────── COURSE ENROLLMENTS SECTION ─────────────────── */}
          {(activeTab === "enrollments" || activeTab === "overview") && (
            <FadeIn delay={0.25} direction="up">
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-400" /> Course Enrollment Requests
                    </h2>
                    <p className="text-xs text-ink-400 mt-0.5">
                      Review free bootcamp applications. Approving an enrollment automatically dispatches the acceptance email to the candidate.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-400" />
                      <input
                        type="text"
                        placeholder="Search student or course..."
                        value={regSearch}
                        onChange={(e) => {
                          setRegSearch(e.target.value);
                          setRegPage(1);
                        }}
                        className="w-full bg-ink-950 border border-ink-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <select
                      value={regStatus}
                      onChange={(e) => {
                        setRegStatus(e.target.value);
                        setRegPage(1);
                      }}
                      className="bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending Review</option>
                      <option value="accepted">Accepted / Enrolled</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-950/40 shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-ink-900/60 text-ink-400 font-medium border-b border-ink-800 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3.5 font-medium">Candidate</th>
                          <th className="px-5 py-3.5 font-medium">Applied Bootcamp</th>
                          <th className="px-5 py-3.5 font-medium">Phone (WhatsApp)</th>
                          <th className="px-5 py-3.5 font-medium">Status</th>
                          <th className="px-5 py-3.5 font-medium">Requested On</th>
                          <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-800/50">
                        {loadingRegs ? (
                          <tr>
                            <td colSpan={6} className="text-center py-12">
                              <Loader2 className="w-5 h-5 animate-spin mx-auto text-purple-400" />
                            </td>
                          </tr>
                        ) : registrationsData.items.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-ink-500 text-sm">
                              No course enrollment requests found.
                            </td>
                          </tr>
                        ) : (
                          registrationsData.items.map((reg) => (
                            <tr key={reg.id} className="hover:bg-ink-900/30 transition-colors">
                              <td className="px-5 py-4">
                                <div className="font-medium text-white">{reg.student_name}</div>
                                <div className="text-xs text-ink-400 font-mono">{reg.student_email}</div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="font-medium text-brand-300">{reg.course_title || `Course #${reg.course_id}`}</div>
                                <div className="text-[11px] text-emerald-400">✦ 100% Free Scholarship</div>
                              </td>
                              <td className="px-5 py-4 text-ink-300 text-xs">{reg.student_phone}</td>
                              <td className="px-5 py-4">
                                {reg.status === "accepted" ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled & Accepted
                                  </span>
                                ) : reg.status === "rejected" ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                                    <X className="w-3.5 h-3.5" /> Rejected
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20">
                                    <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending Review
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-ink-400 text-xs">
                                {reg.created_at ? new Date(reg.created_at).toLocaleDateString() : "—"}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {reg.status !== "accepted" && (
                                    <button
                                      disabled={updatingRegId === reg.id}
                                      onClick={() => handleUpdateRegStatus(reg.id, "accepted")}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition flex items-center gap-1 disabled:opacity-50 shadow-sm"
                                      title="Accept candidate and send official onboarding email"
                                    >
                                      {updatingRegId === reg.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="w-3 h-3" />
                                      )}
                                      Approve & Send Email
                                    </button>
                                  )}
                                  {reg.status !== "rejected" && (
                                    <button
                                      disabled={updatingRegId === reg.id}
                                      onClick={() => handleUpdateRegStatus(reg.id, "rejected")}
                                      className="px-2.5 py-1.5 bg-ink-900 hover:bg-red-600/30 text-ink-400 hover:text-red-400 border border-ink-800 rounded text-xs font-medium transition disabled:opacity-50"
                                      title="Reject request"
                                    >
                                      Reject
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-ink-800 bg-ink-900/30">
                    <span className="text-xs text-ink-400">
                      Showing {registrationsData.page} of {registrationsData.total_pages}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={regPage <= 1}
                        onClick={() => setRegPage((p) => p - 1)}
                        className="p-1.5 rounded bg-ink-900 border border-ink-800 text-ink-300 hover:text-white disabled:opacity-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={regPage >= registrationsData.total_pages}
                        onClick={() => setRegPage((p) => p + 1)}
                        className="p-1.5 rounded bg-ink-900 border border-ink-800 text-ink-300 hover:text-white disabled:opacity-50 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* ─────────────────── CERTIFICATES MANAGEMENT SECTION ─────────────────── */}
          {(activeTab === "certificates" || activeTab === "overview") && (
            <FadeIn delay={0.3} direction="up">
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-400" /> Certificate Registry & Verification
                    </h2>
                    <p className="text-xs text-ink-400 mt-0.5">
                      Issue and manage official digital certificates signed by{" "}
                      <strong className="text-white">Suraj Kumar, HR & Manager</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-400" />
                      <input
                        type="text"
                        placeholder="Search certificate or student..."
                        value={certSearch}
                        onChange={(e) => setCertSearch(e.target.value)}
                        className="w-full bg-ink-950 border border-ink-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <button
                      onClick={() => setShowIssueModal(true)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 transition shadow-sm whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" /> Issue Certificate
                    </button>
                  </div>
                </div>

                <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-950/30">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-ink-900/50 text-ink-400 font-medium border-b border-ink-800">
                        <tr>
                          <th className="px-5 py-3 font-medium">Certificate ID</th>
                          <th className="px-5 py-3 font-medium">Recipient</th>
                          <th className="px-5 py-3 font-medium">Program & Track</th>
                          <th className="px-5 py-3 font-medium">Duration & Date</th>
                          <th className="px-5 py-3 font-medium">Grade / Honors</th>
                          <th className="px-5 py-3 font-medium">Authority</th>
                          <th className="px-5 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-800/50">
                        {loadingCerts ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12">
                              <Loader2 className="w-5 h-5 animate-spin mx-auto text-ink-500" />
                            </td>
                          </tr>
                        ) : certificatesList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-ink-500 text-sm">
                              No certificates found. Click &quot;Issue Certificate&quot; to create one.
                            </td>
                          </tr>
                        ) : (
                          certificatesList.map((cert) => (
                            <tr key={cert.certificate_id} className="hover:bg-ink-900/30 transition-colors">
                              <td className="px-5 py-4 font-mono text-xs font-bold text-emerald-400">
                                <div className="flex items-center gap-2">
                                  <span>{cert.certificate_id}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(cert.certificate_id);
                                      setCopiedCertId(cert.certificate_id);
                                      setTimeout(() => setCopiedCertId(null), 2000);
                                    }}
                                    className="text-ink-400 hover:text-white transition"
                                    title="Copy Certificate ID"
                                  >
                                    {copiedCertId === cert.certificate_id ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="font-semibold text-white">{cert.student_name}</div>
                                <div className="text-xs text-ink-400 font-mono">{cert.student_email}</div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="text-ink-200 font-medium">{cert.program_title}</div>
                                <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-ink-800 text-ink-400 mt-0.5">
                                  {cert.track_type}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-xs text-ink-300">
                                <div>{cert.duration}</div>
                                <div className="text-ink-500">{cert.issue_date}</div>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-xs font-bold px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                  {cert.grade}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-xs text-ink-300">
                                {cert.instructor_name}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <a
                                    href={`/verify-certificate?id=${encodeURIComponent(cert.certificate_id)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1.5 bg-ink-900 hover:bg-ink-800 text-brand-400 hover:text-brand-300 border border-ink-800 rounded text-xs font-medium transition flex items-center gap-1"
                                    title="View Public Verification"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" /> Verify
                                  </a>
                                  <button
                                    disabled={deletingCertId === cert.certificate_id}
                                    onClick={() => handleDeleteCertificate(cert.certificate_id)}
                                    className="p-1.5 bg-ink-900 hover:bg-red-600/30 text-ink-400 hover:text-red-400 border border-ink-800 rounded transition disabled:opacity-50"
                                    title="Revoke and Delete Certificate"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* ─────────────────── SUBMISSIONS REVIEW SECTION ─────────────────── */}
          {(activeTab === "submissions" || activeTab === "overview") && (
            <FadeIn delay={0.25} direction="up">
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FolderGit2 className="w-5 h-5 text-blue-400" /> Student Task & Project Submissions
                    </h2>
                    <p className="text-xs text-ink-400 mt-0.5">
                      Review weekly deliverables, GitHub repositories, live deployments, and assign feedback.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-400" />
                      <input
                        type="text"
                        placeholder="Search student or task..."
                        value={subSearch}
                        onChange={(e) => setSubSearch(e.target.value)}
                        className="w-full bg-ink-950 border border-ink-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <select
                      value={subStatusFilter}
                      onChange={(e) => setSubStatusFilter(e.target.value)}
                      className="bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="submitted">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="needs_revision">Needs Revision</option>
                    </select>
                    <button
                      onClick={fetchSubmissions}
                      className="p-2 bg-ink-900 border border-ink-800 rounded-lg text-ink-300 hover:text-white transition"
                      title="Refresh Submissions"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-950/30">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-ink-900/50 text-ink-400 font-medium border-b border-ink-800">
                        <tr>
                          <th className="px-5 py-3 font-medium">Student</th>
                          <th className="px-5 py-3 font-medium">Domain & Track</th>
                          <th className="px-5 py-3 font-medium">Task / Project</th>
                          <th className="px-5 py-3 font-medium">Work Artifacts</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                          <th className="px-5 py-3 font-medium">Submitted</th>
                          <th className="px-5 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-800/50">
                        {loadingSubmissions ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12">
                              <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-400" />
                            </td>
                          </tr>
                        ) : submissionsList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-ink-500 text-sm">
                              No submissions found matching criteria.
                            </td>
                          </tr>
                        ) : (
                          submissionsList.map((sub) => (
                            <tr key={sub.id} className="hover:bg-ink-900/30 transition-colors">
                              <td className="px-5 py-4">
                                <div className="font-semibold text-white">{sub.student_name}</div>
                                <div className="text-xs text-ink-400 font-mono">{sub.student_email}</div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="text-xs text-ink-200">{sub.role_preference}</div>
                                <div className="text-[10px] text-ink-500">{sub.duration} Track</div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-ink-800 text-brand-400">
                                    {sub.task_key}
                                  </span>
                                  {sub.title}
                                </div>
                                {sub.project_topic && (
                                  <div className="text-[11px] text-purple-400 mt-0.5 font-medium">
                                    Topic: {sub.project_topic}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  {sub.github_url && (
                                    <a
                                      href={sub.github_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-1 bg-ink-900 hover:bg-ink-800 text-ink-200 hover:text-white border border-ink-800 rounded text-xs flex items-center gap-1 transition"
                                      title="Open GitHub Repository"
                                    >
                                      <Code2 className="w-3 h-3 text-blue-400" /> Code
                                    </a>
                                  )}
                                  {sub.live_url && (
                                    <a
                                      href={sub.live_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-1 bg-ink-900 hover:bg-ink-800 text-ink-200 hover:text-white border border-ink-800 rounded text-xs flex items-center gap-1 transition"
                                      title="Open Live Deployment"
                                    >
                                      <Globe className="w-3 h-3 text-emerald-400" /> Demo
                                    </a>
                                  )}
                                  {sub.documentation_url && (
                                    <a
                                      href={sub.documentation_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-1 bg-ink-900 hover:bg-ink-800 text-ink-200 hover:text-white border border-ink-800 rounded text-xs flex items-center gap-1 transition"
                                      title="Open Documentation"
                                    >
                                      <FileText className="w-3 h-3 text-purple-400" /> Docs
                                    </a>
                                  )}
                                  {!sub.github_url && !sub.live_url && !sub.documentation_url && (
                                    <span className="text-xs text-ink-500 italic">No links</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                                    sub.status === "approved"
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                      : sub.status === "needs_revision"
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                      : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                  }`}
                                >
                                  {sub.status === "approved"
                                    ? "✓ Approved"
                                    : sub.status === "needs_revision"
                                    ? "⚠ Needs Revision"
                                    : "⏳ Submitted"}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-xs text-ink-400">
                                {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : "—"}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  onClick={() => handleOpenReviewModal(sub)}
                                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-xs font-semibold transition"
                                >
                                  Review / Grade
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* ─────────────────── UNLOCK REQUESTS SECTION ─────────────────── */}
          {(activeTab === "unlocks" || activeTab === "overview") && (
            <FadeIn delay={0.28} direction="up">
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Unlock className="w-5 h-5 text-amber-400" /> Student Unlock Requests
                    </h2>
                    <p className="text-xs text-ink-400 mt-0.5">
                      Fast-track students who completed prior work and requested early access to next milestone modules.
                    </p>
                  </div>
                  <button
                    onClick={fetchUnlockRequests}
                    className="p-2 bg-ink-900 border border-ink-800 rounded-lg text-ink-300 hover:text-white transition self-start sm:self-auto"
                    title="Refresh Unlock Requests"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-950/30">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-ink-900/50 text-ink-400 font-medium border-b border-ink-800">
                        <tr>
                          <th className="px-5 py-3 font-medium">Student</th>
                          <th className="px-5 py-3 font-medium">Requested Module</th>
                          <th className="px-5 py-3 font-medium">Student Reason & Justification</th>
                          <th className="px-5 py-3 font-medium">Requested At</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                          <th className="px-5 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-800/50">
                        {loadingUnlocks ? (
                          <tr>
                            <td colSpan={6} className="text-center py-12">
                              <Loader2 className="w-5 h-5 animate-spin mx-auto text-amber-400" />
                            </td>
                          </tr>
                        ) : unlockRequests.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-ink-500 text-sm">
                              No unlock requests currently pending.
                            </td>
                          </tr>
                        ) : (
                          unlockRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-ink-900/30 transition-colors">
                              <td className="px-5 py-4">
                                <div className="font-semibold text-white">{req.student_name}</div>
                                <div className="text-xs text-ink-400 font-mono">{req.student_email}</div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-ink-800 text-amber-400">
                                    {req.task_key}
                                  </span>
                                  {req.task_title}
                                </div>
                              </td>
                              <td className="px-5 py-4 max-w-xs truncate">
                                <span className="text-xs text-ink-300 italic" title={req.reason}>
                                  &ldquo;{req.reason}&rdquo;
                                </span>
                              </td>
                              <td className="px-5 py-4 text-xs text-ink-400">
                                {new Date(req.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                    req.status === "approved"
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                      : req.status === "rejected"
                                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                  }`}
                                >
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                {req.status === "pending" ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      disabled={actioningUnlockId === req.id}
                                      onClick={() => handleUnlockAction(req.id, "approve")}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition disabled:opacity-50"
                                    >
                                      Approve & Unlock
                                    </button>
                                    <button
                                      disabled={actioningUnlockId === req.id}
                                      onClick={() => handleUnlockAction(req.id, "reject")}
                                      className="px-3 py-1 bg-ink-800 hover:bg-red-600/80 text-ink-300 hover:text-white rounded text-xs font-medium transition disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-ink-500 font-mono">Action recorded</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* ─────────────────── STUDENT DOUBTS HELPDESK SECTION ─────────────────── */}
          {(activeTab === "doubts" || activeTab === "overview") && (
            <FadeIn delay={0.3} direction="up">
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-pink-400" /> Technical Doubts & Mentor Desk
                    </h2>
                    <p className="text-xs text-ink-400 mt-0.5">
                      Direct 2-way query resolution desk for student code snippets, bugs, and module doubts.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={doubtFilter}
                      onChange={(e) => setDoubtFilter(e.target.value)}
                      className="bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
                    >
                      <option value="all">All Queries</option>
                      <option value="open">Open / Unanswered</option>
                      <option value="answered">Resolved / Answered</option>
                    </select>
                    <button
                      onClick={fetchDoubts}
                      className="p-2 bg-ink-900 border border-ink-800 rounded-lg text-ink-300 hover:text-white transition"
                      title="Refresh Doubts"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {loadingDoubts ? (
                    <div className="p-12 text-center border border-ink-800 rounded-xl bg-ink-950/30">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-pink-400" />
                    </div>
                  ) : doubtsList.length === 0 ? (
                    <div className="p-12 text-center border border-ink-800 rounded-xl bg-ink-950/30 text-ink-500 text-sm">
                      No student queries found.
                    </div>
                  ) : (
                    doubtsList.map((d) => (
                      <div
                        key={d.id}
                        className={`p-5 rounded-xl border transition-all ${
                          d.status === "open"
                            ? "bg-pink-950/10 border-pink-500/30"
                            : "bg-ink-950/30 border-ink-800 hover:border-ink-700"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-ink-800/60">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                  d.status === "open"
                                    ? "bg-pink-500/20 text-pink-300 border-pink-500/40"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                }`}
                              >
                                {d.status === "open" ? "● OPEN QUERY" : "✓ RESOLVED"}
                              </span>
                              <span className="text-xs font-semibold text-brand-400">{d.domain_track}</span>
                              <span className="text-xs text-ink-500">•</span>
                              <span className="text-xs text-ink-300 font-mono">{d.module_name}</span>
                            </div>
                            <h3 className="text-base font-bold text-white mt-1.5">{d.subject}</h3>
                            <div className="text-xs text-ink-400 mt-0.5">
                              From: <strong className="text-ink-200">{d.student_name}</strong> ({d.student_email}) •{" "}
                              {new Date(d.created_at).toLocaleString()}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setReplyingDoubt(d);
                              setDoubtReplyText(d.admin_reply || "");
                            }}
                            className="px-3.5 py-1.5 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition self-start whitespace-nowrap"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {d.admin_reply ? "Edit Reply" : "Answer Query"}
                          </button>
                        </div>

                        {/* Question body */}
                        <p className="text-sm text-ink-200 mt-3 whitespace-pre-wrap leading-relaxed">{d.question}</p>

                        {/* Code snippet if any */}
                        {d.code_snippet && (
                          <div className="mt-3 p-3 bg-black/70 border border-ink-800 rounded-lg font-mono text-xs text-ink-200 overflow-x-auto">
                            <pre>{d.code_snippet}</pre>
                          </div>
                        )}

                        {/* Attached Error Screenshot */}
                        {d.image_url && (
                          <div className="mt-3 flex items-center gap-3 p-2.5 bg-black/50 border border-ink-800 rounded-lg max-w-md">
                            <img
                              src={getImageUrl(d.image_url)}
                              alt="Error Screenshot"
                              className="w-14 h-14 object-cover rounded border border-ink-700 cursor-pointer hover:opacity-80 transition shrink-0"
                              onClick={() => setExpandedDoubtImage(getImageUrl(d.image_url))}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                                <ImageIcon className="w-3.5 h-3.5" /> Error Screenshot Attached
                              </div>
                              <button
                                type="button"
                                onClick={() => setExpandedDoubtImage(getImageUrl(d.image_url))}
                                className="text-[11px] text-ink-400 hover:text-white underline mt-1 flex items-center gap-1"
                              >
                                <ZoomIn className="w-3 h-3" /> Click to inspect visual error
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Reply box if answered */}
                        {d.admin_reply && (
                          <div className="mt-4 p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                              <span>✓ Mentor Resolution ({d.answered_by || "HR Team"})</span>
                              {d.answered_at && (
                                <span className="text-ink-500 font-normal">
                                  {new Date(d.answered_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-ink-200 whitespace-pre-wrap leading-relaxed">
                              {d.admin_reply}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </FadeIn>
          )}

          {/* ─────────────────── CONTACT QUERIES SECTION ─────────────────── */}
          {(activeTab === "contacts" || activeTab === "overview") && (
            <FadeIn delay={0.35} direction="up">
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Mail className="w-5 h-5 text-cyan-400" /> Contact Inquiries & Candidate Queries
                    </h2>
                    <p className="text-xs text-ink-400 mt-0.5">
                      Direct inquiries sent via the public contact page. Reply via email and resolve student queries.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative w-full sm:w-60">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-400" />
                      <input
                        type="text"
                        placeholder="Search contact queries..."
                        value={contactSearch}
                        onChange={(e) => {
                          setContactSearch(e.target.value);
                          setContactPage(1);
                        }}
                        className="w-full bg-ink-950 border border-ink-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>

                    <select
                      value={contactFilter}
                      onChange={(e) => {
                        setContactFilter(e.target.value);
                        setContactPage(1);
                      }}
                      className="bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                    >
                      <option value="all">All Inquiries</option>
                      <option value="new">New / Unread</option>
                      <option value="read">Read / In-Progress</option>
                      <option value="replied">Replied / Resolved</option>
                    </select>

                    <button
                      onClick={fetchContacts}
                      className="p-2 bg-ink-900 border border-ink-800 rounded-lg text-ink-300 hover:text-white transition"
                      title="Refresh Contact Queries"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    {contactsList.length > 0 && (
                      <button
                        disabled={deletingAllContacts}
                        onClick={handleDeleteAllContacts}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                        title="Permanently delete all contact queries"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete All
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {loadingContacts ? (
                    <div className="p-12 text-center border border-ink-800 rounded-xl bg-ink-950/30">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-cyan-400" />
                    </div>
                  ) : contactsList.length === 0 ? (
                    <div className="p-12 text-center border border-ink-800 rounded-xl bg-ink-950/30 text-ink-500 text-sm">
                      No contact inquiries found.
                    </div>
                  ) : (
                    contactsList.map((c) => (
                      <div
                        key={c.id}
                        className={`p-5 rounded-xl border transition-all ${
                          c.status === "new"
                            ? "bg-cyan-950/10 border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                            : c.status === "replied"
                            ? "bg-emerald-950/10 border-emerald-500/30"
                            : "bg-ink-950/30 border-ink-800 hover:border-ink-700"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-ink-800/60">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                  c.status === "new"
                                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse"
                                    : c.status === "replied"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                }`}
                              >
                                {c.status === "new" ? "● NEW INQUIRY" : c.status === "replied" ? "✓ REPLIED" : "READ"}
                              </span>
                              <h3 className="text-base font-bold text-white">{c.subject}</h3>
                            </div>
                            <div className="text-xs text-ink-400 mt-1 flex items-center gap-2 flex-wrap">
                              <span>From: <strong className="text-white">{c.name}</strong></span>
                              <span>•</span>
                              <a
                                href={`mailto:${c.email}`}
                                className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                              >
                                {c.email}
                              </a>
                              <span>•</span>
                              <span className="text-ink-500">
                                {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start flex-wrap">
                            <button
                              onClick={() => {
                                setReplyingContact(c);
                                setContactReplyText(c.admin_reply || "");
                              }}
                              className="px-3.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              {c.admin_reply ? "Edit Reply / Re-send" : "Reply to User"}
                            </button>

                            {c.status === "new" && (
                              <button
                                onClick={() => handleUpdateContactStatus(c.id, "read")}
                                className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-ink-300 border border-ink-700 rounded-lg text-xs font-medium transition whitespace-nowrap"
                                title="Mark inquiry as read"
                              >
                                Mark Read
                              </button>
                            )}

                            <button
                              disabled={deletingContactId === c.id}
                              onClick={() => handleDeleteContact(c.id, c.name)}
                              className="p-1.5 text-ink-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                              title="Delete inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Inquiry Message Body */}
                        <div className="mt-3 text-sm text-ink-200 whitespace-pre-wrap leading-relaxed bg-ink-900/40 p-4 rounded-lg border border-ink-800/80">
                          {c.message}
                        </div>

                        {/* Official Admin Reply Snippet if answered */}
                        {c.admin_reply && (
                          <div className="mt-3 p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                              <span>✓ Official Reply Sent ({c.replied_by || "Admin Support"})</span>
                              {c.replied_at && (
                                <span className="text-ink-500 font-normal">
                                  {new Date(c.replied_at).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-ink-200 whitespace-pre-wrap leading-relaxed">
                              {c.admin_reply}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination for Contact Queries */}
                {contactTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-ink-800 text-xs text-ink-400">
                    <div>
                      Page {contactPage} of {contactTotalPages} ({contactTotalCount} inquiries)
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={contactPage <= 1}
                        onClick={() => setContactPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 bg-ink-900 border border-ink-800 rounded text-xs text-white disabled:opacity-40 hover:bg-ink-800 transition"
                      >
                        Previous
                      </button>
                      <button
                        disabled={contactPage >= contactTotalPages}
                        onClick={() => setContactPage((p) => Math.min(contactTotalPages, p + 1))}
                        className="px-3 py-1.5 bg-ink-900 border border-ink-800 rounded text-xs text-white disabled:opacity-40 hover:bg-ink-800 transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>
          )}

          {/* ─────────────────── BRANDED MAILER SECTION ─────────────────── */}
          {activeTab === "mailer" && (
            <FadeIn delay={0.1} direction="up">
              <BrandedMailerTab />
            </FadeIn>
          )}
        </div>

        {/* ─────────────────── REVIEW SUBMISSION MODAL ─────────────────── */}
        {selectedSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ink-950 border-2 border-ink-800 p-6 sm:p-8 shadow-2xl space-y-6 rounded-xl">
              <button
                onClick={() => setSelectedSub(null)}
                className="absolute top-4 right-4 p-2 text-ink-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-ink-800 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider rounded">
                  <FolderGit2 className="w-3.5 h-3.5" /> Grade & Review Deliverable
                </div>
                <h2 className="text-xl font-black text-white mt-2">
                  {selectedSub.task_key.toUpperCase()}: {selectedSub.title}
                </h2>
                <div className="text-xs text-ink-400 mt-1">
                  Candidate: <strong className="text-white">{selectedSub.student_name}</strong> (
                  {selectedSub.student_email})
                </div>
              </div>

              {/* Work Links */}
              <div className="space-y-3 bg-ink-900/50 p-4 border border-ink-800 rounded-lg">
                <h4 className="text-xs font-bold uppercase text-ink-400 tracking-wider">Submitted Links & Artifacts</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedSub.github_url && (
                    <a
                      href={selectedSub.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-ink-950 hover:bg-ink-900 text-blue-400 border border-ink-700 rounded text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <Code2 className="w-3.5 h-3.5" /> GitHub Repository
                    </a>
                  )}
                  {selectedSub.live_url && (
                    <a
                      href={selectedSub.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-ink-950 hover:bg-ink-900 text-emerald-400 border border-ink-700 rounded text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <Globe className="w-3.5 h-3.5" /> Live Production URL
                    </a>
                  )}
                  {selectedSub.documentation_url && (
                    <a
                      href={selectedSub.documentation_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-ink-950 hover:bg-ink-900 text-purple-400 border border-ink-700 rounded text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5" /> Documentation
                    </a>
                  )}
                </div>

                {selectedSub.notes && (
                  <div className="pt-2 border-t border-ink-800/60 text-xs text-ink-300">
                    <strong className="text-white block mb-1">Student Notes:</strong>
                    <p className="whitespace-pre-wrap">{selectedSub.notes}</p>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-300 uppercase">Grade / Evaluation Decision</label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="w-full bg-ink-900 border border-ink-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="approved">Approved / Accepted (Complete)</option>
                    <option value="needs_revision">Needs Revision (Request changes)</option>
                    <option value="submitted">Under Review</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-300 uppercase">
                    Admin Feedback & Mentor Comments
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide constructive feedback, notes, code suggestions or approval remarks..."
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    className="w-full bg-ink-900 border border-ink-800 rounded p-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-ink-900/40 border border-ink-800 rounded">
                  <input
                    type="checkbox"
                    id="reviewUnlocked"
                    checked={reviewUnlocked}
                    onChange={(e) => setReviewUnlocked(e.target.checked)}
                    className="w-4 h-4 rounded bg-ink-950 border-ink-700 text-blue-500 focus:ring-0"
                  />
                  <label htmlFor="reviewUnlocked" className="text-xs text-ink-200 cursor-pointer">
                    Module Access Status: <strong>{reviewUnlocked ? "Unlocked for candidate" : "Locked"}</strong>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-800">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 bg-ink-900 hover:bg-ink-800 text-ink-300 rounded text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingReview}
                  onClick={handleSaveReview}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Evaluation"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────── DOUBT REPLY MODAL ─────────────────── */}
        {replyingDoubt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ink-950 border-2 border-ink-800 p-6 sm:p-8 shadow-2xl space-y-6 rounded-xl">
              <button
                onClick={() => setReplyingDoubt(null)}
                className="absolute top-4 right-4 p-2 text-ink-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-ink-800 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider rounded">
                  <MessageSquare className="w-3.5 h-3.5" /> Answer Technical Query
                </div>
                <h2 className="text-xl font-black text-white mt-2">{replyingDoubt.subject}</h2>
                <div className="text-xs text-ink-400 mt-1">
                  Student: <strong className="text-white">{replyingDoubt.student_name}</strong> (
                  {replyingDoubt.student_email}) • {replyingDoubt.domain_track}
                </div>
              </div>

              {/* Question overview */}
              <div className="space-y-2 bg-ink-900/50 p-4 border border-ink-800 rounded-lg text-xs">
                <strong className="text-ink-400 uppercase tracking-wider block">Question:</strong>
                <p className="text-ink-200 whitespace-pre-wrap">{replyingDoubt.question}</p>
                {replyingDoubt.code_snippet && (
                  <div className="mt-2 p-2 bg-black/80 border border-ink-800 rounded font-mono text-[11px] text-pink-300">
                    <pre>{replyingDoubt.code_snippet}</pre>
                  </div>
                )}

                {/* Attached Error Screenshot */}
                {replyingDoubt.image_url && (
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-ink-800/80">
                    <div className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Attached Error Screenshot:
                    </div>
                    <div className="relative group inline-block bg-black/60 border border-ink-800 rounded-lg overflow-hidden max-w-md">
                      <img
                        src={replyingDoubt.image_url.startsWith("http") ? replyingDoubt.image_url : `${apiBase}${replyingDoubt.image_url.startsWith("/") ? "" : "/"}${replyingDoubt.image_url}`}
                        alt="Error Screenshot"
                        className="max-h-56 w-auto object-contain cursor-pointer hover:opacity-90 transition"
                        onClick={() => setExpandedDoubtImage(replyingDoubt.image_url?.startsWith("http") ? replyingDoubt.image_url : `${apiBase}${replyingDoubt.image_url?.startsWith("/") ? "" : "/"}${replyingDoubt.image_url}`)}
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => setExpandedDoubtImage(replyingDoubt.image_url?.startsWith("http") ? replyingDoubt.image_url : `${apiBase}${replyingDoubt.image_url?.startsWith("/") ? "" : "/"}${replyingDoubt.image_url}`)}
                          className="px-2 py-1 bg-black/80 text-white rounded text-[10px] font-semibold flex items-center gap-1 hover:bg-black transition"
                        >
                          <ZoomIn className="w-3 h-3" /> Zoom
                        </button>
                        <a
                          href={replyingDoubt.image_url.startsWith("http") ? replyingDoubt.image_url : `${apiBase}${replyingDoubt.image_url.startsWith("/") ? "" : "/"}${replyingDoubt.image_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-pink-600/90 hover:bg-pink-600 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition"
                        >
                          <ExternalLink className="w-3 h-3" /> Open
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-300 uppercase">
                  Mentor Solution / Detailed Resolution
                </label>
                <textarea
                  rows={6}
                  placeholder="Type the solution, architectural guidance, or explanation for the student..."
                  value={doubtReplyText}
                  onChange={(e) => setDoubtReplyText(e.target.value)}
                  className="w-full bg-ink-900 border border-ink-800 rounded p-3 text-white text-sm focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-800">
                <button
                  type="button"
                  onClick={() => setReplyingDoubt(null)}
                  className="px-4 py-2 bg-ink-900 hover:bg-ink-800 text-ink-300 rounded text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={sendingReply || !doubtReplyText.trim()}
                  onClick={handleSendDoubtReply}
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Resolution to Student"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────── ISSUE NEW CERTIFICATE MODAL ─────────────────── */}
        {showIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ink-950 border-2 border-ink-800 p-8 shadow-2xl space-y-6 rounded-xl">
              {/* Close Button */}
              <button
                onClick={() => setShowIssueModal(false)}
                className="absolute top-4 right-4 p-2 text-ink-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="border-b border-ink-800 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded">
                  <Award className="w-3.5 h-3.5" /> Issue Digital Credential
                </div>
                <h2 className="text-2xl font-black text-white mt-2">Add New Verified Certificate</h2>
                <p className="text-xs text-ink-400 mt-1">
                  Enter candidate and course details. The certificate will be instantly verifiable on the public verification portal.
                </p>
              </div>

              {certError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded">
                  {certError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleIssueCertificate} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Certificate Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-300 uppercase">
                      Certificate Number <span className="text-ink-500">(Auto or Custom)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. IVT/JUN26/2026/0201"
                        value={newCertForm.certificate_id}
                        onChange={(e) => setNewCertForm({ ...newCertForm, certificate_id: e.target.value })}
                        className="w-full bg-ink-900 border border-ink-800 rounded px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                          const mmm = months[now.getMonth()];
                          const yy = String(now.getFullYear()).slice(-2);
                          const yyyy = String(now.getFullYear());
                          const randSeq = String(Math.floor(1 + Math.random() * 9999)).padStart(4, "0");
                          setNewCertForm({
                            ...newCertForm,
                            certificate_id: `IVT/${mmm}${yy}/${yyyy}/${randSeq}`,
                          });
                        }}
                        className="px-2.5 py-1 text-xs bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white rounded border border-ink-700 whitespace-nowrap"
                      >
                        Auto-Gen
                      </button>
                    </div>
                  </div>

                  {/* Program Track Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-300 uppercase">Track Type</label>
                    <select
                      value={newCertForm.track_type}
                      onChange={(e) => setNewCertForm({ ...newCertForm, track_type: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Virtual Internship">Virtual Internship</option>
                      <option value="Bootcamp">Bootcamp</option>
                      <option value="Industrial Co-Op">Industrial Co-Op</option>
                      <option value="Advanced Training">Advanced Training</option>
                    </select>
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-300 uppercase">Recipient Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={newCertForm.student_name}
                      onChange={(e) => setNewCertForm({ ...newCertForm, student_name: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-300 uppercase">Recipient Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. aarav.sharma@example.com"
                      value={newCertForm.student_email}
                      onChange={(e) => setNewCertForm({ ...newCertForm, student_email: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Course Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-300 uppercase">Course / Program Applied *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack Web Development Co-Op"
                    value={newCertForm.program_title}
                    onChange={(e) => setNewCertForm({ ...newCertForm, program_title: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Duration & Issue Date & Grade */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-300 uppercase">Duration</label>
                    <select
                      value={newCertForm.duration}
                      onChange={(e) => setNewCertForm({ ...newCertForm, duration: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="1 Month">1 Month</option>
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                      <option value="8 Weeks">8 Weeks</option>
                      <option value="10 Weeks">10 Weeks</option>
                      <option value="12 Weeks">12 Weeks</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-300 uppercase">Issue Date</label>
                    <input
                      type="text"
                      placeholder="e.g. September 06, 2026"
                      value={newCertForm.issue_date}
                      onChange={(e) => setNewCertForm({ ...newCertForm, issue_date: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-300 uppercase">Grade / Performance</label>
                    <select
                      value={newCertForm.grade}
                      onChange={(e) => setNewCertForm({ ...newCertForm, grade: e.target.value })}
                      className="w-full bg-ink-900 border border-ink-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Distinction (Grade A+)">Distinction (Grade A+)</option>
                      <option value="Excellence (Grade O)">Excellence (Grade O)</option>
                      <option value="Merit (Grade A)">Merit (Grade A)</option>
                      <option value="Grade B+">Grade B+</option>
                      <option value="Completed with Honors">Completed with Honors</option>
                    </select>
                  </div>
                </div>

                {/* Technical Competence / Skills */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-300 uppercase">
                    Technical Competencies / Skills <span className="text-ink-500">(Comma separated)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Next.js 15, React 19, TypeScript, FastAPI, PostgreSQL, Docker"
                    value={newCertForm.skills_acquired}
                    onChange={(e) => setNewCertForm({ ...newCertForm, skills_acquired: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Issuing Authority / Manager */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-300 uppercase">Issuing Authority / HR Manager</label>
                  <input
                    type="text"
                    value={newCertForm.instructor_name}
                    onChange={(e) => setNewCertForm({ ...newCertForm, instructor_name: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-800 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-800">
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    className="px-4 py-2 bg-ink-900 hover:bg-ink-800 text-ink-300 text-xs font-bold rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={issuing}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded transition flex items-center gap-2 disabled:opacity-50 shadow"
                  >
                    {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                    Issue & Verify Certificate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────────── APPLICANT DETAIL REVIEW MODAL ─────────────────── */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-ink-950 border-2 border-ink-800 p-8 shadow-2xl space-y-6">
              {/* Close Button */}
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute top-4 right-4 p-2 text-ink-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Candidate Review
                  </div>
                  <h2 className="text-2xl font-black text-white mt-2">{selectedApp.full_name}</h2>
                  <div className="text-xs text-ink-400 mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-brand-400" /> {selectedApp.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-brand-400" /> {selectedApp.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateAppStatus(selectedApp.id, "accepted")}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition disabled:opacity-50"
                  >
                    Accept Candidate
                  </button>
                  <button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateAppStatus(selectedApp.id, "rejected")}
                    className="px-3.5 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded text-xs font-bold transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    disabled={deletingAppId === selectedApp.id}
                    onClick={() => handleDeleteApp(selectedApp.id, selectedApp.full_name)}
                    className="px-3 py-2 bg-red-950 hover:bg-red-900 text-red-300 hover:text-white rounded text-xs font-bold border border-red-800 transition flex items-center gap-1.5 disabled:opacity-50"
                    title="Permanently delete application"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" /> Delete
                  </button>
                </div>
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {/* Academic */}
                <div className="space-y-2 bg-ink-900/50 p-4 border border-ink-800 rounded">
                  <h4 className="text-xs font-bold uppercase text-brand-400 tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> Academic Profile
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p><strong className="text-white">College:</strong> <span className="text-ink-300">{selectedApp.college}</span></p>
                    <p><strong className="text-white">Degree:</strong> <span className="text-ink-300">{selectedApp.degree}</span></p>
                    <p><strong className="text-white">Year:</strong> <span className="text-ink-300">{selectedApp.year_of_study}</span></p>
                  </div>
                </div>

                {/* Track & Duration */}
                <div className="space-y-2 bg-ink-900/50 p-4 border border-ink-800 rounded">
                  <h4 className="text-xs font-bold uppercase text-brand-400 tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Internship Track
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p><strong className="text-white">Track:</strong> <span className="text-ink-300">{selectedApp.role_preference || "Full Stack Web Development"}</span></p>
                    <p><strong className="text-white">Duration:</strong> <span className="text-ink-300">{selectedApp.duration}</span></p>
                    <p><strong className="text-white">Applied Date:</strong> <span className="text-ink-300">{new Date(selectedApp.created_at).toLocaleDateString()}</span></p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-brand-400 tracking-wider">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.skills?.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-ink-900 border border-ink-700 text-ink-200 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Professional Links */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-brand-400 tracking-wider">Profiles & Portfolio</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedApp.linkedin_url ? (
                    <a
                      href={selectedApp.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-brand-400 border border-ink-700 rounded text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <Link2 className="w-3.5 h-3.5" /> LinkedIn Profile
                    </a>
                  ) : (
                    <span className="text-xs text-ink-500">No LinkedIn</span>
                  )}
                  {selectedApp.github_url ? (
                    <a
                      href={selectedApp.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-brand-400 border border-ink-700 rounded text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <Code2 className="w-3.5 h-3.5" /> GitHub Profile
                    </a>
                  ) : (
                    <span className="text-xs text-ink-500">No GitHub</span>
                  )}
                  {selectedApp.portfolio_url && (
                    <a
                      href={selectedApp.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-brand-400 border border-ink-700 rounded text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <Globe className="w-3.5 h-3.5" /> Portfolio
                    </a>
                  )}
                </div>
              </div>

              {/* Professional Description */}
              {selectedApp.experience_description && (
                <div className="space-y-2 bg-ink-900/60 p-4 border border-ink-800 rounded">
                  <h4 className="text-xs font-bold uppercase text-brand-400 tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Professional Experience & Projects Description
                  </h4>
                  <p className="text-xs text-ink-200 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.experience_description}
                  </p>
                </div>
              )}

              {/* Statement of Purpose */}
              {selectedApp.cover_letter && (
                <div className="space-y-2 bg-ink-900/60 p-4 border border-ink-800 rounded">
                  <h4 className="text-xs font-bold uppercase text-brand-400 tracking-wider">
                    Why Hire Me / Statement of Purpose
                  </h4>
                  <p className="text-xs text-ink-200 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.cover_letter}
                  </p>
                </div>
              )}

              {/* Resume Actions */}
              <div className="pt-4 border-t border-ink-800 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs font-bold text-white">Candidate Resume Document</div>
                  <div className="text-[11px] text-ink-400">
                    {selectedApp.resume_filename ? "Attached and verified" : "No resume uploaded"}
                  </div>
                </div>

                {selectedApp.resume_filename ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPreviewResume({ url: getResumeUrl(selectedApp.resume_filename), name: selectedApp.full_name })}
                      className="px-3.5 py-2 bg-ink-900 hover:bg-ink-800 text-ink-200 border border-ink-700 rounded text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-4 h-4 text-brand-400" /> Preview Resume
                    </button>
                    <a
                      href={getResumeUrl(selectedApp.resume_filename)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-bold flex items-center gap-1.5 transition shadow-[2px_2px_0px_#ffffff]"
                    >
                      <Download className="w-4 h-4" /> Download / Open PDF
                    </a>
                  </div>
                ) : (
                  <span className="text-xs text-ink-500 italic">No resume provided</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────── RESUME PREVIEW MODAL ─────────────────── */}
        {previewResume && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setPreviewResume(null)}
          >
            <div
              className="relative w-full max-w-5xl h-[90vh] bg-ink-950 border-2 border-brand-500/40 rounded-xl flex flex-col shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-ink-800 flex items-center justify-between bg-ink-900">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Resume Document — {previewResume.name}</h3>
                    <div className="text-[11px] text-ink-400 truncate max-w-md">{previewResume.url}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={previewResume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                  </a>
                  <a
                    href={previewResume.url}
                    download
                    className="px-3 py-1.5 bg-ink-800 hover:bg-ink-700 text-ink-200 rounded text-xs font-semibold flex items-center gap-1.5 transition border border-ink-700"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewResume(null)}
                    className="p-1.5 text-ink-400 hover:text-white rounded hover:bg-ink-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PDF Preview Frame */}
              <div className="flex-1 w-full bg-ink-900 relative">
                <iframe
                  src={previewResume.url}
                  className="w-full h-full border-0"
                  title="Candidate Resume Preview"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────── DOUBT REPLY MODAL ─────────────────── */}
        {replyingDoubt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setReplyingDoubt(null)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ink-950 border-2 border-pink-500/40 p-6 sm:p-8 shadow-2xl space-y-6 rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setReplyingDoubt(null)}
                className="absolute top-4 right-4 p-2 text-ink-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-ink-800 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider rounded">
                  <MessageSquare className="w-3.5 h-3.5" /> Technical Mentor Resolution
                </div>
                <h2 className="text-xl font-black text-white mt-2">
                  {replyingDoubt.subject}
                </h2>
                <div className="text-xs text-ink-400 mt-1">
                  Student: <strong className="text-white">{replyingDoubt.student_name}</strong> ({replyingDoubt.student_email}) •{" "}
                  <span className="text-brand-400 font-mono">{replyingDoubt.domain_track}</span> •{" "}
                  <span className="text-ink-300 font-mono">{replyingDoubt.module_name}</span>
                </div>
              </div>

              {/* Doubt Question */}
              <div className="space-y-2 bg-ink-900/60 p-4 border border-ink-800 rounded-lg">
                <h4 className="text-xs font-bold uppercase text-ink-400 tracking-wider">Student Question / Blocker</h4>
                <p className="text-xs text-ink-200 leading-relaxed whitespace-pre-wrap">{replyingDoubt.question}</p>
              </div>

              {/* Code Snippet if any */}
              {replyingDoubt.code_snippet && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-ink-400 tracking-wider">Code Snippet</h4>
                  <div className="p-3 bg-black/80 border border-ink-800 rounded-lg font-mono text-xs text-pink-300 overflow-x-auto">
                    <pre>{replyingDoubt.code_snippet}</pre>
                  </div>
                </div>
              )}

              {/* Attached Error Screenshot */}
              {replyingDoubt.image_url && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-ink-400 tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-pink-400" /> Attached Screenshot:
                  </h4>
                  <div className="relative inline-block group rounded-lg overflow-hidden border border-ink-800 bg-black/50">
                    <img
                      src={getImageUrl(replyingDoubt.image_url)}
                      alt="Error Screenshot"
                      className="max-h-56 w-auto object-contain cursor-pointer hover:opacity-90 transition"
                      onClick={() => setExpandedDoubtImage(getImageUrl(replyingDoubt.image_url))}
                    />
                    <button
                      type="button"
                      onClick={() => setExpandedDoubtImage(getImageUrl(replyingDoubt.image_url))}
                      className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/80 text-white rounded text-[10px] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shadow-lg"
                    >
                      <ZoomIn className="w-3 h-3" /> Full View
                    </button>
                  </div>
                </div>
              )}

              {/* Mentor Reply Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-brand-400 tracking-wider">
                  Mentor Solution & Resolution *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Explain the solution, code fix, or step-by-step guidance for the student..."
                  value={doubtReplyText}
                  onChange={(e) => setDoubtReplyText(e.target.value)}
                  className="w-full bg-ink-900 border border-ink-700/80 rounded-lg p-3 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-ink-800">
                <button
                  type="button"
                  onClick={() => setReplyingDoubt(null)}
                  className="px-4 py-2 bg-ink-900 hover:bg-ink-800 text-ink-300 rounded text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={sendingReply || !doubtReplyText.trim()}
                  onClick={handleSendDoubtReply}
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-pink-600/30"
                >
                  {sendingReply ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending Resolution...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Solution to Student
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────── CONTACT QUERY REPLY MODAL ─────────────────── */}
        {replyingContact && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setReplyingContact(null)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ink-950 border-2 border-cyan-500/40 p-6 sm:p-8 shadow-2xl space-y-6 rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setReplyingContact(null)}
                className="absolute top-4 right-4 p-2 text-ink-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-ink-800 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider rounded">
                  <Mail className="w-3.5 h-3.5" /> Official Email Response
                </div>
                <h2 className="text-xl font-black text-white mt-2">
                  {replyingContact.subject}
                </h2>
                <div className="text-xs text-ink-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span>To: <strong className="text-white">{replyingContact.name}</strong></span>
                  <span>•</span>
                  <span className="text-cyan-400 font-mono">{replyingContact.email}</span>
                  <span>•</span>
                  <span className="text-ink-500">
                    Received: {replyingContact.created_at ? new Date(replyingContact.created_at).toLocaleString() : ""}
                  </span>
                </div>
              </div>

              {/* Original Inquiry Message */}
              <div className="space-y-2 bg-ink-900/60 p-4 border border-ink-800 rounded-lg">
                <h4 className="text-xs font-bold uppercase text-ink-400 tracking-wider">Original Message from User</h4>
                <p className="text-xs text-ink-200 leading-relaxed whitespace-pre-wrap">{replyingContact.message}</p>
              </div>

              {/* Admin Reply Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-cyan-400 tracking-wider">
                  Official Response Message *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Type your official response to this inquiry..."
                  value={contactReplyText}
                  onChange={(e) => setContactReplyText(e.target.value)}
                  className="w-full bg-ink-900 border border-ink-700/80 rounded-lg p-3 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[11px] text-ink-400">
                  ✦ Sending this reply will immediately dispatch a branded email directly to <strong className="text-white">{replyingContact.email}</strong> and mark this ticket as <span className="text-emerald-400">Replied</span>.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-ink-800">
                <button
                  type="button"
                  onClick={() => setReplyingContact(null)}
                  className="px-4 py-2 bg-ink-900 hover:bg-ink-800 text-ink-300 rounded text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={sendingContactReply || !contactReplyText.trim()}
                  onClick={handleSendContactReply}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-600/30"
                >
                  {sendingContactReply ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Dispatching Email...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Email Response
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────── DOUBT IMAGE ZOOM LIGHTBOX ─────────────────── */}
        {expandedDoubtImage && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setExpandedDoubtImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setExpandedDoubtImage(null)}
                className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
              >
                <X className="w-5 h-5" /> Close (ESC)
              </button>
              <img
                src={expandedDoubtImage}
                alt="Expanded Error Screenshot"
                className="max-h-[85vh] max-w-full object-contain rounded-lg border border-ink-700 shadow-2xl"
              />
              <div className="mt-3 flex items-center gap-4">
                <a
                  href={expandedDoubtImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-pink-400 hover:underline flex items-center gap-1 bg-ink-900/80 px-3 py-1.5 rounded border border-ink-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Full Resolution in New Tab
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
