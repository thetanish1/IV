import React from "react";
import Link from "next/link";
import { ShieldCheck, FileText, Scale, Lock, Clock, ArrowRight, HelpCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";

export const metadata = {
  title: "Terms and Conditions | InternVision Tech",
  description: "Official terms and conditions governing enrollment, internships, and platform usage at InternVision Tech.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Header Banner */}
      <FadeIn direction="up">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" /> Legal Governance & Platform Agreement
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Terms & <span className="text-brand-400">Conditions</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-300 max-w-2xl mx-auto leading-relaxed">
            Effective Date: January 1, 2026. Please read these terms carefully before accessing our virtual internship tracks, courses, or digital credentials registry.
          </p>
        </div>
      </FadeIn>

      {/* Content Sections */}
      <div className="space-y-8">
        {/* Section 1 */}
        <FadeIn direction="up">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-ink-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">1. Acceptance of Terms</h2>
            </div>
            <p className="text-sm text-ink-300 leading-relaxed">
              By accessing, browsing, submitting an application, or enrolling in any program on InternVision Tech (&ldquo;internvisiontech.me&rdquo;), you acknowledge that you have read, understood, and agree to be legally bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, you must refrain from using the platform.
            </p>
          </div>
        </FadeIn>

        {/* Section 2 */}
        <FadeIn direction="up">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-ink-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">2. Virtual Internship Program Enrollment</h2>
            </div>
            <div className="space-y-3 text-sm text-ink-300 leading-relaxed">
              <p>
                InternVision Tech offers curated experiential learning, project-based engineering tracks, and mentor-evaluated internships spanning 1-Month, 3-Month, and 6-Month durations.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Eligibility:</strong> Applicants must provide truthful, authentic academic details, contact information, and resume files during registration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Educational Nature:</strong> Virtual internships are structured experiential engineering training modules. They do not constitute formal full-time permanent corporate employment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Admission Discretion:</strong> InternVision Tech reserves the sole right to accept, defer, or reject applications based on intake capacity and prerequisite technical screening.</span>
                </li>
              </ul>
            </div>
          </div>
        </FadeIn>

        {/* Section 3 */}
        <FadeIn direction="up">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-ink-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">3. Intellectual Property & Deliverables</h2>
            </div>
            <div className="space-y-3 text-sm text-ink-300 leading-relaxed">
              <p>
                Students retain copyright and ownership of the original software code and repositories created during their internship assignments. By submitting deliverable links, students grant InternVision Tech the non-exclusive right to review, evaluate, and showcase exemplary capstone projects for academic and portfolio verification purposes.
              </p>
              <p>
                Platform curriculum, instructional documentation, task definitions, and proprietary code starter kits remain the exclusive intellectual property of InternVision Tech.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Section 4 */}
        <FadeIn direction="up">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-ink-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">4. Certificate Issuance & Verification Policy</h2>
            </div>
            <div className="space-y-3 text-sm text-ink-300 leading-relaxed">
              <p>
                Official InternVision Certificate of Completion credentials and Letters of Recommendation are awarded exclusively upon satisfactory completion of assigned weekly deliverables, milestone projects, and mentor review approval.
              </p>
              <p>
                All certificates are digitally recorded in our cryptographic registry with a unique Certificate ID (e.g., <code className="text-brand-300 font-mono">IVT/JUN26/2026/020764</code>) and can be publicly verified at <Link href="/verify-certificate" className="text-brand-400 underline hover:text-brand-300">/verify-certificate</Link>.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Section 5 */}
        <FadeIn direction="up">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-ink-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">5. Termination & Code of Conduct Violations</h2>
            </div>
            <p className="text-sm text-ink-300 leading-relaxed">
              InternVision Tech maintains zero tolerance for academic dishonesty, unauthorized plagiarism, abusive conduct in query desks, or fraudulent credentials. InternVision Tech reserves the right to immediately terminate portal access and revoke credentials for severe violations without prior notice.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Bottom Navigation CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-ink-800">
        <Link
          href="/rules"
          className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1.5"
        >
          Read Internship Rules & Guidelines <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/agreement"
          className="text-xs text-ink-400 hover:text-white flex items-center gap-1.5"
        >
          Student Internship Agreement <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
