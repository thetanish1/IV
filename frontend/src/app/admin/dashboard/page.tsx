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
    localStorage.removeItem("admin_email");
    router.push("/admin/login");
  };

  // Modular Navigation Groups
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
