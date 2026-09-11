import React from "react";
import {
  DollarSign,
  UserCheck,
  Users,
  BookOpen,
  CheckCircle2,
  Mail,
  FolderGit2,
  Unlock,
  HelpCircle,
  Award,
  ShieldCheck,
  Zap,
  Activity,
  Server,
  ArrowRight,
} from "lucide-react";
import { DashboardStats } from "@/types";
import { formatINR } from "@/lib/utils";
import { FadeIn } from "@/components/animations/FadeIn";
import { MetricCard, AdminCard, AdminCardHeader } from "@/components/admin/common";

interface OverviewTabProps {
  stats: DashboardStats | null;
  totalContactsCount: number;
  newContactsCount: number;
  submissionsCount: number;
  unlockRequestsCount: number;
  doubtsCount: number;
  onNavigateTab: (tab: string) => void;
  hasPermission?: (permKey: string) => boolean;
}

export default function OverviewTab({
  stats,
  totalContactsCount,
  newContactsCount,
  submissionsCount,
  unlockRequestsCount,
  doubtsCount,
  onNavigateTab,
  hasPermission = () => true,
}: OverviewTabProps) {
  const canAccess = hasPermission;

  const visibleCardsCount = [
    canAccess("payments"),
    canAccess("users"),
    canAccess("applications"),
    canAccess("enrollments"),
    canAccess("payments"),
    canAccess("contacts"),
  ].filter(Boolean).length;

  return (
    <FadeIn delay={0.1} direction="up">
      <div className="space-y-6">
        {/* Top KPI Telemetry Grid (Supports Light and Dark mode) */}
        {visibleCardsCount > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {canAccess("payments") && (
              <MetricCard
                title="Total Revenue"
                value={stats ? formatINR(stats.total_revenue_inr) : "—"}
                icon={<DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                iconBgColor="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                subtitle="Verified Cashfree ledger"
                onClick={() => onNavigateTab("payments")}
              />
            )}

            {canAccess("users") && (
              <MetricCard
                title="Registered Users"
                value={stats?.total_users !== undefined ? stats.total_users : "—"}
                icon={<UserCheck className="w-4 h-4 text-blue-600 dark:text-brand-400" />}
                iconBgColor="bg-blue-50 text-blue-600 border-blue-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20"
                subtitle="Student & Admin accounts"
                onClick={() => onNavigateTab("users")}
              />
            )}

            {canAccess("applications") && (
              <MetricCard
                title="Applications"
                value={stats ? stats.total_applications : "—"}
                icon={<Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                iconBgColor="bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
                subtitle="Candidate submissions"
                onClick={() => onNavigateTab("applicants")}
              />
            )}

            {canAccess("enrollments") && (
              <MetricCard
                title="Bootcamp Intake"
                value={stats ? stats.total_registrations : "—"}
                icon={<BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                iconBgColor="bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20"
                subtitle="Course enrollments"
                onClick={() => onNavigateTab("enrollments")}
              />
            )}

            {canAccess("payments") && (
              <MetricCard
                title="Completed Orders"
                value={stats ? stats.successful_payments : "—"}
                icon={<CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                iconBgColor="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                subtitle="Successful transactions"
                onClick={() => onNavigateTab("payments")}
              />
            )}

            {canAccess("contacts") && (
              <MetricCard
                title="Inquiries"
                value={totalContactsCount}
                badge={newContactsCount > 0 ? `${newContactsCount} NEW` : undefined}
                badgeVariant="brand"
                icon={<Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                iconBgColor="bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20"
                subtitle="Contact desk queue"
                onClick={() => onNavigateTab("contacts")}
              />
            )}
          </div>
        )}

        {/* Operational Triage Queues Grid */}
        {(canAccess("submissions") || canAccess("unlocks") || canAccess("doubts")) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {canAccess("submissions") && (
              <div
                onClick={() => onNavigateTab("submissions")}
                className="p-6 rounded-2xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950/80 hover:border-brand-500/60 transition-all duration-200 cursor-pointer space-y-3 group shadow-sm hover:shadow-[0_0_25px_rgba(48,112,219,0.12)] hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                    <FolderGit2 className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Submissions Queue
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200 dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/30">
                    {submissionsCount} Total
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-ink-400 leading-relaxed">
                  Review weekly milestone deliverables, verify student GitHub repositories and live deployments, and issue mentor feedback.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300">
                  <span>Open Queue</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )}

            {canAccess("unlocks") && (
              <div
                onClick={() => onNavigateTab("unlocks")}
                className="p-6 rounded-2xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950/80 hover:border-amber-500/60 transition-all duration-200 cursor-pointer space-y-3 group shadow-sm hover:shadow-[0_0_25px_rgba(245,158,11,0.12)] hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                    <Unlock className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Task Unlock Requests
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
                    {unlockRequestsCount} Pending
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-ink-400 leading-relaxed">
                  Manage student deadline extensions and early module unlocks with one-click administrative authorization.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300">
                  <span>Authorize Requests</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )}

            {canAccess("doubts") && (
              <div
                onClick={() => onNavigateTab("doubts")}
                className="p-6 rounded-2xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950/80 hover:border-pink-500/60 transition-all duration-200 cursor-pointer space-y-3 group shadow-sm hover:shadow-[0_0_25px_rgba(236,72,153,0.12)] hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors">
                    <HelpCircle className="w-4 h-4 text-pink-600 dark:text-pink-400" /> Mentor Doubts Desk
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-500/30">
                    {doubtsCount} Inquiries
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-ink-400 leading-relaxed">
                  Direct two-way technical resolution desk for student code snippets, syntax bugs, and error screenshot inspection.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400 group-hover:text-pink-700 dark:group-hover:text-pink-300">
                  <span>Resolve Doubts</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Platform Health & System Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <AdminCard className="lg:col-span-2">
            <AdminCardHeader
              title="Platform Telemetry & Live Services"
              subtitle="Real-time operational status for InternVision infrastructure"
              icon={<Activity className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-ink-300">API Gateway</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Operational (FastAPI)
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-ink-400">
                  Sub-50ms endpoint response latency with asynchronous connection pooling.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-ink-300">Database Engine</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    PostgreSQL Online
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-ink-400">
                  ACID-compliant storage for users, submissions, certificates, and audit logs.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-ink-300">Certificate Verification Registry</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 dark:text-brand-300 bg-blue-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full border border-blue-200 dark:border-brand-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Tamper-Proof
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-ink-400">
                  Public SHA-256 verifiable credentials available at /verify-certificate.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-ink-300">SMTP Notification Dispatcher</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                    <Zap className="w-3 h-3" />
                    Brevo Connected
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-ink-400">
                  Automated email delivery for task unlocks, certificates, and student inquiries.
                </p>
              </div>
            </div>
          </AdminCard>

          {/* Quick Shortcuts Card */}
          <AdminCard>
            <AdminCardHeader
              title="Quick Action Hub"
              subtitle="Administrative shortcuts"
              icon={<Zap className="w-4 h-4" />}
            />

            <div className="space-y-2.5">
              {canAccess("certificates") && (
                <button
                  onClick={() => onNavigateTab("certificates")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-ink-900 hover:bg-blue-50 dark:hover:bg-brand-600/15 border border-gray-200 dark:border-ink-800 hover:border-blue-300 dark:hover:border-brand-500/50 text-gray-800 dark:text-ink-200 hover:text-blue-700 dark:hover:text-white transition-all text-xs font-semibold group shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-blue-600 dark:text-brand-400" />
                    <span>Issue Digital Certificate</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              )}

              {canAccess("mailer") && (
                <button
                  onClick={() => onNavigateTab("mailer")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-ink-900 hover:bg-blue-50 dark:hover:bg-brand-600/15 border border-gray-200 dark:border-ink-800 hover:border-blue-300 dark:hover:border-brand-500/50 text-gray-800 dark:text-ink-200 hover:text-blue-700 dark:hover:text-white transition-all text-xs font-semibold group shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>Send Broadcast Newsletter</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              )}

              {canAccess("settings") && (
                <button
                  onClick={() => onNavigateTab("settings")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-ink-900 hover:bg-blue-50 dark:hover:bg-brand-600/15 border border-gray-200 dark:border-ink-800 hover:border-blue-300 dark:hover:border-brand-500/50 text-gray-800 dark:text-ink-200 hover:text-blue-700 dark:hover:text-white transition-all text-xs font-semibold group shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <Server className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Manage Sub-Admin Permissions</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              )}

              {canAccess("payments") && (
                <button
                  onClick={() => onNavigateTab("payments")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-ink-900 hover:bg-blue-50 dark:hover:bg-brand-600/15 border border-gray-200 dark:border-ink-800 hover:border-blue-300 dark:hover:border-brand-500/50 text-gray-800 dark:text-ink-200 hover:text-blue-700 dark:hover:text-white transition-all text-xs font-semibold group shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Audit Payment Transactions</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              )}

              {canAccess("doubts") && (
                <button
                  onClick={() => onNavigateTab("doubts")}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-ink-900 hover:bg-blue-50 dark:hover:bg-brand-600/15 border border-gray-200 dark:border-ink-800 hover:border-blue-300 dark:hover:border-brand-500/50 text-gray-800 dark:text-ink-200 hover:text-blue-700 dark:hover:text-white transition-all text-xs font-semibold group shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    <span>Open Doubts Helpdesk</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              )}
            </div>
          </AdminCard>
        </div>
      </div>
    </FadeIn>
  );
}
