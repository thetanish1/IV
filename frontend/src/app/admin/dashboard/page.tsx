"use client";

import React, { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Shield,
  Users,
  CreditCard,
  BookOpen,
  FolderGit2,
  Unlock,
  Key,
  Award,
  HelpCircle,
  LayoutDashboard,
  Mail,
  MessageSquare,
} from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { trackAdminAction } from "@/lib/admin-telemetry";
import AuthGuard from "@/components/AuthGuard";
import { getInitialTheme, applyTheme } from "@/lib/theme";

// Modals & Common Primitives
import {
  ResumePreviewModal,
  ImageLightboxModal,
  AdminContainer,
  AdminErrorBoundary,
} from "@/components/admin/common";

// Modular Admin Layout Components
import AdminTopbar from "@/components/admin/layout/AdminTopbar";
import AdminSidebar, { NavGroup } from "@/components/admin/layout/AdminSidebar";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";

// Tab Loading Fallback Skeleton (Supports Light and Dark mode)
const TabLoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="p-5 rounded-xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-3 w-16 rounded bg-gray-200 dark:bg-ink-800" />
            <div className="h-4 w-4 rounded bg-gray-200 dark:bg-ink-800" />
          </div>
          <div className="h-7 w-24 rounded bg-gray-300 dark:bg-ink-800/80 mt-2" />
        </div>
      ))}
    </div>
    <div className="rounded-2xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950 p-6 space-y-4 shadow-sm">
      <div className="h-6 w-48 rounded bg-gray-200 dark:bg-ink-800" />
      <div className="h-32 w-full rounded bg-gray-100 dark:bg-ink-900" />
    </div>
  </div>
);

// OverviewTab is eagerly imported for instant initial paint
import { OverviewTab } from "@/components/admin/tabs";

// Dynamic Code Splitting for secondary tabs
const ApplicantsTab = dynamic(
  () => import("@/components/admin/tabs/ApplicantsTab"),
  { loading: TabLoadingSkeleton }
);
const SubmissionsTab = dynamic(
  () => import("@/components/admin/tabs/SubmissionsTab"),
  { loading: TabLoadingSkeleton }
);
const UnlockRequestsTab = dynamic(
  () => import("@/components/admin/tabs/UnlockRequestsTab"),
  { loading: TabLoadingSkeleton }
);
const DoubtsHelpdeskTab = dynamic(
  () => import("@/components/admin/tabs/DoubtsHelpdeskTab"),
  { loading: TabLoadingSkeleton }
);
const ContactsTab = dynamic(
  () => import("@/components/admin/tabs/ContactsTab"),
  { loading: TabLoadingSkeleton }
);
const CertificatesTab = dynamic(
  () => import("@/components/admin/tabs/CertificatesTab"),
  { loading: TabLoadingSkeleton }
);
const UsersTab = dynamic(
  () => import("@/components/admin/tabs/UsersTab").then((m) => m.UsersTab),
  { loading: TabLoadingSkeleton }
);
const CourseEnrollmentsTab = dynamic(
  () => import("@/components/admin/tabs/CourseEnrollmentsTab").then((m) => m.CourseEnrollmentsTab),
  { loading: TabLoadingSkeleton }
);
const PaymentsAuditTab = dynamic(
  () => import("@/components/admin/tabs/PaymentsAuditTab").then((m) => m.PaymentsAuditTab),
  { loading: TabLoadingSkeleton }
);
const BrandedMailerTab = dynamic(
  () => import("@/components/admin/tabs/BrandedMailerTab"),
  { loading: TabLoadingSkeleton }
);
const SettingsIAMTab = dynamic(
  () => import("@/components/admin/tabs/SettingsIAMTab").then((m) => m.SettingsIAMTab),
  { loading: TabLoadingSkeleton }
);

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

