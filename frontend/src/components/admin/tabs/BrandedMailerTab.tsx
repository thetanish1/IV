"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Sparkles, User } from "lucide-react";

interface BrandedMailerTabProps {
  onSendEmail: (data: {
    recipient_email: string;
    subject: string;
    message: string;
    recipient_name?: string;
  }) => Promise<void>;
  applicantEmails?: { email: string; name: string }[];
}

export const BrandedMailerTab: React.FC<BrandedMailerTabProps> = ({
  onSendEmail,
  applicantEmails = [],
}) => {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const handleSelectPreset = (tmpl: { subject: string; message: string }) => {
    setSubject(tmpl.subject);
    setMessage(tmpl.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !subject || !message) {
      setFeedback({ type: "error", text: "Please fill in recipient email, subject, and message." });
      return;
    }

    try {
      setSending(true);
      setFeedback(null);
      await onSendEmail({
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        subject,
        message,
      });
      setFeedback({
        type: "success",
        text: `Official branded email successfully dispatched to ${recipientEmail}!`,
      });
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Failed to dispatch email broadcast. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const templates = [
    {
      label: "Roadmap Task Clarification",
      subject: "Important Update regarding your Internship Roadmap & Task Deliverables",
      message:
        "Hello {{name}},\n\nOur engineering mentors have reviewed your recent task queries and updated the project guidelines. Please check your student portal to view the latest milestone requirements and submit your deliverables on time.\n\nBest regards,\nEngineering Mentorship Team",
    },
    {
      label: "Deadline Unlock Approved",
      subject: "Notice: Your Milestone Submission Slot has been Unlocked",
      message:
        "Hello {{name}},\n\nYour recent deadline unlock request has been reviewed and approved by the academic committee. Your submission slot is now active. Please ensure you upload your repository link and screen recording before the extended cut-off.\n\nBest regards,\nAdmissions & Evaluations Office",
    },
    {
      label: "Internship Certificate Issued",
      subject: "Congratulations! Your Official Completion Certificate is Ready",
      message:
        "Hello {{name}},\n\nCongratulations on successfully completing your industry internship program! Your verified completion certificate and credentials have been issued and are now available for download in your student dashboard.\n\nWarm regards,\nDirector of Academic Programs",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Direct Branded Dispatcher</h3>
            <p className="text-xs text-slate-400">
              Send authenticated official announcements, feedback, and student notifications.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Templates Row */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Quick Template Fill</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {templates.map((tmpl) => (
            <button
              key={tmpl.label}
              type="button"
              onClick={() => handleSelectPreset(tmpl)}
              className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 text-left transition-colors"
            >
              <div className="text-xs font-semibold text-white">{tmpl.label}</div>
              <div className="text-[11px] text-slate-400 truncate mt-1">{tmpl.subject}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Dispatch Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Recipient Email Address *
            </label>
            <input
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Recipient Name (Optional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Alex Smith"
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Subject Line *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Official Notification..."
            className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Message Body (Markdown supported) *
          </label>
          <textarea
            required
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your email body here..."
            className="w-full bg-slate-800/80 border border-white/10 rounded-xl p-4 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-end">
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:opacity-90 flex items-center gap-2 transition-opacity disabled:opacity-50"
          >
            {sending ? (
              "Sending Broadcast..."
            ) : (
              <>
                <Send className="w-4 h-4" /> Dispatch Email
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
