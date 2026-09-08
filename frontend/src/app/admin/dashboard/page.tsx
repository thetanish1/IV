"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  LogOut,
  Users,
  CreditCard,
  BookOpen,
  FileText,
  MessageSquare,
  Unlock,
  Key,
  Award,
  Settings as SettingsIcon,
  HelpCircle,
  LayoutDashboard,
  Mail,
  RefreshCw,
  FolderGit2,
  Search,
  Sun,
  Moon,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Activity,
  Layers,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  SlidersHorizontal
} from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import AuthGuard from "@/components/AuthGuard";
import { getInitialTheme, applyTheme } from "@/lib/theme";

// Modals & Common
import { ResumePreviewModal, ImageLightboxModal } from "@/components/admin/common";

// Tab Components
import {
  OverviewTab,
  ApplicantsTab,
  SubmissionsTab,
  UnlockRequestsTab,
  DoubtsHelpdeskTab,
  ContactsTab,
  CertificatesTab,
  UsersTab,
  CourseEnrollmentsTab,
  PaymentsAuditTab,
  BrandedMailerTab,
  SettingsIAMTab,
} from "@/components/admin/tabs";

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

interface NavGroup {
  groupTitle: string;
  items: {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    count?: number;
    badge?: string;
  }[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Admin Profile & RBAC
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  // Platform Data States
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [settings, setSettings] = useState<{ courses_enabled?: boolean; careers_enabled?: boolean }>({
    courses_enabled: true,
    careers_enabled: true,
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
      const [
        statsRes,
        usersRes,
        regsRes,
        paymentsRes,
        settingsRes,
        subAdminsRes,
        contactsRes,
        subsRes,
        unlocksRes,
        doubtsRes,
      ] = await Promise.allSettled([
        apiRequest<any>("/admin/stats"),
        apiRequest<any>("/admin/users"),
        apiRequest<any>("/admin/registrations"),
        apiRequest<any>("/admin/payments"),
        apiRequest<any>("/admin/settings"),
        apiRequest<any>("/admin/admins"),
        apiRequest<any>("/admin/contacts"),
        apiRequest<any>("/admin/submissions"),
        apiRequest<any>("/admin/unlock-requests"),
        apiRequest<any>("/admin/doubts"),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value) {
        setStats(statsRes.value.stats || statsRes.value);
      }
      if (usersRes.status === "fulfilled" && usersRes.value) {
        setUsers(usersRes.value.items || usersRes.value.users || usersRes.value || []);
      }
      if (regsRes.status === "fulfilled" && regsRes.value) {
        setRegistrations(regsRes.value.items || regsRes.value.registrations || regsRes.value || []);
      }
      if (paymentsRes.status === "fulfilled" && paymentsRes.value) {
        setPayments(paymentsRes.value.items || paymentsRes.value.payments || paymentsRes.value || []);
      }
      if (settingsRes.status === "fulfilled" && settingsRes.value) {
        setSettings(settingsRes.value.settings || settingsRes.value || {});
      }
      if (subAdminsRes.status === "fulfilled" && subAdminsRes.value) {
        setSubAdmins(subAdminsRes.value.admins || subAdminsRes.value || []);
      }
      if (contactsRes.status === "fulfilled" && contactsRes.value) {
        const list = contactsRes.value.items || contactsRes.value.contacts || contactsRes.value || [];
        setTotalContactsCount(list.length);
        setNewContactsCount(list.filter((c: any) => c.status === "pending" || !c.status).length);
      }
      if (subsRes.status === "fulfilled" && subsRes.value) {
        const list = subsRes.value.items || subsRes.value.submissions || subsRes.value || [];
        setSubmissionsCount(list.filter((s: any) => s.status === "submitted" || s.status === "pending").length);
      }
      if (unlocksRes.status === "fulfilled" && unlocksRes.value) {
        const list = unlocksRes.value.items || unlocksRes.value.unlock_requests || unlocksRes.value || [];
        setUnlockRequestsCount(list.filter((u: any) => u.status === "pending").length);
      }
      if (doubtsRes.status === "fulfilled" && doubtsRes.value) {
        const list = doubtsRes.value.items || doubtsRes.value.doubts || doubtsRes.value || [];
        setDoubtsCount(list.filter((d: any) => d.status === "open" || d.status === "pending").length);
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

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
    setSettings((prev) => ({ ...prev, [key]: value }));
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
    router.push("/admin/login");
  };

  // Navigation Groups modeled after Cloudflare Dashboard Hierarchy
  const navGroups: NavGroup[] = useMemo(() => [
    {
      groupTitle: "Core & Platform",
      items: [
        { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
        { key: "users", label: "User Accounts", icon: <Key className="w-4 h-4" /> },
        { key: "settings", label: "IAM & Roles", icon: <Shield className="w-4 h-4" />, badge: "Admin" },
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
        },
        {
          key: "submissions",
          label: "Submissions",
          icon: <FolderGit2 className="w-4 h-4" />,
          count: submissionsCount,
        },
        {
          key: "unlocks",
          label: "Unlock Requests",
          icon: <Unlock className="w-4 h-4" />,
          count: unlockRequestsCount,
        },
        {
          key: "doubts",
          label: "Doubts Desk",
          icon: <HelpCircle className="w-4 h-4" />,
          count: doubtsCount,
        },
        { key: "certificates", label: "Certificates", icon: <Award className="w-4 h-4" /> },
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
        },
        { key: "payments", label: "Payments Audit", icon: <CreditCard className="w-4 h-4" /> },
        {
          key: "contacts",
          label: "Contact Inquiries",
          icon: <MessageSquare className="w-4 h-4" />,
          count: newContactsCount,
        },
        { key: "mailer", label: "Branded Dispatcher", icon: <Mail className="w-4 h-4" /> },
      ],
    },
  ], [stats, submissionsCount, unlockRequestsCount, doubtsCount, registrations, newContactsCount]);

  // Active Tab Info Header
  const tabInfo: Record<TabKey, { title: string; subtitle: string; icon: React.ReactNode }> = {
    overview: {
      title: "Overview",
      subtitle: "Platform KPI telemetry, analytics summaries, and live system status.",
      icon: <LayoutDashboard className="w-5 h-5 text-cf-orange" />,
    },
    applicants: {
      title: "Applications",
      subtitle: "Review candidate profiles, download resumes, and manage acceptance status.",
      icon: <Users className="w-5 h-5 text-cf-orange" />,
    },
    submissions: {
      title: "Task Submissions",
      subtitle: "Audit student project milestones, GitHub repositories, and live demo URLs.",
      icon: <FolderGit2 className="w-5 h-5 text-cf-orange" />,
    },
    unlocks: {
      title: "Unlock Requests",
      subtitle: "Authorize early access to time-gated curriculum modules and advance tasks.",
      icon: <Unlock className="w-5 h-5 text-cf-orange" />,
    },
    doubts: {
      title: "Doubts Helpdesk",
      subtitle: "Respond to technical inquiries, inspect code snippets, and assist students.",
      icon: <HelpCircle className="w-5 h-5 text-cf-orange" />,
    },
    contacts: {
      title: "Contact Inquiries",
      subtitle: "Manage corporate partnerships, student queries, and reply via Brevo SMTP.",
      icon: <MessageSquare className="w-5 h-5 text-cf-orange" />,
    },
    certificates: {
      title: "Digital Certificates",
      subtitle: "Generate tamper-proof credentials and manage the public verification registry.",
      icon: <Award className="w-5 h-5 text-cf-orange" />,
    },
    users: {
      title: "User Accounts",
      subtitle: "Manage student accounts, credentials, authentication providers, and roles.",
      icon: <Key className="w-5 h-5 text-cf-orange" />,
    },
    enrollments: {
      title: "Course Enrollments",
      subtitle: "Review bootcamp registrations, grant access, and monitor student intake.",
      icon: <BookOpen className="w-5 h-5 text-cf-orange" />,
    },
    payments: {
      title: "Payments Audit",
      subtitle: "Razorpay financial transaction ledger, payment verification, and order auditing.",
      icon: <CreditCard className="w-5 h-5 text-cf-orange" />,
    },
    mailer: {
      title: "Branded Dispatcher",
      subtitle: "Send rich HTML broadcast newsletters and notifications to students.",
      icon: <Mail className="w-5 h-5 text-cf-orange" />,
    },
    settings: {
      title: "IAM & Platform Settings",
      subtitle: "Admin access controls, sub-admin role assignment, and platform feature flags.",
      icon: <Shield className="w-5 h-5 text-cf-orange" />,
    },
  };

  return (
    <AuthGuard>
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === "dark" 
          ? "bg-[#121214] text-[#EDEDED]" 
          : "bg-[#F7F7F8] text-[#111827]"
      }`}>
        {/* ─── CLOUDFLARE TOPBAR ────────────────────────────────────────── */}
        <header className={`sticky top-0 z-50 h-14 border-b flex items-center justify-between px-4 sm:px-6 transition-colors duration-200 backdrop-blur-md ${
          theme === "dark"
            ? "bg-[#18181B]/95 border-[#27272A] text-[#EDEDED]"
            : "bg-white/95 border-[#E5E7EB] text-[#111827]"
        }`}>
          {/* Topbar Left: Brand / Account Selector */}
          <div className="flex items-center gap-3">
            {/* Cloudflare Orange Cloud Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("overview")}>
              <div className="w-8 h-8 rounded-lg bg-[#F38020] flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                </svg>
              </div>
              <span className="font-semibold text-sm tracking-tight hidden md:inline">
                InternVision <span className="text-[#F38020]">Tech</span>
              </span>
            </div>

            {/* Account Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  theme === "dark"
                    ? "border-[#2E2E33] bg-[#222226] text-[#E0E0E0] hover:bg-[#2A2A30]"
                    : "border-[#E5E7EB] bg-[#F9FAFB] text-[#374151] hover:bg-[#F3F4F6]"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="max-w-[150px] truncate">{currentAdmin?.email || "Enterprise Admin"}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {accountDropdownOpen && (
                <div
                  className={`absolute left-0 mt-1.5 w-64 rounded-lg shadow-xl border py-1 z-50 text-xs ${
                    theme === "dark"
                      ? "bg-[#1E1E22] border-[#2E2E33] text-[#EDEDED]"
                      : "bg-white border-[#E5E7EB] text-[#111827]"
                  }`}
                >
                  <div className="px-3 py-2 border-b border-inherit font-medium opacity-70">
                    Active Account
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="font-semibold">{currentAdmin?.full_name || "Admin"}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F38020]/10 text-[#F38020]">
                      {currentAdmin?.role || "super_admin"}
                    </span>
                  </div>
                  <div className="px-3 pb-2 text-[11px] text-gray-500 truncate">
                    {currentAdmin?.email}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Topbar Right: Search trigger, Ask AI, Theme Toggle, Support, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Ask AI Button (Cloudflare Style) */}
            <button
              onClick={() => setActiveTab("doubts")}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                theme === "dark"
                  ? "border-[#2E2E33] bg-[#222226] text-[#EDEDED] hover:border-[#F38020]/50"
                  : "border-[#E5E7EB] bg-white text-[#374151] hover:border-[#F38020]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F38020]" />
              <span>Ask AI</span>
            </button>

            {/* Support / Documentation Link */}
            <button
              onClick={() => window.open("/docs", "_blank")}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                theme === "dark"
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Support</span>
            </button>

            {/* Theme Switcher Toggle (Light / Dark mode) */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md border text-xs font-medium transition-colors flex items-center justify-center ${
                theme === "dark"
                  ? "border-[#2E2E33] bg-[#222226] text-amber-400 hover:bg-[#2A2A30]"
                  : "border-[#E5E7EB] bg-white text-gray-700 hover:bg-[#F3F4F6]"
              }`}
              title={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Refresh Telemetry Button */}
            <button
              onClick={fetchAllData}
              disabled={refreshing}
              className={`p-2 rounded-md border text-xs font-medium transition-colors ${
                theme === "dark"
                  ? "border-[#2E2E33] bg-[#222226] text-gray-300 hover:text-white hover:bg-[#2A2A30]"
                  : "border-[#E5E7EB] bg-white text-gray-700 hover:bg-[#F3F4F6]"
              }`}
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#F38020]" : ""}`} />
            </button>

            {/* Profile Avatar & Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F38020] to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-sm"
              >
                {(currentAdmin?.full_name || currentAdmin?.email || "A").slice(0, 1).toUpperCase()}
              </button>

              {profileDropdownOpen && (
                <div
                  className={`absolute right-0 mt-1.5 w-48 rounded-lg shadow-xl border py-1 z-50 text-xs ${
                    theme === "dark"
                      ? "bg-[#1E1E22] border-[#2E2E33] text-[#EDEDED]"
                      : "bg-white border-[#E5E7EB] text-[#111827]"
                  }`}
                >
                  <div className="px-3 py-2 border-b border-inherit">
                    <p className="font-semibold truncate">{currentAdmin?.full_name || "Admin"}</p>
                    <p className="text-[10px] text-gray-500 truncate">{currentAdmin?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("settings");
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" />
                    <span>IAM Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 hover:bg-rose-500/10 text-rose-500 flex items-center gap-2 border-t border-inherit"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── CLOUDFLARE MAIN APP CONTAINER ────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">
          {/* ─── LEFT SIDEBAR ─────────────────────────────────────────── */}
          <aside
            className={`flex-shrink-0 border-r transition-all duration-200 flex flex-col justify-between ${
              sidebarCollapsed ? "w-16" : "w-64"
            } ${
              theme === "dark"
                ? "bg-[#161619] border-[#27272A]"
                : "bg-[#FFFFFF] border-[#E5E7EB]"
            }`}
          >
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
              {/* Quick Search Input */}
              {!sidebarCollapsed && (
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="text"
                    placeholder="Quick search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-8 pr-12 py-1.5 rounded-md text-xs border outline-none transition-colors ${
                      theme === "dark"
                        ? "bg-[#1F1F23] border-[#2E2E33] text-[#EDEDED] focus:border-[#F38020]"
                        : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827] focus:border-[#F38020]"
                    }`}
                  />
                  <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1 py-0.2 rounded border ${
                    theme === "dark"
                      ? "border-[#2E2E33] bg-[#2A2A30] text-gray-400"
                      : "border-gray-200 bg-gray-100 text-gray-500"
                  }`}>
                    Ctrl K
                  </span>
                </div>
              )}

