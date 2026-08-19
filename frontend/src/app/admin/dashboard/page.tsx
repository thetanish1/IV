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
  Eye,
  EyeOff,
  Key,
} from "lucide-react";
import {
  DashboardStats,
  PaginatedResult,
  InternshipApplicationResponse,
  PaymentItem,
  SiteUserItem,
} from "@/types";
import { apiRequest } from "@/lib/api-client";
import { formatINR } from "@/lib/utils";
import { FadeIn } from "@/components/animations/FadeIn";
import AuthGuard from "@/components/AuthGuard";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "applications" | "users" | "payments">("overview");

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

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

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000/api"
  ).replace(/\/$/, "");

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "applications" || activeTab === "overview") {
      fetchApplications();
    }
    if (activeTab === "users" || activeTab === "overview") {
      fetchUsers();
    }
    if (activeTab === "payments" || activeTab === "overview") {
      fetchPayments();
    }
  }, [activeTab, appsSearch, appsDuration, appsPage, usersSearch, usersProvider, usersPage, pmtSearch, pmtStatus, pmtPage]);

  const fetchStats = async () => {
    try {
      const data = await apiRequest<DashboardStats>("/admin/stats");
      setStats(data);
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("admin_email");
      router.push("/admin/login");
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
      setAppsData(data);
    } catch (err) {
      console.error(err);
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
      setUsersData(data);
    } catch (err) {
      console.error(err);
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
      setPaymentsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
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
        items: prev.items.map((item) => (item.id === appId ? { ...item, status: newStatus } : item)),
      }));
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdatingStatus(false);
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-ink-50 font-sans selection:bg-brand-500/30 pb-20">
        {/* TOP BAR */}
        <header className="border-b border-ink-800 bg-ink-950/80 sticky top-0 z-40 backdrop-blur-xl">
          <div className="max-w-[90rem] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-800 flex items-center justify-center text-brand-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight text-white">Admin Dashboard</h1>
                <div className="text-[10px] text-ink-400">Super Admin: tanishdewase222@gmail.com</div>
              </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            </div>
          </FadeIn>

          {/* NAVIGATION TABS */}
          <div className="flex items-center gap-6 border-b border-ink-800">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "overview" ? "text-white" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              Overview
              {activeTab === "overview" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 relative ${
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
              onClick={() => setActiveTab("users")}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 relative ${
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
              onClick={() => setActiveTab("payments")}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 relative ${
                activeTab === "payments" ? "text-white" : "text-ink-400 hover:text-ink-200"
              }`}
            >
              Payments
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-ink-800 text-ink-300">
                {stats?.total_payments || 0}
              </span>
              {activeTab === "payments" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500 rounded-t-full" />}
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
                                  <a
                                    href={`${apiBase}/applications/resume/${app.resume_filename}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-600/10 hover:bg-brand-600/20 border border-brand-500/30 text-brand-400 rounded text-xs font-semibold transition"
                                  >
                                    <FileText className="w-3.5 h-3.5" /> Resume PDF
                                  </a>
                                ) : (
                                  <span className="text-xs text-ink-500">No file</span>
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
                                <button
                                  onClick={() => setSelectedApp(app)}
                                  className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-white rounded text-xs font-semibold border border-ink-700 flex items-center gap-1.5 transition"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Review
                                </button>
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

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-ink-800 bg-ink-900/30">
                    <span className="text-xs text-ink-400">
                      Showing {paymentsData.page} of {paymentsData.total_pages}
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
        </div>

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

                <div className="flex items-center gap-2">
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

              {/* Resume Download Action */}
              <div className="pt-4 border-t border-ink-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Candidate Resume Document</div>
                  <div className="text-[11px] text-ink-400">
                    {selectedApp.resume_filename ? "Attached and verified" : "No resume uploaded"}
                  </div>
                </div>

                {selectedApp.resume_filename ? (
                  <a
                    href={`${apiBase}/applications/resume/${selectedApp.resume_filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-sm font-bold flex items-center gap-2 transition shadow-[2px_2px_0px_#ffffff]"
                  >
                    <Download className="w-4 h-4" /> Download & View Resume PDF
                  </a>
                ) : (
                  <span className="text-xs text-ink-500 italic">No resume provided</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
