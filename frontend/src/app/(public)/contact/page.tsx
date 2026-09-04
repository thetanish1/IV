"use client";

import { useState } from "react";
import { Mail, MapPin, Send, CheckCircle2, Sparkles } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Get in Touch With <span className="gradient-text">InternVision</span>
        </h1>
        <p className="text-ink-400 text-sm leading-relaxed">
          Have questions about our bootcamps, virtual internship structure, or corporate hiring partnerships? Send us a message!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4 border border-ink-800 hover:border-brand-500/50 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-600/20 text-brand-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Email Us</h4>
                <a
                  href="mailto:internvisiontechhr@gmail.com"
                  className="text-xs text-brand-400 hover:underline break-all"
                >
                  internvisiontechhr@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4 border border-ink-800 hover:border-emerald-500/50 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Headquarters</h4>
                <p className="text-xs text-ink-300">Nagpur, Maharashtra, India</p>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  ✦ Virtual & Nationwide Operations
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-8 border border-ink-800">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">Message Received!</h3>
              <p className="text-ink-400 text-sm max-w-md mx-auto">
                Thank you for reaching out, {formData.name}. Our team will get back to you at {formData.email} within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-ink-300 font-medium">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-700/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-ink-300 font-medium">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-700/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Inquiry regarding Virtual Internship"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-ink-300 font-medium">Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30 flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
