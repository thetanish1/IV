import React from "react";
import { DollarSign, UserCheck, Users, BookOpen, CheckCircle2, Mail, FolderGit2, Unlock, MessageSquare } from "lucide-react";
import { DashboardStats } from "@/types";
import { formatINR } from "@/lib/utils";
import { FadeIn } from "@/components/animations/FadeIn";

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
        {/* Top KPI Telemetry Grid (Enterprise Metric Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:border-blue-500/40 transition-all shadow-sm">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
              <span className="text-xs font-semibold tracking-wide uppercase">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats ? formatINR(stats.total_revenue_inr) : "—"}
            </div>
          </div>

          <div
            onClick={() => onNavigateTab("users")}
            className="p-5 rounded-xl border border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:border-blue-500 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
              <span className="text-xs font-semibold tracking-wide uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Users</span>
              <UserCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.total_users !== undefined ? stats.total_users : "—"}
            </div>
          </div>

          <div
            onClick={() => onNavigateTab("applicants")}
            className="p-5 rounded-xl border border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:border-blue-500 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
              <span className="text-xs font-semibold tracking-wide uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Applications</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats ? stats.total_applications : "—"}
            </div>
          </div>

          <div
            onClick={() => onNavigateTab("enrollments")}
            className="p-5 rounded-xl border border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:border-blue-500 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
              <span className="text-xs font-semibold tracking-wide uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Enrollments</span>
              <BookOpen className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats ? stats.total_registrations : "—"}
            </div>
          </div>

          <div
            onClick={() => onNavigateTab("payments")}
            className="p-5 rounded-xl border border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:border-blue-500 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
              <span className="text-xs font-semibold tracking-wide uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Payments</span>
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats ? stats.successful_payments : "—"}
            </div>
          </div>

          <div
            onClick={() => onNavigateTab("contacts")}
            className="p-5 rounded-xl border border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:border-blue-500 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
              <span className="text-xs font-semibold tracking-wide uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Inquiries</span>
              <Mail className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalContactsCount}
              </div>
              {newContactsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 animate-pulse">
                  {newContactsCount} NEW
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Operational Modules Quick Jump Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div
            onClick={() => onNavigateTab("submissions")}
            className="p-5 rounded-xl border border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:border-blue-500 transition-all cursor-pointer space-y-2.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <FolderGit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Submissions Queue
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                {submissionsCount} Total
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Review weekly milestone deliverables, verify student GitHub repositories and live deployments, and issue mentor feedback.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab("unlocks")}
            className="p-5 rounded-xl border border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:border-blue-500 transition-all cursor-pointer space-y-2.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Unlock className="w-4 h-4 text-amber-500" /> Task Unlock Requests
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                {unlockRequestsCount} Pending
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Manage student deadline extensions and early module unlocks with one-click administrative authorization.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab("doubts")}
            className="p-5 rounded-xl border border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:border-blue-500 transition-all cursor-pointer space-y-2.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <MessageSquare className="w-4 h-4 text-pink-500" /> Mentor Doubts Desk
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-500/20">
                {doubtsCount} Inquiries
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Direct two-way technical resolution desk for student code snippets, syntax bugs, and error screenshot inspection.
            </p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
