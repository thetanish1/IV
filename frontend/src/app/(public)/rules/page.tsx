import React from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, AlertCircle, Clock, GitBranch, MessageSquare, ShieldAlert, Award, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";

export const metadata = {
  title: "Internship Rules & Guidelines | InternVision Tech",
  description: "Official rules, milestone submission protocols, and evaluation guidelines for InternVision Tech interns.",
};

export default function InternshipRulesPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <FadeIn direction="up">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" /> Cohort Code of Conduct & Operational Protocols
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Internship <span className="text-emerald-400">Rules & Guidelines</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-300 max-w-2xl mx-auto leading-relaxed">
            Essential operational guidelines, weekly submission expectations, and code quality standards to ensure successful completion and certification.
          </p>
        </div>
      </FadeIn>

      {/* Rules Grid */}
      <div className="space-y-8">
        {/* Rule 1: Weekly Submissions */}
        <FadeIn direction="up">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-ink-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">1. Weekly Milestone Submission Timeline</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-ink-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Time-Gated Unlocks:</strong> Weekly deliverables unlock progressively on your Student Portal. Week 1 is available immediately upon admission.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Submission Deadlines:</strong> Submit your deliverables before the end of each weekly cycle to ensure timely mentor evaluations.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Unlock Requests:</strong> If you miss a deadline due to college exams or require early access, use the &ldquo;Request Admin Unlock&rdquo; feature in your portal.</span>
              </li>
            </ul>
          </div>
        </FadeIn>

        {/* Rule 2: GitHub & Code Standards */}
        <FadeIn direction="up">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-ink-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <GitBranch className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">2. GitHub Repository & Code Quality Standards</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-ink-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Public Repositories:</strong> All code must be hosted on a public GitHub repository with clear commit histories reflecting your incremental development.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Documentation:</strong> Each repository must include a comprehensive <code className="text-brand-300 font-mono">README.md</code> detailing project architecture, setup steps, and live demo links.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Plagiarism Policy:</strong> Submitting direct copy-pasted code from peers or unauthorized external repositories is strictly prohibited and results in immediate disqualification.</span>
              </li>
            </ul>
          </div>
        </FadeIn>

        {/* Rule 3: 3-Month & 6-Month Track Specifics */}
        <FadeIn direction="up">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-ink-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">3. Multi-Month Milestone Projects (3M & 6M Tracks)</h2>
            </div>
            <div className="space-y-3 text-sm text-ink-300 leading-relaxed">
              <p>
                Interns enrolled in 3-Month or 6-Month tracks must complete subsequent milestone projects in addition to Month 1 foundational tasks:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-400 shrink-0">•</span>
                  <span><strong>Month 2 Industry Project:</strong> Complete a full-scale application selected from our curated blueprints or an approved custom technical topic.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-400 shrink-0">•</span>
                  <span><strong>Month 3 Developer Portfolio:</strong> Build and deploy your personal engineering showcase with live demo links and technical resume download.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-400 shrink-0">•</span>
                  <span><strong>Months 4–6 Capstone (6M):</strong> Real-life enterprise capstone sprint with bi-weekly check-ins and direct 1:1 mentor code reviews.</span>
                </li>
              </ul>
            </div>
          </div>
        </FadeIn>

        {/* Rule 4: Query Desk & Mentor Interaction */}
        <FadeIn direction="up">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-ink-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">4. Mentor Communication & Query Desk Protocol</h2>
            </div>
            <p className="text-sm text-ink-300 leading-relaxed">
              Use the portal&apos;s interactive <strong>Query & Doubts Helpdesk</strong> for technical roadblocks. When posting, provide clear error screenshots, terminal trace logs, and code snippets to enable rapid resolution. Maintain polite, professional communication with engineering mentors at all times.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Footer Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-ink-800">
        <Link
          href="/terms"
          className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1.5"
        >
          View Terms & Conditions <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/agreement"
          className="text-xs text-ink-400 hover:text-white flex items-center gap-1.5"
        >
          View Student Internship Agreement <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
