"use client";

import { useState, useEffect } from "react";
import { Mail, MapPin, Send, CheckCircle2, Sparkles, Loader2, AlertCircle, Globe } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const service = params.get("service");
      const subj = params.get("subject");
      if (service === "final-year-project") {
        setFormData((prev) => ({
          ...prev,
          subject: "Final Year Academic Project Development Inquiry",
          message: "Hi InternVision Team,\n\nI am looking for assistance with my Final Year Project:\n- Degree / Branch:\n- Preferred Tech Stack / Domain:\n- Submission Deadline:\n\nPlease share details on source code, project documentation, and live demo walkthrough.",
        }));
      } else if (service === "business-project") {
        setFormData((prev) => ({
          ...prev,
          subject: "Custom Business / Enterprise Software Development Inquiry",
          message: "Hi InternVision Team,\n\nWe would like to discuss building a custom software project for our business:\n- Project Type (SaaS / Web App / AI / Automation):\n- Core Features Needed:\n- Expected Timeline:\n\nPlease connect with us for a consultation.",
        }));
      } else if (subj) {
        setFormData((prev) => ({
          ...prev,
          subject: subj,
        }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiRequest("/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to send message. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Get in Touch With <span className="gradient-text">InternVision</span>
        </h1>
        <p className="text-ink-400 text-sm leading-relaxed">
          Have questions about our bootcamps, virtual internship structure, final year projects, or custom software solutions? Send us a message!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        <div className="glass-card p-5 space-y-3 border border-ink-800 hover:border-brand-500/50 transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600/20 text-brand-400 flex items-center justify-center rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Student & Tech Support</h4>
              <p className="text-[11px] text-ink-400">Doubts, submissions & portal help</p>
            </div>
          </div>
          <a
            href="mailto:support@internvisiontech.me"
            className="text-xs text-brand-400 hover:underline font-mono block break-all pt-1 font-semibold"
          >
            support@internvisiontech.me
          </a>
        </div>

        <div className="glass-card p-5 space-y-3 border border-ink-800 hover:border-emerald-500/50 transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600/20 text-emerald-400 flex items-center justify-center rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">HR & Careers Desk</h4>
              <p className="text-[11px] text-ink-400">Applications, onboarding & hiring</p>
            </div>
          </div>
          <a
            href="mailto:hr@internvisiontech.me"
            className="text-xs text-emerald-400 hover:underline font-mono block break-all pt-1 font-semibold"
          >
            hr@internvisiontech.me
          </a>
        </div>

        <div className="glass-card p-5 space-y-3 border border-ink-800 hover:border-amber-500/50 transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600/20 text-amber-400 flex items-center justify-center rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Billing & Payments</h4>
              <p className="text-[11px] text-ink-400">Fees, invoices & receipts</p>
            </div>
          </div>
          <a
            href="mailto:billing@internvisiontech.me"
            className="text-xs text-amber-400 hover:underline font-mono block break-all pt-1 font-semibold"
          >
            billing@internvisiontech.me
          </a>
        </div>

        <div className="glass-card p-5 space-y-3 border border-ink-800 hover:border-cyan-500/50 transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-600/20 text-cyan-400 flex items-center justify-center rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">General Inquiries</h4>
              <p className="text-[11px] text-ink-400">Partnerships & general contact</p>
            </div>
          </div>
          <a
            href="mailto:contact@internvisiontech.me"
            className="text-xs text-cyan-400 hover:underline font-mono block break-all pt-1 font-semibold"
          >
            contact@internvisiontech.me
          </a>
        </div>

        <div className="glass-card p-5 space-y-3 border border-ink-800 hover:border-purple-500/50 transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/20 text-purple-400 flex items-center justify-center rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Executive & Admin</h4>
              <p className="text-[11px] text-ink-400">Institutional & administrative desk</p>
            </div>
          </div>
          <a
            href="mailto:admin@internvisiontech.me"
            className="text-xs text-purple-400 hover:underline font-mono block break-all pt-1 font-semibold"
          >
            admin@internvisiontech.me
          </a>
        </div>

        <div className="glass-card p-5 space-y-3 border border-ink-800 hover:border-rose-500/50 transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600/20 text-rose-400 flex items-center justify-center rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Information Desk</h4>
              <p className="text-[11px] text-ink-400">Bootcamps & program syllabus</p>
            </div>
          </div>
          <a
            href="mailto:info@internvisiontech.me"
            className="text-xs text-rose-400 hover:underline font-mono block break-all pt-1 font-semibold"
          >
            info@internvisiontech.me
          </a>
        </div>
      </div>

      {/* Official Social Media Channels Banner */}
      <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-ink-900 via-brand-950/40 to-ink-900 border border-ink-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Connect With InternVision Tech
            </h3>
            <p className="text-xs text-ink-400">
              Follow our official media channels for internship announcements, masterclasses, and tech updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.linkedin.com/company/internvision-tech"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-blue-600/20 border border-ink-700 hover:border-blue-500 text-ink-200 hover:text-white transition shadow-sm group"
            >
              <svg className="w-4 h-4 fill-current text-blue-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
              <span className="text-xs font-semibold">LinkedIn</span>
            </a>

            <a
              href="https://www.youtube.com/@InternVisionTech"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-red-600/20 border border-ink-700 hover:border-red-500 text-ink-200 hover:text-white transition shadow-sm group"
            >
              <svg className="w-4 h-4 fill-current text-red-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="text-xs font-semibold">YouTube</span>
            </a>

            <a
              href="https://www.instagram.com/internvisiontech/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-pink-600/20 border border-ink-700 hover:border-pink-500 text-ink-200 hover:text-white transition shadow-sm group"
            >
              <svg className="w-4 h-4 fill-current text-pink-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-xs font-semibold">Instagram</span>
            </a>

            <a
              href="https://www.internvisiontech.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-emerald-600/20 border border-ink-700 hover:border-emerald-500 text-ink-200 hover:text-white transition shadow-sm group"
            >
              <Globe className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Website</span>
            </a>

            <a
              href="mailto:hr@internvisiontech.me"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-brand-600/20 border border-ink-700 hover:border-brand-500 text-ink-200 hover:text-white transition shadow-sm group"
            >
              <Mail className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">hr@internvisiontech.me</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <div className="glass-card p-8 sm:p-10 border border-ink-800 rounded-2xl shadow-2xl">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto rounded-full">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">Message Received!</h3>
              <p className="text-ink-400 text-sm max-w-md mx-auto">
                Thank you for reaching out, <span className="text-white font-medium">{formData.name}</span>. Your message has been routed directly to our admin team and we will reply to <span className="text-brand-400">{formData.email}</span> shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", subject: "", message: "" });
                }}
                className="mt-4 px-6 py-2.5 text-xs font-semibold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 rounded-lg transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-400 text-xs rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs text-ink-200 font-semibold">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-ink-900/90 border border-ink-700/80 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition placeholder:text-ink-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-ink-200 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-ink-900/90 border border-ink-700/80 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition placeholder:text-ink-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-ink-200 font-semibold">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Inquiry regarding Virtual Internship or Project Development"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-ink-900/90 border border-ink-700/80 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition placeholder:text-ink-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-ink-200 font-semibold">Message *</label>
                  <span className="text-[11px] text-ink-500">Provide project, academic, or internship details</span>
                </div>
                <textarea
                  required
                  rows={9}
                  placeholder="Please write your detailed inquiry, project requirements, questions, or timeline..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full min-h-[220px] bg-ink-900/90 border border-ink-700/80 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 font-sans leading-relaxed resize-y transition placeholder:text-ink-500 shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 font-bold bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2.5 transition cursor-pointer text-sm tracking-wide"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