export type TabKey =
  | "overview"
  | "applicants"
  | "submissions"
  | "unlocks"
  | "doubts"
  | "contacts"
  | "certificates"
  | "users"
  | "enrollments"
  | "payments"
  | "mailer"
  | "settings";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get("tab") as TabKey) || "overview";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync tab selection with URL State
  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    trackAdminAction({
      action: "tab_switched",
      category: "navigation",
      label: tab,
    });
    const url = new URL(window.location.href);
    if (tab === "overview") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }
    window.history.replaceState({}, "", url.toString());
  }, []);

  // Admin Profile & RBAC
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  // Platform Data States
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [settings, setSettings] = useState<{
    show_courses?: boolean;
    show_careers?: boolean;
    courses_enabled?: boolean;
    careers_enabled?: boolean;
  }>({
    show_courses: false,
    show_careers: false,
    courses_enabled: false,
    careers_enabled: false,
  });
  const [subAdmins, setSubAdmins] = useState<any[]>([]);

  // Count summaries for badges & KPI telemetry
  const [totalContactsCount, setTotalContactsCount] = useState(0);
  const [newContactsCount, setNewContactsCount] = useState(0);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [unlockRequestsCount, setUnlockRequestsCount] = useState(0);
  const [doubtsCount, setDoubtsCount] = useState(0);

  // Modals Root State
  const [previewResumeUrl, setPreviewResumeUrl] = useState<string | null>(null);
  const [previewResumeTitle, setPreviewResumeTitle] = useState<string>("");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Initialize theme
  useEffect(() => {
    const initTheme = getInitialTheme();
    setTheme(initTheme);
    applyTheme(initTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  // Permission Verification Helper
  const hasPermission = useCallback((permKey: string) => {
    if (!currentAdmin) return true; // optimistic while initial auth profile loads
    const isSuper = currentAdmin.is_super_admin || (currentAdmin.role || "").toLowerCase().trim() === "super_admin";
    if (isSuper) return true;

    const perms: string[] = currentAdmin.permissions || [];
    const aliasMap: Record<string, string> = {
      resolve_doubts: "doubts",
      doubt: "doubts",
      doubts_only: "doubts",
      queries: "doubts",
      manage_interns: "applications",
      applicants: "applications",
      review_submissions: "submissions",
      unlock_requests: "unlocks",
      manage_courses: "enrollments",
      registrations: "enrollments",
      courses: "enrollments",
      view_audit_logs: "payments",
      finance: "payments",
      finance_management: "payments",
      payment_management: "payments",
      send_broadcasts: "mailer",
      manage_users: "users",
      iam: "settings",
    };

    const normalized = new Set(
      perms.map((p) => aliasMap[p.toLowerCase().trim()] || p.toLowerCase().trim())
    );

    // Add implicit permissions by role
    const roleKey = (currentAdmin.role || "").toLowerCase().trim();
    if (roleKey === "finance_manager" || roleKey === "payment_management") {
      normalized.add("overview");
      normalized.add("payments");
    } else if (roleKey === "doubts_only" || roleKey === "doubt_resolver" || roleKey === "support_desk") {
      normalized.add("overview");
      normalized.add("doubts");
      normalized.add("contacts");
    } else if (roleKey === "technical_mentor") {
      normalized.add("overview");
      normalized.add("submissions");
      normalized.add("unlocks");
      normalized.add("doubts");
    } else if (roleKey === "internship_manager" || roleKey === "mentor") {
      normalized.add("overview");
      normalized.add("applications");
      normalized.add("submissions");
      normalized.add("unlocks");
      normalized.add("doubts");
      normalized.add("certificates");
    } else if (roleKey === "course_coordinator" || roleKey === "admissions") {
      normalized.add("overview");
      normalized.add("enrollments");
      normalized.add("payments");
      normalized.add("certificates");
      normalized.add("contacts");
    } else if (roleKey === "auditor") {
      normalized.add("overview");
      normalized.add("payments");
      normalized.add("submissions");
    }

    const target = aliasMap[permKey.toLowerCase().trim()] || permKey.toLowerCase().trim();
    return normalized.has(target);
  }, [currentAdmin]);

  // Fetch admin profile
  const fetchAdminProfile = useCallback(async () => {
    try {
      const res = await apiRequest<any>("/admin/me", { method: "GET" });
      if (res && (res.admin || res.email)) {
        setCurrentAdmin(res.admin || res);
      }
    } catch {
      // Ignored
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const statsRes = await apiRequest<any>("/admin/stats");
      if (statsRes) {
        setStats(statsRes.stats || statsRes);
      }
    } catch {
      // Ignored
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setRefreshing(true);

      // 1. Fetch authenticated admin profile first
      let adminObj = currentAdmin;
      try {
        const resMe = await apiRequest<any>("/admin/me");
        if (resMe) {
          adminObj = resMe.admin || resMe;
          setCurrentAdmin(adminObj);
        }
      } catch {}

      const isSuper = adminObj?.is_super_admin || (adminObj?.role || "").toLowerCase().trim() === "super_admin";
      const aliasMap: Record<string, string> = {
        resolve_doubts: "doubts",
        doubt: "doubts",
        doubts_only: "doubts",
        queries: "doubts",
        manage_interns: "applications",
        applicants: "applications",
        review_submissions: "submissions",
        unlock_requests: "unlocks",
        manage_courses: "enrollments",
        registrations: "enrollments",
        courses: "enrollments",
        view_audit_logs: "payments",
        finance: "payments",
        finance_management: "payments",
        payment_management: "payments",
        send_broadcasts: "mailer",
        manage_users: "users",
        iam: "settings",
      };

      const permsList: string[] = adminObj?.permissions || [];
      const normalizedPerms = new Set(
        permsList.map((p) => aliasMap[p.toLowerCase().trim()] || p.toLowerCase().trim())
      );

      const roleKey = (adminObj?.role || "").toLowerCase().trim();
      if (roleKey === "finance_manager" || roleKey === "payment_management") {
        normalizedPerms.add("overview");
        normalizedPerms.add("payments");
      } else if (roleKey === "doubts_only" || roleKey === "doubt_resolver" || roleKey === "support_desk") {
        normalizedPerms.add("overview");
        normalizedPerms.add("doubts");
        normalizedPerms.add("contacts");
      } else if (roleKey === "technical_mentor") {
        normalizedPerms.add("overview");
        normalizedPerms.add("submissions");
        normalizedPerms.add("unlocks");
        normalizedPerms.add("doubts");
      } else if (roleKey === "internship_manager" || roleKey === "mentor") {
        normalizedPerms.add("overview");
        normalizedPerms.add("applications");
        normalizedPerms.add("submissions");
        normalizedPerms.add("unlocks");
        normalizedPerms.add("doubts");
        normalizedPerms.add("certificates");
      } else if (roleKey === "course_coordinator" || roleKey === "admissions") {
        normalizedPerms.add("overview");
        normalizedPerms.add("enrollments");
        normalizedPerms.add("payments");
        normalizedPerms.add("certificates");
        normalizedPerms.add("contacts");
      } else if (roleKey === "auditor") {
        normalizedPerms.add("overview");
        normalizedPerms.add("payments");
        normalizedPerms.add("submissions");
      }

      const canAccess = (k: string) => isSuper || normalizedPerms.has(k);

      // Only query endpoints that the current session is authorized for
      const promises: Promise<{ key: string; data: any } | null>[] = [];

      if (canAccess("overview")) {
        promises.push(
          apiRequest<any>("/admin/stats")
            .then((data) => ({ key: "stats", data }))
            .catch(() => null)
        );
      }
      if (canAccess("users")) {
        promises.push(
          apiRequest<any>("/admin/users")
            .then((data) => ({ key: "users", data }))
            .catch(() => null)
        );
      }
      if (canAccess("enrollments")) {
        promises.push(
          apiRequest<any>("/admin/registrations")
            .then((data) => ({ key: "registrations", data }))
            .catch(() => null)
        );
      }
      if (canAccess("payments")) {
        promises.push(
          apiRequest<any>("/admin/payments")
            .then((data) => ({ key: "payments", data }))
            .catch(() => null)
        );
      }
      if (canAccess("settings")) {
        promises.push(
          apiRequest<any>("/admin/settings")
            .then((data) => ({ key: "settings", data }))
            .catch(() => null)
        );
        promises.push(
          apiRequest<any>("/admin/admins")
            .then((data) => ({ key: "admins", data }))
            .catch(() => null)
        );
      }
      if (canAccess("contacts")) {
        promises.push(
          apiRequest<any>("/admin/contacts")
            .then((data) => ({ key: "contacts", data }))
            .catch(() => null)
        );
      }
      if (canAccess("submissions")) {
        promises.push(
          apiRequest<any>("/admin/submissions")
            .then((data) => ({ key: "submissions", data }))
            .catch(() => null)
        );
      }
      if (canAccess("unlocks")) {
        promises.push(
          apiRequest<any>("/admin/unlock-requests")
            .then((data) => ({ key: "unlocks", data }))
            .catch(() => null)
        );
      }
      if (canAccess("doubts")) {
        promises.push(
          apiRequest<any>("/admin/doubts")
            .then((data) => ({ key: "doubts", data }))
            .catch(() => null)
        );
      }

      const results = await Promise.all(promises);
      for (const item of results) {
        if (!item || !item.data) continue;
        const { key, data } = item;
        if (key === "stats") setStats(data.stats || data);
        if (key === "users") setUsers(data.items || data.users || data || []);
        if (key === "registrations") setRegistrations(data.items || data.registrations || data || []);
        if (key === "payments") setPayments(data.items || data.payments || data || []);
        if (key === "settings") {
          const sData = data.settings || data || {};
          const isCourses = sData.show_courses === true || sData.show_courses === "true" || sData.courses_enabled === true;
          const isCareers = sData.show_careers === true || sData.show_careers === "true" || sData.careers_enabled === true;
          setSettings({
            show_courses: isCourses,
            show_careers: isCareers,
            courses_enabled: isCourses,
            careers_enabled: isCareers,
          });
        }
        if (key === "admins") setSubAdmins(data.admins || data || []);
        if (key === "contacts") {
          const list = data.items || data.contacts || data || [];
          setTotalContactsCount(list.length);
          setNewContactsCount(list.filter((c: any) => c.status === "pending" || !c.status).length);
        }
        if (key === "submissions") {
          const list = data.items || data.submissions || data || [];
          setSubmissionsCount(list.filter((s: any) => s.status === "submitted" || s.status === "pending").length);
        }
        if (key === "unlocks") {
          const list = data.items || data.unlock_requests || data || [];
          setUnlockRequestsCount(list.filter((u: any) => u.status === "pending").length);
        }
        if (key === "doubts") {
          const list = data.items || data.doubts || data || [];
          setDoubtsCount(list.filter((d: any) => d.status === "open" || d.status === "pending").length);
        }
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [currentAdmin]);

  useEffect(() => {
    fetchAdminProfile();
    fetchAllData();
  }, [fetchAdminProfile, fetchAllData]);

  // Operations Handlers
  const handleRegistrationStatusChange = async (regId: string, status: "approved" | "rejected") => {
    await apiRequest(`/admin/registrations/${regId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    fetchAllData();
  };

  const handleUpdateSetting = async (key: string, value: boolean) => {
    await apiRequest(`/admin/settings`, {
      method: "PATCH",
      body: JSON.stringify({ [key]: value }),
    });

    const isCourses =
      key === "show_courses" || key === "courses_enabled"
        ? value
        : (settings.show_courses ?? settings.courses_enabled ?? false);

    const isCareers =
      key === "show_careers" || key === "careers_enabled"
        ? value
        : (settings.show_careers ?? settings.careers_enabled ?? false);

    setSettings({
      show_courses: isCourses,
      show_careers: isCareers,
      courses_enabled: isCourses,
      careers_enabled: isCareers,
    });

    // Broadcast change to Navbar, Footer, and public pages
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("site-settings-changed"));
      try {
        localStorage.setItem("site_settings_updated", Date.now().toString());
      } catch {}
    }
  };

  const handleSaveSubAdmin = async (adminData: any) => {
    if (adminData.id) {
      await apiRequest(`/admin/admins/${adminData.id}`, {
        method: "PATCH",
        body: JSON.stringify(adminData),
      });
    } else {
      await apiRequest(`/admin/admins`, {
        method: "POST",
        body: JSON.stringify(adminData),
      });
    }
    fetchAllData();
  };

  const handleToggleSubAdminStatus = async (adminId: string, isActive: boolean) => {
    await apiRequest(`/admin/admins/${adminId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
    });
    fetchAllData();
  };

  const handleDeleteSubAdmin = async (adminId: string) => {
    await apiRequest(`/admin/admins/${adminId}`, {
      method: "DELETE",
    });
    fetchAllData();
  };

  const handleDeleteUser = async (userId: string | number) => {
    await apiRequest(`/admin/users/${userId}`, {
      method: "DELETE",
    });
    fetchAllData();
  };

  const handleUpdateUserRole = async (userId: string | number, newRole: string) => {
    await apiRequest(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: newRole }),
    });
    fetchAllData();
  };

  const handleDeleteRegistration = async (regId: string | number) => {
    await apiRequest(`/admin/registrations/${regId}`, {
      method: "DELETE",
    });
    fetchAllData();
  };

  const handleDeletePayment = async (pmtId: string | number) => {
    await apiRequest(`/admin/payments/${pmtId}`, {
      method: "DELETE",
    });
    fetchAllData();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_email");
    router.push("/admin/login");
  };

  const TAB_PERMISSION_MAP: Record<TabKey, string> = {
    overview: "overview",
    applicants: "applications",
    submissions: "submissions",
    unlocks: "unlocks",
    doubts: "doubts",
    contacts: "contacts",
    certificates: "certificates",
    users: "users",
    enrollments: "enrollments",
    payments: "payments",
    mailer: "mailer",
    settings: "settings",
  };

  // Modular Navigation Groups filtered by active role permissions
  const navGroups: NavGroup[] = useMemo(() => {
    const rawGroups: {
      groupTitle: string;
      items: { key: TabKey; label: string; icon: React.ReactNode; count?: number; badge?: string; perm: string }[];
    }[] = [
      {
        groupTitle: "Core & Platform",
        items: [
          { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" />, perm: "overview" },
          { key: "users", label: "User Accounts", icon: <Key className="w-4 h-4" />, perm: "users" },
          { key: "settings", label: "IAM & Roles", icon: <Shield className="w-4 h-4" />, badge: "Admin", perm: "settings" },
        ],
      },
      {
        groupTitle: "Internships & Portal",
        items: [
          {
            key: "applicants",
            label: "Applications",
            icon: <Users className="w-4 h-4" />,
            count: stats?.total_applications,
            perm: "applications",
          },
          {
            key: "submissions",
            label: "Submissions",
            icon: <FolderGit2 className="w-4 h-4" />,
            count: submissionsCount,
            perm: "submissions",
          },
          {
            key: "unlocks",
            label: "Unlock Requests",
            icon: <Unlock className="w-4 h-4" />,
            count: unlockRequestsCount,
            perm: "unlocks",
          },
          {
            key: "doubts",
            label: "Doubts Desk",
            icon: <HelpCircle className="w-4 h-4" />,
            count: doubtsCount,
            perm: "doubts",
          },
          { key: "certificates", label: "Certificates", icon: <Award className="w-4 h-4" />, perm: "certificates" },
        ],
      },
      {
        groupTitle: "Academics & Operations",
        items: [
          {
            key: "enrollments",
            label: "Course Enrollments",
            icon: <BookOpen className="w-4 h-4" />,
            count: registrations.filter((r) => r.status === "pending").length,
            perm: "enrollments",
          },
          { key: "payments", label: "Payments Audit", icon: <CreditCard className="w-4 h-4" />, perm: "payments" },
          {
            key: "contacts",
            label: "Contact Inquiries",
            icon: <MessageSquare className="w-4 h-4" />,
            count: newContactsCount,
            perm: "contacts",
          },
          { key: "mailer", label: "Branded Dispatcher", icon: <Mail className="w-4 h-4" />, perm: "mailer" },
        ],
      },
    ];

    return rawGroups
      .map((group) => ({
        groupTitle: group.groupTitle,
        items: group.items.filter((item) => hasPermission(item.perm)),
      }))
      .filter((group) => group.items.length > 0);
  }, [stats, submissionsCount, unlockRequestsCount, doubtsCount, registrations, newContactsCount, hasPermission]);

  // Auto-route to first permitted tab if active tab is unauthorized
  useEffect(() => {
    if (!currentAdmin) return;
    const requiredPerm = TAB_PERMISSION_MAP[activeTab];
    if (requiredPerm && !hasPermission(requiredPerm)) {
      const firstGroup = navGroups[0];
      const firstPermitted = firstGroup?.items[0]?.key;
      if (firstPermitted && firstPermitted !== activeTab) {
        handleTabChange(firstPermitted);
      }
    }
  }, [currentAdmin, activeTab, hasPermission, navGroups, handleTabChange]);

  // Tab Header Details
  const tabInfo: Record<TabKey, { title: string; subtitle: string; icon: React.ReactNode }> = {
    overview: {
      title: "Overview",
      subtitle: "Platform KPI telemetry, analytics summaries, and live system status.",
      icon: <LayoutDashboard className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    },
    applicants: {
      title: "Applications",
      subtitle: "Review candidate profiles, download resumes, and manage acceptance status.",
      icon: <Users className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    },
    submissions: {
      title: "Task Submissions",
      subtitle: "Audit student project milestones, GitHub repositories, and live demo URLs.",
      icon: <FolderGit2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    },
    unlocks: {
      title: "Unlock Requests",
      subtitle: "Authorize early access to time-gated curriculum modules and advance tasks.",
      icon: <Unlock className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    },
    doubts: {
      title: "Doubts Helpdesk",
      subtitle: "Respond to technical inquiries, inspect code snippets, and assist students.",
      icon: <HelpCircle className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    },
    contacts: {
      title: "Contact Inquiries",
      subtitle: "Manage corporate partnerships, student queries, and reply via Brevo SMTP.",
      icon: <MessageSquare className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    },
    certificates: {
      title: "Digital Certificates",
      subtitle: "Generate tamper-proof credentials and manage the public verification registry.",
      icon: <Award className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    },
    users: {
      title: "User Accounts",
      subtitle: "Manage student accounts, credentials, authentication providers, and roles.",
      icon: <Key className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    },
    enrollments: {
      title: "Course Enrollments",
      subtitle: "Review bootcamp registrations, grant access, and monitor student intake.",
      icon: <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    },
    payments: {
      title: "Payments Audit",
      subtitle: "Cashfree financial transaction ledger, payment verification, and order auditing.",
      icon: <CreditCard className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    },
    mailer: {
      title: "Branded Dispatcher",
      subtitle: "Send rich HTML broadcast newsletters and notifications to students.",
      icon: <Mail className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    },
    settings: {
      title: "IAM & Platform Settings",
      subtitle: "Admin access controls, sub-admin role assignment, and platform feature flags.",
      icon: <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
    },
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F8F9FA] dark:bg-ink-950 text-gray-900 dark:text-ink-50 transition-colors duration-200">
      {/* Topbar Component */}
      <AdminTopbar
        currentAdmin={currentAdmin}
        theme={theme}
        refreshing={refreshing}
        onToggleTheme={toggleTheme}
        onRefreshData={fetchAllData}
        onNavigateTab={(tab) => handleTabChange(tab as TabKey)}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Component */}
        <AdminSidebar
          navGroups={navGroups}
          activeTab={activeTab}
          sidebarCollapsed={sidebarCollapsed}
          mobileMenuOpen={mobileMenuOpen}
          searchQuery={searchQuery}
          onSelectTab={handleTabChange}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
          onSearchChange={setSearchQuery}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] dark:bg-ink-950">
          <AdminContainer size="2xl" gutter={false} className="space-y-6">
            {/* Header Banner */}
            <AdminPageHeader
              title={tabInfo[activeTab]?.title}
              subtitle={tabInfo[activeTab]?.subtitle}
              icon={tabInfo[activeTab]?.icon}
              refreshing={refreshing}
              onRefresh={fetchAllData}
            />

            {/* Tab Content Display with Error Boundary Isolation */}
            <AdminErrorBoundary fallbackTitle={`Error rendering ${tabInfo[activeTab]?.title}`}>
              {loading ? (
                <TabLoadingSkeleton />
              ) : !hasPermission(TAB_PERMISSION_MAP[activeTab]) ? (
                <div className="p-8 sm:p-12 text-center rounded-2xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950 space-y-4 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                    <Shield className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Access Restricted
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-ink-400 max-w-md mx-auto leading-relaxed">
                    Your sub-admin operator account does not have authorization to view or manage the{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">{tabInfo[activeTab]?.title}</span> module.
                    Please contact your Super Admin to request additional role permissions.
                  </p>
                </div>
              ) : (
                <>
                  {activeTab === "overview" && (
                    <OverviewTab
                      stats={stats}
                      totalContactsCount={totalContactsCount}
                      newContactsCount={newContactsCount}
                      submissionsCount={submissionsCount}
                      unlockRequestsCount={unlockRequestsCount}
                      doubtsCount={doubtsCount}
                      onNavigateTab={(tab) => handleTabChange(tab as TabKey)}
                      hasPermission={hasPermission}
                    />
                  )}

                  {activeTab === "applicants" && (
                    <ApplicantsTab
                      onPreviewResume={(url, name) => {
                        setPreviewResumeUrl(url);
                        setPreviewResumeTitle(name);
                      }}
                      getResumeUrl={getResumeUrl}
                      onRefreshStats={fetchStats}
                    />
                  )}

                  {activeTab === "submissions" && <SubmissionsTab />}

                  {activeTab === "unlocks" && <UnlockRequestsTab />}

                  {activeTab === "doubts" && (
                    <DoubtsHelpdeskTab onZoomImage={(url) => setExpandedImage(url)} />
                  )}

                  {activeTab === "contacts" && <ContactsTab onRefreshStats={fetchStats} />}

                  {activeTab === "certificates" && <CertificatesTab />}

                  {activeTab === "users" && (
                    <UsersTab
                      users={users}
                      onDeleteUser={handleDeleteUser}
                      onUpdateUserRole={handleUpdateUserRole}
                    />
                  )}

                  {activeTab === "enrollments" && (
                    <CourseEnrollmentsTab
                      registrations={registrations}
                      onStatusChange={handleRegistrationStatusChange}
                      onDeleteRegistration={handleDeleteRegistration}
                    />
                  )}

                  {activeTab === "payments" && (
                    <PaymentsAuditTab
                      payments={payments}
                      onDeletePayment={handleDeletePayment}
                    />
                  )}

                  {activeTab === "mailer" && <BrandedMailerTab />}

                  {activeTab === "settings" && (
                    <SettingsIAMTab
                      settings={settings}
                      onUpdateSetting={handleUpdateSetting}
                      currentAdmin={currentAdmin}
                      subAdmins={subAdmins}
                      onSaveSubAdmin={handleSaveSubAdmin}
                      onToggleSubAdminStatus={handleToggleSubAdminStatus}
                      onDeleteSubAdmin={handleDeleteSubAdmin}
                    />
                  )}
                </>
              )}
            </AdminErrorBoundary>
          </AdminContainer>
        </main>
      </div>

      {/* Global Modal Viewers */}
      <ResumePreviewModal
        resume={previewResumeUrl ? { url: previewResumeUrl, name: previewResumeTitle } : null}
        onClose={() => {
          setPreviewResumeUrl(null);
          setPreviewResumeTitle("");
        }}
      />

      <ImageLightboxModal
        imageUrl={expandedImage}
        onClose={() => setExpandedImage(null)}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<TabLoadingSkeleton />}>
        <AdminDashboardContent />
      </Suspense>
    </AuthGuard>
  );
}