              {/* Grouped Navigation Links */}
              {navGroups.map((group, gIdx) => {
                const filteredItems = group.items.filter(
                  (i) => !searchQuery || i.label.toLowerCase().includes(searchQuery.toLowerCase())
                );
                if (filteredItems.length === 0) return null;

                return (
                  <div key={gIdx} className="space-y-1">
                    {!sidebarCollapsed && (
                      <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {group.groupTitle}
                      </div>
                    )}

                    {filteredItems.map((item) => {
                      const isActive = activeTab === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => setActiveTab(item.key)}
                          title={sidebarCollapsed ? item.label : undefined}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                            isActive
                              ? theme === "dark"
                                ? "bg-[#25252A] text-white shadow-sm font-semibold border-l-2 border-[#F38020]"
                                : "bg-[#F3F4F6] text-[#111827] font-semibold border-l-2 border-[#F38020]"
                              : theme === "dark"
                              ? "text-[#A1A1AA] hover:text-white hover:bg-[#1F1F23]"
                              : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={isActive ? "text-[#F38020]" : "opacity-70"}>
                              {item.icon}
                            </span>
                            {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                          </div>

                          {!sidebarCollapsed && (
                            <div className="flex items-center gap-1.5">
                              {item.badge && (
                                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                  theme === "dark"
                                    ? "bg-[#2E2E33] text-gray-300"
                                    : "bg-gray-200 text-gray-700"
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                              {item.count !== undefined && item.count > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                  isActive
                                    ? "bg-[#F38020] text-white"
                                    : "bg-[#F38020]/15 text-[#F38020]"
                                }`}>
                                  {item.count}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Bottom Sidebar Collapse Action */}
            <div className={`p-2 border-t ${
              theme === "dark" ? "border-[#27272A]" : "border-[#E5E7EB]"
            }`}>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`w-full flex items-center justify-center p-1.5 rounded-md text-xs text-gray-400 hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <div className="flex items-center gap-2 w-full px-2 text-xs">
                    <PanelLeftClose className="w-4 h-4" />
                    <span>Collapse menu</span>
                  </div>
                )}
              </button>
            </div>
          </aside>

          {/* ─── MAIN CONTENT CANVAS ──────────────────────────────────── */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Cloudflare Header Card Banner */}
              <div className={`p-6 rounded-xl border transition-colors ${
                theme === "dark"
                  ? "bg-[#18181B] border-[#27272A]"
                  : "bg-white border-[#E5E7EB] shadow-sm"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-lg border ${
                      theme === "dark"
                        ? "bg-[#222226] border-[#2E2E33]"
                        : "bg-[#FFF5EB] border-[#FED7AA]"
                    }`}>
                      {tabInfo[activeTab]?.icon}
                    </div>
                    <div>
                      <h1 className="text-xl font-bold tracking-tight">
                        {tabInfo[activeTab]?.title}
                      </h1>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {tabInfo[activeTab]?.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open("/docs", "_blank")}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                        theme === "dark"
                          ? "border-[#2E2E33] bg-[#222226] text-gray-300 hover:text-white"
                          : "border-[#E5E7EB] bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Documentation</span>
                    </button>

                    <button
                      onClick={fetchAllData}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#F38020] hover:bg-[#FA8B28] text-white shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                      <span>Sync Data</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab Content Display */}
              {loading ? (
                <div className={`p-16 rounded-xl border text-center space-y-3 ${
                  theme === "dark" ? "bg-[#18181B] border-[#27272A]" : "bg-white border-[#E5E7EB]"
                }`}>
                  <div className="w-8 h-8 border-2 border-[#F38020]/20 border-t-[#F38020] rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-400">Loading Cloudflare telemetry & security state...</p>
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
                      onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
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
            </div>
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
    </AuthGuard>
  );
}
