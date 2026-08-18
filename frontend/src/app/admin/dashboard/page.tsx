"use client";

import { useEffect, useState } from"react";
import { useRouter } from"next/navigation";
import {
 Shield, LogOut, Users, CreditCard, BookOpen, Download, Search, Filter,
 ChevronLeft, ChevronRight, Loader2, DollarSign, CheckCircle2, Clock
} from"lucide-react";
import { DashboardStats, PaginatedResult, InternshipApplicationResponse, PaymentItem } from"@/types";
import { apiRequest } from"@/lib/api-client";
import { formatINR } from"@/lib/utils";
import { FadeIn } from "@/components/animations/FadeIn";
import AuthGuard from "@/components/AuthGuard";

export default function AdminDashboardPage() {
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<"overview"|"applications"|"payments"|"registrations">("overview");

 const [stats, setStats] = useState<DashboardStats | null>(null);
 const [loadingStats, setLoadingStats] = useState(true);

 // Applications Table State
 const [appsData, setAppsData] = useState<PaginatedResult<InternshipApplicationResponse>>({ total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
 const [appsSearch, setAppsSearch] = useState("");
 const [appsDuration, setAppsDuration] = useState("all");
 const [appsPage, setAppsPage] = useState(1);
 const [loadingApps, setLoadingApps] = useState(false);

 // Payments Table State
 const [paymentsData, setPaymentsData] = useState<PaginatedResult<PaymentItem>>({ total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
 const [pmtSearch, setPmtSearch] = useState("");
 const [pmtStatus, setPmtStatus] = useState("all");
 const [pmtPage, setPmtPage] = useState(1);
 const [loadingPayments, setLoadingPayments] = useState(false);

 useEffect(() => {
 fetchStats();
 }, []);

 useEffect(() => {
 if (activeTab ==="applications"|| activeTab ==="overview") {
 fetchApplications();
 }
 if (activeTab ==="payments"|| activeTab ==="overview") {
 fetchPayments();
 }
 }, [activeTab, appsSearch, appsDuration, appsPage, pmtSearch, pmtStatus, pmtPage]);

 const fetchStats = async () => {
 try {
 const data = await apiRequest<DashboardStats>("/admin/stats");
 setStats(data);
 } catch (err) {
 localStorage.removeItem("token");
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
 limit:"10",
 });
 if (appsSearch) params.set("q", appsSearch);
 if (appsDuration !=="all") params.set("duration", appsDuration);

 const data = await apiRequest<PaginatedResult<InternshipApplicationResponse>>(`/admin/applications?${params.toString()}`);
 setAppsData(data);
 } catch (err) {
 console.error(err);
 } finally {
 setLoadingApps(false);
 }
 };

 const fetchPayments = async () => {
 setLoadingPayments(true);
 try {
 const params = new URLSearchParams({
 page: pmtPage.toString(),
 limit:"10",
 });
 if (pmtSearch) params.set("q", pmtSearch);
 if (pmtStatus !=="all") params.set("status", pmtStatus);

 const data = await apiRequest<PaginatedResult<PaymentItem>>(`/admin/payments?${params.toString()}`);
 setPaymentsData(data);
 } catch (err) {
 console.error(err);
 } finally {
 setLoadingPayments(false);
 }
 };

 const handleExportExcel = (type: 'applications' | 'payments') => {
 const token = localStorage.getItem("token");
 const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
 let exportUrl = `${baseUrl}/admin/export/${type}?token=${token}`;
 if (type === 'applications' && appsDuration !=="all") {
 exportUrl += `&duration=${encodeURIComponent(appsDuration)}`;
 }
 if (type === 'payments' && pmtStatus !=="all") {
 exportUrl += `&status=${encodeURIComponent(pmtStatus)}`;
 }

 // Trigger binary stream download directly in browser
 fetch(exportUrl, {
 headers: {
 Authorization: `Bearer ${token}`
 }
 })
 .then(res => res.blob())
 .then(blob => {
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = `internvision_${type}.xlsx`;
 document.body.appendChild(a);
 a.click();
 a.remove();
 })
 .catch(err => console.error("Export download failed", err));
 };

 const handleLogout = () => {
 localStorage.removeItem("token");
 router.push("/admin/login");
 };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-ink-50 font-sans selection:bg-brand-500/30 pb-20">
        {/* TOP BAR */}
        <header className="border-b border-ink-800 bg-ink-950/50 sticky top-0 z-50 backdrop-blur-xl">
          <div className="max-w-[90rem] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-800 flex items-center justify-center text-brand-400">
                <Shield className="w-4 h-4" />
              </div>
              <h1 className="text-sm font-semibold tracking-tight text-white">Admin Dashboard</h1>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-medium text-ink-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </header>

        <div className="max-w-[90rem] mx-auto px-6 py-8 space-y-8">
          {/* STATS CARDS */}
          <FadeIn delay={0.1} direction="up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:bg-ink-900/50 transition-colors">
                <div className="flex items-center justify-between text-ink-400 mb-3">
                  <span className="text-xs font-medium tracking-wide">Total Revenue</span>
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="text-2xl font-semibold text-white">
                  {stats ? formatINR(stats.total_revenue_inr) : "—"}
                </div>
              </div>

              <div className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:bg-ink-900/50 transition-colors">
                <div className="flex items-center justify-between text-ink-400 mb-3">
                  <span className="text-xs font-medium tracking-wide">Intern Applications</span>
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-2xl font-semibold text-white">
                  {stats ? stats.total_applications : "—"}
                </div>
              </div>

              <div className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:bg-ink-900/50 transition-colors">
                <div className="flex items-center justify-between text-ink-400 mb-3">
                  <span className="text-xs font-medium tracking-wide">Course Registrations</span>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-2xl font-semibold text-white">
                  {stats ? stats.total_registrations : "—"}
                </div>
              </div>

              <div className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:bg-ink-900/50 transition-colors">
                <div className="flex items-center justify-between text-ink-400 mb-3">
                  <span className="text-xs font-medium tracking-wide">Completed Tx</span>
                  <CheckCircle2 className="w-4 h-4" />
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
              {activeTab === "overview" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t-full" />}
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
              {activeTab === "applications" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t-full" />}
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
              {activeTab === "payments" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t-full" />}
            </button>
          </div>

          {/* APPLICATIONS SECTION */}
          {(activeTab === "applications" || activeTab === "overview") && (
            <FadeIn delay={0.2} direction="up">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">Applications</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-400" />
                      <input
                        type="text"
                        placeholder="Search applicants..."
                        value={appsSearch}
                        onChange={(e) => { setAppsSearch(e.target.value); setAppsPage(1); }}
                        className="w-full bg-ink-950 border border-ink-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-ink-600 transition-colors"
                      />
                    </div>
                    <select
                      value={appsDuration}
                      onChange={(e) => { setAppsDuration(e.target.value); setAppsPage(1); }}
                      className="bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-ink-600 transition-colors cursor-pointer"
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
                      <Download className="w-3.5 h-3.5" /> Export
                    </button>
                  </div>
                </div>

                <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-950/30">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-ink-900/50 text-ink-400 font-medium border-b border-ink-800">
                        <tr>
                          <th className="px-5 py-3 font-medium">Applicant</th>
                          <th className="px-5 py-3 font-medium">College</th>
                          <th className="px-5 py-3 font-medium">Skills</th>
                          <th className="px-5 py-3 font-medium">Duration</th>
                          <th className="px-5 py-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-800/50">
                        {loadingApps ? (
                          <tr>
                            <td colSpan={5} className="text-center py-12">
                              <Loader2 className="w-5 h-5 animate-spin mx-auto text-ink-500" />
                            </td>
                          </tr>
                        ) : appsData.items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-ink-500 text-sm">
                              No applications found.
                            </td>
                          </tr>
                        ) : (
                          appsData.items.map((app) => (
                            <tr key={app.id} className="hover:bg-ink-900/30 transition-colors">
                              <td className="px-5 py-4">
                                <div className="font-medium text-ink-100">{app.full_name}</div>
                                <div className="text-xs text-ink-500 mt-0.5">{app.email}</div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="text-ink-200">{app.college}</div>
                                <div className="text-xs text-ink-500 mt-0.5">{app.year_of_study}</div>
                              </td>
                              <td className="px-5 py-4 max-w-[200px] truncate">
                                <span className="text-ink-400 text-xs">{app.skills.join(", ")}</span>
                              </td>
                              <td className="px-5 py-4">
                                <span className="px-2 py-1 rounded bg-ink-800 text-ink-300 text-xs font-medium border border-ink-700">
                                  {app.duration}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-ink-400 text-xs">
                                {new Date(app.created_at).toLocaleDateString()}
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
                      Showing {appsData.page} of {appsData.total_pages}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={appsPage <= 1}
                        onClick={() => setAppsPage(p => p - 1)}
                        className="p-1.5 rounded bg-ink-900 border border-ink-800 text-ink-300 hover:text-white disabled:opacity-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={appsPage >= appsData.total_pages}
                        onClick={() => setAppsPage(p => p + 1)}
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

          {/* PAYMENTS SECTION */}
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
                        onChange={(e) => { setPmtSearch(e.target.value); setPmtPage(1); }}
                        className="w-full bg-ink-950 border border-ink-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-ink-600 transition-colors"
                      />
                    </div>
                    <select
                      value={pmtStatus}
                      onChange={(e) => { setPmtStatus(e.target.value); setPmtPage(1); }}
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
                              <td className="px-5 py-4 font-mono text-xs text-ink-400">
                                {pmt.order_id}
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-ink-200">{pmt.student_email}</span>
                              </td>
                              <td className="px-5 py-4 font-medium text-white">
                                {formatINR(pmt.amount_inr)}
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-xs font-medium">
                                  {pmt.status === "captured" ? (
                                    <span className="text-emerald-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Captured</span>
                                  ) : pmt.status === "failed" ? (
                                    <span className="text-red-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Failed</span>
                                  ) : (
                                    <span className="text-yellow-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Pending</span>
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
                        onClick={() => setPmtPage(p => p - 1)}
                        className="p-1.5 rounded bg-ink-900 border border-ink-800 text-ink-300 hover:text-white disabled:opacity-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={pmtPage >= paymentsData.total_pages}
                        onClick={() => setPmtPage(p => p + 1)}
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
      </div>
    </AuthGuard>
  );
}
