"use client";

import React, { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import AuthGuard from "@/components/AuthGuard";

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

type TabKey =
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Fetch admin profile
  const fetchAdminProfile = useCallback(async () => {
    try {
      const res = await apiRequest<any>("/admin/me", { method: "GET" });
      if (res && (res.admin || res.email)) {
        setCurrentAdmin(res.admin || res);
      }
    } catch {
      // Ignored - AuthGuard handles session
    }
  }, []);

  // Fetch telemetry and datasets
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

  const navItems: {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "applicants", label: "Applications", icon: <Users className="w-4 h-4" /> },
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
    {
      key: "contacts",
      label: "Contact Inquiries",
      icon: <MessageSquare className="w-4 h-4" />,
      count: newContactsCount,
    },
    { key: "certificates", label: "Certificates", icon: <Award className="w-4 h-4" /> },
    { key: "users", label: "User Accounts", icon: <Key className="w-4 h-4" /> },
    {
      key: "enrollments",
      label: "Course Enrollments",
      icon: <BookOpen className="w-4 h-4" />,
      count: registrations.filter((r) => r.status === "pending").length,
    },
    { key: "payments", label: "Payments Audit", icon: <CreditCard className="w-4 h-4" /> },
    { key: "mailer", label: "Branded Dispatcher", icon: <Mail className="w-4 h-4" /> },
    { key: "settings", label: "IAM & Settings", icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-3.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wide text-white flex items-center gap-2">
                <span>INTERNSHIP PORTAL</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest">
                  Enterprise IAM
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Logged in as: <span className="text-slate-200 font-medium">{currentAdmin?.email || "Super Admin"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Sub-Nav / Tabs Bar */}
        <div className="bg-slate-900/40 border-b border-white/5 px-6 py-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    isActive
                      ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? "bg-white text-cyan-600" : "bg-cyan-500/20 text-cyan-400"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Synchronizing portal records & security state...</p>
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
        </main>

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
