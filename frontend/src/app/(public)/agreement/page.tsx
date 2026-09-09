import React from "react";
import Link from "next/link";
import { FileCheck, ShieldCheck, CheckCircle2, UserCheck, Scale, Award, ArrowRight, Lock, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";

export const metadata = {
  title: "Student Internship Agreement | InternVision Tech",
  description: "Official educational internship agreement, rights, responsibilities, and certification policy at InternVision Tech.",
};

export default function InternshipAgreementPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <FadeIn direction="up">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <FileCheck className="w-3.5 h-3.5" /> Virtual Educational Internship Agreement
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Student Internship <span className="text-blue-400">Agreement</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-300 max-w-2xl mx-auto leading-relaxed">
            Standard bilateral understanding between InternVision Tech (&ldquo;Organization&rdquo;) and the Enrolled Candidate (&ldquo;Intern&rdquo;) for virtual training and experiential learning.
          </p>
        </div>
      </FadeIn>

      {/* Agreement Body */}
      <div className="space-y-8">
        {/* Recitals */}
        <FadeIn direction="up">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-ink-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Scale className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">1. Scope and Objective of Training</h2>
            </div>
            <div className="space-y-3 text-sm text-ink-300 leading-relaxed">
              <p>
                This agreement establishes the formal parameters of the candidate&apos;s virtual internship at InternVision Tech. The core objective is to provide structured practical exposure to modern software engineering, real-world development workflows, code reviews, and industry-grade toolchains.
              </p>
              <p>
                The Intern agrees to dedicate sufficient weekly hours to complete assigned technical modules, milestone deliverables, and documentation.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Intern Obligations */}
        <FadeIn direction="up">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-ink-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">2. Rights and Responsibilities of the Intern</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-ink-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Work Authenticity:</strong> Interns must personally author and commit their codebase deliverables on public GitHub repositories.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Timely Submissions:</strong> Comply with scheduled weekly deadlines and milestone requirements on the student portal.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Confidentiality:</strong> Treat any proprietary starter kits, evaluation guidelines, and mentor communications with appropriate confidentiality.</span>
              </li>
            </ul>
          </div>
        </FadeIn>

        {/* Organization Obligations */}
        <FadeIn direction="up">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-ink-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">3. Organization Commitments & Deliverables</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-ink-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span><strong>Offer Letter:</strong> Issue an official digital Offer Letter confirming admission, domain track, and internship duration.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span><strong>Mentor Review & Feedback:</strong> Provide senior mentor evaluations on submitted deliverables with constructive feedback and revisions if required.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span><strong>Verified Certificate:</strong> Award a tamper-proof, publicly verifiable Certificate of Completion upon successful fulfillment of all course modules.</span>
              </li>
            </ul>
          </div>
        </FadeIn>

        {/* Verification & Placement Assistance */}
        <FadeIn direction="up">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-ink-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">4. Verification & Background Check Endorsement</h2>
            </div>
            <p className="text-sm text-ink-300 leading-relaxed">
              InternVision Tech provides automated online background verification for future employers, HR teams, and academic institutions verifying the candidate&apos;s authentic participation, duration, and track evaluation records.
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
          href="/rules"
          className="text-xs text-ink-400 hover:text-white flex items-center gap-1.5"
        >
          View Internship Rules <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
