import React from "react";
import { DollarSign, UserCheck, Users, BookOpen, CheckCircle2, Mail, Award, FolderGit2, Unlock, MessageSquare, Sliders } from "lucide-react";
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
        {/* Top KPI Telemetry Grid */}
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

          <div
            onClick={() => onNavigateTab("users")}
            className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:border-brand-500/40 hover:bg-ink-900/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-ink-400 mb-3">
              <span className="text-xs font-medium tracking-wide group-hover:text-brand-400 transition-colors">Registered Users</span>
              <UserCheck className="w-4 h-4 text-brand-400" />
            </div>
            <div className="text-2xl font-semibold text-white">
              {stats?.total_users !== undefined ? stats.total_users : "—"}
            </div>
          </div>

          <div
            onClick={() => onNavigateTab("applications")}
            className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:border-blue-500/40 hover:bg-ink-900/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-ink-400 mb-3">
              <span className="text-xs font-medium tracking-wide group-hover:text-blue-400 transition-colors">Intern Applications</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-semibold text-white">
              {stats ? stats.total_applications : "—"}
            </div>
          </div>

          <div
            onClick={() => onNavigateTab("enrollments")}
            className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:border-purple-500/40 hover:bg-ink-900/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-ink-400 mb-3">
              <span className="text-xs font-medium tracking-wide group-hover:text-purple-400 transition-colors">Course Enrollments</span>
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-semibold text-white">
              {stats ? stats.total_registrations : "—"}
            </div>
          </div>

          <div
            onClick={() => onNavigateTab("payments")}
            className="p-5 rounded-xl border border-ink-800 bg-ink-950/50 hover:border-amber-500/40 hover:bg-ink-900/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-ink-400 mb-3">
              <span className="text-xs font-medium tracking-wide group-hover:text-amber-400 transition-colors">Completed Tx</span>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-semibold text-white">
              {stats ? stats.successful_payments : "—"}
            </div>
          </div>

          <div
            onClick={() => onNavigateTab("contacts")}
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

        {/* Operational Modules Quick Jump Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div
            onClick={() => onNavigateTab("submissions")}
            className="p-5 rounded-xl border border-ink-800 bg-ink-950/30 hover:border-blue-500/40 hover:bg-ink-900/30 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                <FolderGit2 className="w-4 h-4 text-blue-400" /> Student Submissions Desk
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {submissionsCount} Deliverables
              </span>
            </div>
            <p className="text-xs text-ink-400 leading-relaxed">
              Review weekly milestone deliverables, verify student GitHub repositories and live deployments, and issue mentor feedback.
            </p>
          </div>

          <div
            onClick={() => onNavigateTab("unlocks")}
            className="p-5 rounded-xl border border-ink-800 bg-ink-950/30 hover:border-amber-500/40 hover:bg-ink-900/30 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2 group-hover:text-amber-400 transition-colors">
                <Unlock className="w-4 h-4 text-amber-400" /> Task Unlock Requests
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {unlockRequestsCount} Requests
              </span>
            </div>
            <p className="text-xs text-ink-400 leading-relaxed">
              Manage student deadline extensions and early module unlocks with one-click form controls (ON / OFF).
            </p>
          </div>

          <div
            onClick={() => onNavigateTab("doubts")}
            className="p-5 rounded-xl border border-ink-800 bg-ink-950/30 hover:border-pink-500/40 hover:bg-ink-900/30 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2 group-hover:text-pink-400 transition-colors">
                <MessageSquare className="w-4 h-4 text-pink-400" /> Mentor Doubts Helpdesk
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-pink-500/20 text-pink-300 border border-pink-500/30">
                {doubtsCount} Queries
              </span>
            </div>
            <p className="text-xs text-ink-400 leading-relaxed">
              Direct two-way technical resolution desk for student code snippets, syntax bugs, and error screenshot inspection.
            </p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
