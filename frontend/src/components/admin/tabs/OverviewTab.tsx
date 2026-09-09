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
}

export default function OverviewTab({
  stats,
  totalContactsCount,
  newContactsCount,
  submissionsCount,
  unlockRequestsCount,
  doubtsCount,
  onNavigateTab,
}: OverviewTabProps) {
  return (
    <FadeIn delay={0.1} direction="up">
      <div className="space-y-6">
        {/* Top KPI Telemetry Grid (Standardized Reusable MetricCards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <MetricCard
            title="Total Revenue"
            value={stats ? formatINR(stats.total_revenue_inr) : "—"}
            icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
            iconBgColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            subtitle="Verified Razorpay ledger"
          />

          <MetricCard
            title="Registered Users"
            value={stats?.total_users !== undefined ? stats.total_users : "—"}
            icon={<UserCheck className="w-4 h-4 text-brand-400" />}
            iconBgColor="bg-brand-500/10 text-brand-400 border-brand-500/20"
            subtitle="Student & Admin accounts"
            onClick={() => onNavigateTab("users")}
          />

          <MetricCard
            title="Applications"
            value={stats ? stats.total_applications : "—"}
            icon={<Users className="w-4 h-4 text-indigo-400" />}
            iconBgColor="bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
            subtitle="Candidate submissions"
            onClick={() => onNavigateTab("applicants")}
          />

          <MetricCard
            title="Bootcamp Intake"
            value={stats ? stats.total_registrations : "—"}
            icon={<BookOpen className="w-4 h-4 text-purple-400" />}
            iconBgColor="bg-purple-500/10 text-purple-400 border-purple-500/20"
            subtitle="Course enrollments"
            onClick={() => onNavigateTab("enrollments")}
          />

          <MetricCard
            title="Completed Orders"
            value={stats ? stats.successful_payments : "—"}
            icon={<CheckCircle2 className="w-4 h-4 text-amber-400" />}
            iconBgColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
            subtitle="Successful transactions"
            onClick={() => onNavigateTab("payments")}
          />

          <MetricCard
            title="Inquiries"
            value={totalContactsCount}
            badge={newContactsCount > 0 ? `${newContactsCount} NEW` : undefined}
            badgeVariant="brand"
            icon={<Mail className="w-4 h-4 text-cyan-400" />}
            iconBgColor="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
            subtitle="Contact desk queue"
            onClick={() => onNavigateTab("contacts")}
          />
        </div>

        {/* Operational Triage Queues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigateTab("submissions")}
            className="p-6 rounded-xl border border-ink-800 bg-ink-950/80 hover:border-brand-500/60 transition-all duration-200 cursor-pointer space-y-3 group shadow-sm hover:shadow-[0_0_25px_rgba(48,112,219,0.12)] hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2 group-hover:text-brand-300 transition-colors">
                <FolderGit2 className="w-4 h-4 text-brand-400" /> Submissions Queue
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-brand-500/15 text-brand-300 border border-brand-500/30">
                {submissionsCount} Total
              </span>
            </div>
            <p className="text-xs text-ink-400 leading-relaxed">
              Review weekly milestone deliverables, verify student GitHub repositories and live deployments, and issue mentor feedback.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-brand-400 group-hover:text-brand-300">
              <span>Open Queue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigateTab("unlocks")}
            className="p-6 rounded-xl border border-ink-800 bg-ink-950/80 hover:border-amber-500/60 transition-all duration-200 cursor-pointer space-y-3 group shadow-sm hover:shadow-[0_0_25px_rgba(245,158,11,0.12)] hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2 group-hover:text-amber-300 transition-colors">
                <Unlock className="w-4 h-4 text-amber-400" /> Task Unlock Requests
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {unlockRequestsCount} Pending
              </span>
            </div>
            <p className="text-xs text-ink-400 leading-relaxed">
              Manage student deadline extensions and early module unlocks with one-click administrative authorization.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
              <span>Authorize Requests</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigateTab("doubts")}
            className="p-6 rounded-xl border border-ink-800 bg-ink-950/80 hover:border-pink-500/60 transition-all duration-200 cursor-pointer space-y-3 group shadow-sm hover:shadow-[0_0_25px_rgba(236,72,153,0.12)] hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2 group-hover:text-pink-300 transition-colors">
                <HelpCircle className="w-4 h-4 text-pink-400" /> Mentor Doubts Desk
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-pink-500/15 text-pink-300 border border-pink-500/30">
                {doubtsCount} Inquiries
              </span>
            </div>
            <p className="text-xs text-ink-400 leading-relaxed">
              Direct two-way technical resolution desk for student code snippets, syntax bugs, and error screenshot inspection.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-pink-400 group-hover:text-pink-300">
              <span>Resolve Doubts</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Platform Health & System Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <AdminCard className="lg:col-span-2">
            <AdminCardHeader
              title="Platform Telemetry & Live Services"
              subtitle="Real-time operational status for InternVision infrastructure"
              icon={<Activity className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-ink-900 border border-ink-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-300">API Gateway</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Operational (FastAPI)
                  </span>
                </div>
                <p className="text-[11px] text-ink-400">
                  Sub-50ms endpoint response latency with asynchronous connection pooling.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-ink-900 border border-ink-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-300">Database Engine</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    PostgreSQL Online
                  </span>
                </div>
                <p className="text-[11px] text-ink-400">
                  ACID-compliant storage for users, submissions, certificates, and audit logs.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-ink-900 border border-ink-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-300">Certificate Verification Registry</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Tamper-Proof
                  </span>
                </div>
                <p className="text-[11px] text-ink-400">
                  Public SHA-256 verifiable credentials available at /verify-certificate.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-ink-900 border border-ink-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-300">SMTP Notification Dispatcher</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <Zap className="w-3 h-3" />
                    Brevo Connected
                  </span>
                </div>
                <p className="text-[11px] text-ink-400">
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
              <button
                onClick={() => onNavigateTab("certificates")}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-ink-900 hover:bg-brand-600/15 border border-ink-800 hover:border-brand-500/50 text-ink-200 hover:text-white transition-all text-xs font-semibold group"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-brand-400" />
                  <span>Issue Digital Certificate</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab("mailer")}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-ink-900 hover:bg-brand-600/15 border border-ink-800 hover:border-brand-500/50 text-ink-200 hover:text-white transition-all text-xs font-semibold group"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>Send Broadcast Newsletter</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab("settings")}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-ink-900 hover:bg-brand-600/15 border border-ink-800 hover:border-brand-500/50 text-ink-200 hover:text-white transition-all text-xs font-semibold group"
              >
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span>Manage Sub-Admin Permissions</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab("payments")}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-ink-900 hover:bg-brand-600/15 border border-ink-800 hover:border-brand-500/50 text-ink-200 hover:text-white transition-all text-xs font-semibold group"
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Audit Payment Transactions</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </AdminCard>
        </div>
      </div>
    </FadeIn>
  );
}
