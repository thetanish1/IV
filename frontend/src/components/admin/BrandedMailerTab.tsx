"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Mail,
  Send,
  Sparkles,
  Link as LinkIcon,
  Paperclip,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  FileText,
  Award,
  Filter,
  Search,
  CheckSquare,
  Square,
  ChevronDown,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { ApplicantRecipientItem, SentEmailItem } from "@/types";
import { apiRequest } from "@/lib/api-client";
import { FadeIn } from "@/components/animations/FadeIn";

const MAX_ATTACHMENTS = 9;
const MAX_FILE_MB = 25;

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMessagePreview(text: string, accentColor: string = "#2563eb"): string {
  if (!text) return "";
  const linkColor = accentColor || "#2563eb";
  const paragraphs = text.split(/\n{2,}/);

  const renderInline = (segment: string) => {
    let escaped = escapeHtml(segment);

    // Markdown-style links: [label](url)
    escaped = escaped.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      (_, label, url) =>
        `<a href="${url}" target="_blank" rel="noreferrer" style="color:${linkColor}; text-decoration:underline; font-weight:600;">${label}</a>`
    );

    // Bare URLs not already inside an href value
    escaped = escaped.replace(
      /(?<!href=")((https?:\/\/|www\.)[^\s<]+)/gi,
      (match) => {
        const href = match.startsWith("http") ? match : `https://${match}`;
        return `<a href="${href}" target="_blank" rel="noreferrer" style="color:${linkColor}; text-decoration:underline;">${match}</a>`;
      }
    );

    // Bare email addresses
    escaped = escaped.replace(
      /([\w.+-]+@[\w-]+\.[a-z.]{2,})/gi,
      (match) => {
        if (escaped.indexOf(`>${match}<`) !== -1) return match;
        return `<a href="mailto:${match}" style="color:${linkColor}; text-decoration:underline;">${match}</a>`;
      }
    );

    return escaped.replace(/\n/g, "<br/>");
  };

  return paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px; font-size:14px; line-height:1.7; color:#334155;">${renderInline(
          p
        )}</p>`
    )
    .join("");
}

function parseRecipientInput(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const TEMPLATE_PRESETS = [
  {
    name: "🎉 1 Month Offer & 4-Week Roadmap",
    subject: "Official Selection: 1-Month Virtual Internship | InternVision Tech",
    heading: "1-Month Virtual Internship Selection & 4-Week Roadmap",
    message:
      "We are thrilled to inform you that your application for the 1-Month Virtual Internship Program has been officially **ACCEPTED**!\n\n**Program Overview:**\n• **Week 1:** UI Architecture & Responsive Component Systems\n• **Week 2:** RESTful Backend APIs & Database Models\n• **Week 3:** Authentication, Route Guards & Cloud Storage\n• **Week 4:** Production Cloud Deployment & CI/CD Pipeline\n\nYour task briefs and submissions desk are live on your [Student Workspace](https://iv-theta.vercel.app/portal).",
    ctaText: "Open My Student Portal",
    ctaUrl: "https://iv-theta.vercel.app/portal",
    accentColor: "#10b981",
  },
  {
    name: "🎉 3 Months Offer & Capstone Roadmap",
    subject: "Official Selection: 3-Month Virtual Internship | InternVision Tech",
    heading: "3-Month Virtual Internship Selection & Capstone Roadmap",
    message:
      "Congratulations! Your application for the 3-Month Virtual Pre-Hire Internship has been officially **ACCEPTED**!\n\n**Program Overview:**\n• **Month 1:** 4 Core Weekly Domain Milestone Tasks\n• **Month 2:** Full-Scale Industry Capstone Project (SaaS Catalog or Proposal)\n• **Month 3:** Personal Developer Portfolio Website Deployment\n\nAccess your tasks and submit milestones directly at your [Student Portal](https://iv-theta.vercel.app/portal).",
    ctaText: "Open My Student Portal",
    ctaUrl: "https://iv-theta.vercel.app/portal",
    accentColor: "#2563eb",
  },
  {
    name: "🎉 6 Months Offer & Real-Life SaaS Roadmap",
    subject: "Official Selection: 6-Month Virtual Internship | InternVision Tech",
    heading: "6-Month Virtual Internship Selection & Production Roadmap",
    message:
      "Congratulations! You have been selected for our comprehensive 6-Month Virtual Internship Program!\n\n**Program Overview:**\n• **Month 1:** Foundational Architecture & Weekly Tasks\n• **Month 2:** End-to-End Industry Project Build\n• **Month 3:** Personal Developer Portfolio Launch\n• **Months 4-6:** Real-Life Enterprise Production Project (Full-Stack + AI System) & Pre-Placement Interview\n\nStart your journey today at your [Student Portal](https://iv-theta.vercel.app/portal).",
    ctaText: "Open My Student Portal",
    ctaUrl: "https://iv-theta.vercel.app/portal",
    accentColor: "#f59e0b",
  },
  {
    name: "⏰ Milestone Submission Due Today",
    subject: "⏰ Milestone Submission Due Today - Action Required | InternVision Tech",
    heading: "Milestone Deliverable Due Today by 11:59 PM IST",
    message:
      "This is an automated reminder that your current internship milestone deliverable is **DUE TODAY**.\n\nPlease ensure your GitHub repository URL and live production deployment link are submitted via your [Student Submission Desk](https://iv-theta.vercel.app/portal).\n\nSubmitting on time ensures continuous mentorship feedback and graduation eligibility.",
    ctaText: "Submit Deliverable Now",
    ctaUrl: "https://iv-theta.vercel.app/portal",
    accentColor: "#e11d48",
  },
  {
    name: "🏆 Completion Certificate Released",
    subject: "Your Verified Completion Certificate - InternVision Tech",
    heading: "Internship Program Successfully Completed!",
    message:
      "Congratulations on successfully completing your engineering internship track with InternVision Tech!\n\nYour verified certificate of completion is attached to this email and is now verifiable 24/7 on our public [Certificate Verification Portal](https://iv-theta.vercel.app/verify-certificate).",
    ctaText: "Verify Certificate Online",
    ctaUrl: "https://iv-theta.vercel.app/verify-certificate",
    accentColor: "#8b5cf6",
  },
];

export default function BrandedMailerTab() {
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Applicant Drawer State
  const [showApplicantPicker, setShowApplicantPicker] = useState(false);
  const [applicants, setApplicants] = useState<ApplicantRecipientItem[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantFilter, setApplicantFilter] = useState<
    "all" | "internship" | "course" | "accepted" | "1 Month" | "3 Months" | "6 Months"
  >("all");
  const [applicantSearch, setApplicantSearch] = useState("");
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());

  // Email Fields State
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [subject, setSubject] = useState("Reminder: Internship Submission Desk is Active");
  const [brandName, setBrandName] = useState("InternVision Tech HR");
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [heading, setHeading] = useState("Weekly Milestone Deliverables & Task Desk");
  const [greetingName, setGreetingName] = useState("");
  const [message, setMessage] = useState(
    "We hope this email finds you in good health. We wanted to remind you that your [Internship Submission Desk](https://iv-theta.vercel.app/portal) is active and available for tracking your weekly domain tasks.\n\nPlease ensure all your GitHub repositories and live deployment URLs are updated before submitting."
  );

  // Call-To-Action Button
  const [ctaText, setCtaText] = useState("Open Student Portal");
  const [ctaUrl, setCtaUrl] = useState("https://iv-theta.vercel.app/portal");

  // Insert Link Tool
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // Attachments
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);

  // Personalized Attachments (Offer Letters / Certificates)
  const [personalizeMode, setPersonalizeMode] = useState(false);
  const [personalFiles, setPersonalFiles] = useState<
    Record<string, { name: string; offerLetter?: File | null; certificate?: File | null }>
  >({});
  const [personalFileError, setPersonalFileError] = useState<string | null>(null);

  // Sending & History State
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sendResults, setSendResults] = useState<{ to: string; success: boolean; error?: string }[] | null>(null);
  const [history, setHistory] = useState<SentEmailItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Derived Recipients
  const recipientList = parseRecipientInput(recipientsRaw);
  const validRecipients = Array.from(new Set(recipientList.filter(isValidEmail)));
  const invalidRecipients = recipientList.filter((r) => !isValidEmail(r));
  const isBulk = validRecipients.length > 1;

  // Fetch applicant directory
  const fetchApplicants = useCallback(async () => {
    setLoadingApplicants(true);
    try {
      const data = await apiRequest<ApplicantRecipientItem[]>("/admin/mailer/recipients");
      setApplicants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load applicants", err);
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  }, []);

  // Fetch send audit history
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await apiRequest<SentEmailItem[]>("/admin/mailer/history");
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load history", err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchApplicants();
    fetchHistory();
  }, [fetchApplicants, fetchHistory]);

  // Insert link at cursor
  const insertLink = () => {
    if (!linkLabel.trim() || !isValidUrl(linkUrl.trim())) return;
    const snippet = `[${linkLabel.trim()}](${linkUrl.trim()})`;
    const el = messageRef.current;

    if (el && typeof el.selectionStart === "number") {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = message.slice(0, start) + snippet + message.slice(end);
      setMessage(next);
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + snippet.length;
        el.setSelectionRange(pos, pos);
      });
    } else {
      setMessage((m) => (m ? m + " " + snippet : snippet));
    }

    setLinkLabel("");
    setLinkUrl("");
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || []);
    setAttachError(null);

    const tooBig = incoming.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooBig) {
      setAttachError(`"${tooBig.name}" exceeds the ${MAX_FILE_MB}MB limit.`);
      return;
    }

    const combined = [...attachments, ...incoming];
    if (combined.length > MAX_ATTACHMENTS) {
      setAttachError(`You can attach up to ${MAX_ATTACHMENTS} files.`);
      return;
    }

    setAttachments(combined);
    e.target.value = "";
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePersonalRow = (email: string, field: "name" | "offerLetter" | "certificate", value: any) => {
    setPersonalFileError(null);
    if ((field === "offerLetter" || field === "certificate") && value && value.size > MAX_FILE_MB * 1024 * 1024) {
      setPersonalFileError(`"${value.name}" exceeds the ${MAX_FILE_MB}MB limit.`);
      return;
    }
    setPersonalFiles((prev) => {
      const current = prev[email] || { name: "", offerLetter: null, certificate: null };
      return {
        ...prev,
        [email]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  // Filtered applicants in modal
  const filteredApplicants = applicants.filter((a) => {
    if (applicantFilter === "internship" && a.type !== "internship") return false;
    if (applicantFilter === "course" && a.type !== "course") return false;
    if (applicantFilter === "accepted" && (a.status || "").toLowerCase() !== "accepted") return false;
    if (applicantFilter === "1 Month" && a.duration !== "1 Month") return false;
    if (applicantFilter === "3 Months" && a.duration !== "3 Months") return false;
    if (applicantFilter === "6 Months" && a.duration !== "6 Months") return false;
    if (applicantSearch) {
      const q = applicantSearch.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.role_preference || "").toLowerCase().includes(q) ||
        (a.duration || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSelectApplicant = (email: string) => {
    const next = new Set(selectedApplicants);
    if (next.has(email)) next.delete(email);
    else next.add(email);
    setSelectedApplicants(next);
  };

  const handleSelectAllFiltered = () => {
    const next = new Set(selectedApplicants);
    filteredApplicants.forEach((a) => next.add(a.email));
    setSelectedApplicants(next);
  };

  const handleDeselectAll = () => {
    setSelectedApplicants(new Set());
  };

  const handleAddSelectedToRecipients = () => {
    const chosen = Array.from(selectedApplicants);
    if (chosen.length === 0) return;

    const currentList = parseRecipientInput(recipientsRaw);
    const combined = Array.from(new Set([...currentList, ...chosen]));
    setRecipientsRaw(combined.join(", "));

    // Auto-populate personal file names
    const newPersonal = { ...personalFiles };
    applicants.forEach((a) => {
      if (chosen.includes(a.email) && !newPersonal[a.email]) {
        newPersonal[a.email] = { name: a.name, offerLetter: null, certificate: null };
      }
    });
    setPersonalFiles(newPersonal);

    setShowApplicantPicker(false);
  };

  const applyPreset = (preset: (typeof TEMPLATE_PRESETS)[0]) => {
    setSubject(preset.subject);
    setHeading(preset.heading);
    setMessage(preset.message);
    setCtaText(preset.ctaText);
    setCtaUrl(preset.ctaUrl);
    setAccentColor(preset.accentColor);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setSendResults(null);

    if (validRecipients.length === 0) {
      setStatusMsg({
        type: "error",
        text: "Please enter at least one valid recipient email.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("heading", heading);
    formData.append("brandName", brandName);
    formData.append("greetingName", greetingName);
    formData.append("message", message);
    formData.append("accentColor", accentColor);
    formData.append("ctaText", ctaText);
    formData.append("ctaUrl", ctaUrl);
    attachments.forEach((file) => formData.append("attachments", file));

    if (personalizeMode) {
      const orderedRecipients = validRecipients.map((email) => ({
        email,
        name: personalFiles[email]?.name || "",
      }));
      formData.append("personalizedRecipients", JSON.stringify(orderedRecipients));

      validRecipients.forEach((email, idx) => {
        const row = personalFiles[email];
        if (row?.offerLetter) {
          formData.append(`pf_offerLetter_${idx}`, row.offerLetter);
        }
        if (row?.certificate) {
          formData.append(`pf_certificate_${idx}`, row.certificate);
        }
      });
    } else {
      formData.append("recipients", JSON.stringify(validRecipients));
    }

    setSending(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        total: number;
        successCount: number;
        failureCount: number;
        results: { to: string; success: boolean; error?: string }[];
      }>("/admin/mailer/send", {
        method: "POST",
        body: formData,
      });

      setSendResults(res.results || null);
      if (res.failureCount === 0) {
        setStatusMsg({
          type: "success",
          text:
            res.total > 1
              ? `🚀 Sent successfully to all ${res.total} recipients via Brevo SMTP!`
              : `🚀 Email successfully delivered to ${validRecipients[0]}!`,
        });
      } else {
        setStatusMsg({
          type: "error",
          text: `${res.successCount}/${res.total} sent — ${res.failureCount} failed. Inspect individual status below.`,
        });
      }
      fetchHistory();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to send email broadcast." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* ─── Top Header & Preset Templates ────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-ink-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Mail className="w-4 h-4" /> Official Communications Suite
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Branded Email Broadcasts & Mailer</h2>
          <p className="text-xs text-ink-400 mt-1 max-w-2xl">
            Compose and dispatch verified branded emails with selectable HTML text, underlined markdown links, dynamic
            CTA buttons, and optional individual Offer Letters / Certificates via Brevo SMTP.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
          </span>
          {TEMPLATE_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 border border-ink-800 hover:border-brand-500/50 text-ink-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Two-Column Layout (Controls + Live Preview) ─────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: COMPOSITION FORM (7 Cols) */}
        <div className="xl:col-span-7 space-y-6">
          <form onSubmit={handleSend} className="space-y-6 bg-ink-950/70 border border-ink-800 p-6 sm:p-8 rounded-2xl">
            {/* Recipients Header & Picker Trigger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-400" /> Recipients
                </label>
                <button
                  type="button"
                  onClick={() => setShowApplicantPicker(true)}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 py-1 px-2.5 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 rounded-lg transition"
                >
                  <Users className="w-3.5 h-3.5" /> Pick From Applied Users ({applicants.length})
                </button>
              </div>

              <textarea
                rows={3}
                required
                value={recipientsRaw}
                onChange={(e) => setRecipientsRaw(e.target.value)}
                placeholder="student1@example.com, student2@gmail.com (comma or newline separated for bulk sends)"
                className="w-full bg-ink-900 border border-ink-800 focus:border-brand-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-ink-100 placeholder-ink-600 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono transition"
              />

              {recipientList.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                      isBulk
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        : validRecipients.length === 1
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-ink-800 text-ink-400"
                    }`}
                  >
                    {isBulk
                      ? `✦ Bulk Send (${validRecipients.length} recipients)`
                      : validRecipients.length === 1
                      ? "✦ Single Send (1 recipient)"
                      : "No valid recipients"}
                  </span>
                  {invalidRecipients.length > 0 && (
                    <span className="px-2.5 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {invalidRecipients.length} invalid email(s)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Personalized Offer Letter / Certificate Mode */}
            {validRecipients.length > 1 && (
              <div className="bg-ink-900/60 border border-ink-800 rounded-xl p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm font-semibold text-ink-200">
                  <input
                    type="checkbox"
                    checked={personalizeMode}
                    onChange={(e) => setPersonalizeMode(e.target.checked)}
                    className="w-4 h-4 rounded border-ink-700 text-brand-500 focus:ring-brand-500 bg-ink-950"
                  />
                  <span>Send each recipient their own Offer Letter / Completion Certificate</span>
                </label>

                {personalizeMode && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-ink-400">
                      Upload each candidate's unique Offer Letter and/or Certificate. They will automatically be renamed to
                      include the candidate's name.
                    </p>
                    {personalFileError && (
                      <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/30">
                        {personalFileError}
                      </p>
                    )}
                    <div className="max-h-64 overflow-y-auto border border-ink-800 rounded-lg divide-y divide-ink-800 text-xs">
                      {validRecipients.map((email) => {
                        const row = personalFiles[email] || { name: "", offerLetter: null, certificate: null };
                        return (
                          <div key={email} className="p-3 bg-ink-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="min-w-[140px] truncate">
                              <div className="font-mono text-ink-200 truncate">{email}</div>
                              <input
                                type="text"
                                placeholder="Student Full Name"
                                value={row.name || ""}
                                onChange={(e) => updatePersonalRow(email, "name", e.target.value)}
                                className="mt-1 w-full bg-ink-900 border border-ink-800 rounded px-2 py-1 text-xs text-white"
                              />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <label className="flex-1 sm:flex-initial px-2.5 py-1.5 bg-ink-900 hover:bg-ink-800 border border-ink-800 hover:border-brand-500/50 rounded cursor-pointer text-center text-ink-300 truncate max-w-[130px]">
                                <span className="truncate">{row.offerLetter ? row.offerLetter.name : "📎 Offer Letter"}</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,image/*"
                                  onChange={(e) => updatePersonalRow(email, "offerLetter", e.target.files?.[0] || null)}
                                />
                              </label>
                              <label className="flex-1 sm:flex-initial px-2.5 py-1.5 bg-ink-900 hover:bg-ink-800 border border-ink-800 hover:border-brand-500/50 rounded cursor-pointer text-center text-ink-300 truncate max-w-[130px]">
                                <span className="truncate">{row.certificate ? row.certificate.name : "🏆 Certificate"}</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,image/*"
                                  onChange={(e) => updatePersonalRow(email, "certificate", e.target.files?.[0] || null)}
                                />
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-300">Subject Line</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Action Required: Internship Milestone Deliverables"
                className="w-full bg-ink-900 border border-ink-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-ink-100 placeholder-ink-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition"
              />
            </div>

            {/* Brand Name & Accent Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-300">Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-ink-900 border border-ink-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-ink-100 placeholder-ink-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-300 flex items-center justify-between">
                  <span>Accent Color</span>
                  <span className="font-mono text-[10px] text-ink-400">{accentColor}</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-ink-900 border border-ink-800 p-1"
                  />
                  <div className="flex items-center gap-1.5">
                    {["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#e11d48"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAccentColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border ${accentColor === c ? "border-white ring-2 ring-white/30" : "border-transparent"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Heading & Greet Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-300">Heading (Optional)</label>
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="e.g. Program Onboarding & Task Desk"
                  className="w-full bg-ink-900 border border-ink-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-ink-100 placeholder-ink-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-300">Greeting Name Fallback</label>
                <input
                  type="text"
                  value={greetingName}
                  onChange={(e) => setGreetingName(e.target.value)}
                  placeholder="e.g. Tanish Dewase (Dear {name},)"
                  className="w-full bg-ink-900 border border-ink-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-ink-100 placeholder-ink-600 focus:outline-none focus:ring-1 focus:ring-brand-500 transition"
                />
              </div>
            </div>

            {/* Message Editor */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-300 flex items-center justify-between">
                <span>Message Body (Markdown Links Supported)</span>
                <span className="text-[10px] text-brand-400 font-mono">[Link Text](https://url)</span>
              </label>
              <textarea
                ref={messageRef}
                rows={6}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your email body. Use the Insert Link tool below to create clickable anchor links..."
                className="w-full bg-ink-900 border border-ink-800 focus:border-brand-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-ink-100 placeholder-ink-600 focus:outline-none focus:ring-1 focus:ring-brand-500 leading-relaxed font-sans transition"
              />

              {/* Link Inserter Tool */}
              <div className="bg-ink-900/80 border border-ink-800 rounded-xl p-3 space-y-2">
                <div className="text-[11px] font-bold text-ink-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-brand-400" /> Insert Underlined Hyperlink Tool
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    placeholder="Link text (e.g. Submission Form)"
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    className="sm:col-span-5 bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-xs text-ink-100"
                  />
                  <input
                    type="url"
                    placeholder="https://iv-theta.vercel.app/portal"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="sm:col-span-5 bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-xs text-ink-100 font-mono"
                  />
                  <button
                    type="button"
                    disabled={!linkLabel.trim() || !isValidUrl(linkUrl.trim())}
                    onClick={insertLink}
                    className="sm:col-span-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition"
                  >
                    Insert Link
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Button Box */}
            <div className="bg-ink-900/60 border border-ink-800 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-ink-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Call-To-Action Button (Optional)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Button Label (e.g. Open Portal)"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="bg-ink-950 border border-ink-800 rounded-lg px-3 py-2 text-xs text-ink-100"
                />
                <input
                  type="url"
                  placeholder="https://iv-theta.vercel.app/portal"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="bg-ink-950 border border-ink-800 rounded-lg px-3 py-2 text-xs text-ink-100 font-mono"
                />
              </div>
            </div>

            {/* Shared Attachments */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-300 flex items-center justify-between">
                <span>Shared Attachments (Sent to all recipients)</span>
                <span className="text-[10px] text-ink-400">Up to 9 files, 25MB each</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2.5 bg-ink-900 hover:bg-ink-800 border border-ink-800 hover:border-brand-500/50 rounded-xl cursor-pointer text-xs font-bold text-ink-200 flex items-center gap-2 transition">
                  <Paperclip className="w-4 h-4 text-brand-400" /> Attach Files
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFilesSelected}
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                  />
                </label>
                {attachments.length > 0 && (
                  <span className="text-xs text-ink-400">{attachments.length} file(s) attached</span>
                )}
              </div>

              {attachError && <p className="text-xs text-red-400">{attachError}</p>}

              {attachments.length > 0 && (
                <ul className="space-y-1.5 pt-1">
                  {attachments.map((file, idx) => (
                    <li
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between gap-2 p-2 bg-ink-900 border border-ink-800 rounded-lg text-xs"
                    >
                      <span className="truncate font-medium text-ink-200">📎 {file.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-ink-500 font-mono">{formatBytes(file.size)}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={sending || validRecipients.length === 0}
                className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-[0_0_25px_rgba(37,99,235,0.4)]"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching Emails via Brevo SMTP...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {isBulk
                      ? personalizeMode
                        ? `Send Personalized Emails to ${validRecipients.length} Recipients`
                        : `Send Broadcast to ${validRecipients.length} Recipients`
                      : validRecipients.length === 1
                      ? `Send Email to ${validRecipients[0]}`
                      : "Enter Recipients to Send"}
                  </>
                )}
              </button>
            </div>

            {/* Status Message */}
            {statusMsg && (
              <div
                className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-3 border ${
                  statusMsg.type === "success"
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/60 border-red-500/40 text-red-300"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0 text-red-400" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Detailed per-recipient results */}
            {sendResults && sendResults.length > 1 && (
              <div className="p-4 bg-ink-900/80 border border-ink-800 rounded-xl space-y-2">
                <div className="text-xs font-bold text-ink-300">Dispatch Report:</div>
                <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
                  {sendResults.map((r, i) => (
                    <div
                      key={`${r.to}-${i}`}
                      className={`flex items-center justify-between p-1.5 rounded ${
                        r.success ? "text-emerald-300 bg-emerald-500/10" : "text-red-300 bg-red-500/10"
                      }`}
                    >
                      <span className="font-mono truncate">{r.to}</span>
                      <span className="font-bold">{r.success ? "✓ Delivered" : `✗ Failed: ${r.error}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* RIGHT COLUMN: LIVE REALISTIC EMAIL PREVIEW (5 Cols) */}
        <div className="xl:col-span-5 space-y-4 sticky top-24">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-400">
            <span className="flex items-center gap-1.5 text-white">
              <Eye className="w-4 h-4 text-brand-400" /> Live Rendered Email Preview
            </span>
            <span className="text-[10px] text-ink-500 font-mono">HTML Real-Time</span>
          </div>

          {/* Email Preview Frame */}
          <div className="bg-white text-slate-800 rounded-2xl overflow-hidden border border-ink-800 shadow-2xl">
            {/* Header Bar */}
            <div className="bg-[#111827] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-5 bg-[#f4c542] rounded-sm inline-block" />
                <span className="w-2.5 h-3.5 bg-[#3fbf61] rounded-sm inline-block" />
                <span className="w-2.5 h-6 bg-[#4a90e2] rounded-sm mr-2 inline-block" />
                <span className="text-lg font-bold tracking-tight" style={{ color: accentColor }}>
                  {brandName || "InternVision Tech HR"}
                </span>
              </div>
            </div>

            {/* Email Body */}
            <div className="p-6 sm:p-7 space-y-4">
              {heading && <h3 className="text-lg font-bold text-slate-900">{heading}</h3>}
              {greetingName && <p className="text-sm font-semibold text-slate-700">Dear {greetingName},</p>}
              <div
                className="prose prose-sm max-w-none text-slate-600 select-text leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: renderMessagePreview(message, accentColor),
                }}
              />

              {ctaText && ctaUrl && isValidUrl(ctaUrl) && (
                <div className="pt-3 text-center">
                  <a
                    href={ctaUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ backgroundColor: accentColor }}
                    className="inline-block px-7 py-3 text-white font-bold text-xs rounded-full shadow-md hover:opacity-95 transition"
                  >
                    {ctaText}
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 leading-normal">
              Sent by <strong>{brandName || "InternVision Tech HR"}</strong>
              <br />
              Official Educational Communications • Verified Credentials Platform
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="p-3 bg-ink-900 border border-ink-800 rounded-xl text-xs text-ink-300">
              <strong className="text-white">Attachments ({attachments.length}):</strong>{" "}
              {attachments.map((f) => f.name).join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* ─── Applicant Directory Picker Modal / Drawer ────────────────── */}
      {showApplicantPicker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ink-950 border border-ink-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-ink-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-400" /> Applied Candidates Directory
                </h3>
                <p className="text-xs text-ink-400 mt-0.5">
                  Select applicants from your database to immediately populate the Mailer recipient list.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplicantPicker(false)}
                className="w-8 h-8 rounded-lg bg-ink-900 border border-ink-800 hover:bg-ink-800 text-ink-300 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-ink-900/60 border-b border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-ink-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, email, track..."
                  value={applicantSearch}
                  onChange={(e) => setApplicantSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-ink-950 border border-ink-800 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto flex-wrap">
                {(["all", "accepted", "internship", "course", "1 Month", "3 Months", "6 Months"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setApplicantFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      applicantFilter === f
                        ? "bg-brand-600 text-white shadow-sm"
                        : "bg-ink-950 border border-ink-800 text-ink-300 hover:bg-ink-800"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidates Table List */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-ink-800">
              {loadingApplicants ? (
                <div className="p-8 text-center text-xs text-ink-400">Loading applicants from database...</div>
              ) : filteredApplicants.length === 0 ? (
                <div className="p-8 text-center text-xs text-ink-500">No applicants found matching your filter.</div>
              ) : (
                filteredApplicants.map((a) => {
                  const isChecked = selectedApplicants.has(a.email);
                  return (
                    <div
                      key={a.email}
                      onClick={() => toggleSelectApplicant(a.email)}
                      className={`py-3 px-3 flex items-center justify-between gap-3 rounded-lg cursor-pointer transition ${
                        isChecked ? "bg-brand-500/15 border border-brand-500/30" : "hover:bg-ink-900/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-brand-400">
                          {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-ink-600" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{a.name}</div>
                          <div className="text-[11px] font-mono text-ink-400 truncate">{a.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-xs">
                        <span className="px-2 py-0.5 bg-ink-900 text-ink-300 border border-ink-800 rounded font-medium text-[10px]">
                          {a.role_preference}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            (a.status || "").toLowerCase() === "accepted"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-ink-800 bg-ink-900/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-ink-400">
                <button type="button" onClick={handleSelectAllFiltered} className="hover:text-white underline">
                  Select All ({filteredApplicants.length})
                </button>
                •
                <button type="button" onClick={handleDeselectAll} className="hover:text-white underline">
                  Clear
                </button>
                •
                <span className="font-bold text-brand-400">{selectedApplicants.size} selected</span>
              </div>

              <button
                type="button"
                onClick={handleAddSelectedToRecipients}
                disabled={selectedApplicants.size === 0}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Add Selected to Recipients ({selectedApplicants.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Send History Audit Log Table ─────────────────────────────── */}
      <div className="space-y-4 pt-6 border-t border-ink-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" /> Send History & Audit Trail
            </h3>
            <p className="text-xs text-ink-400">
              Persistent record of all single and bulk broadcasts delivered via Brevo SMTP.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchHistory}
            className="p-2 bg-ink-900 hover:bg-ink-800 border border-ink-800 text-ink-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? "animate-spin" : ""}`} /> Refresh Log
          </button>
        </div>

        <div className="bg-ink-950/70 border border-ink-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-900/80 text-ink-400 font-bold uppercase tracking-wider border-b border-ink-800">
                <tr>
                  <th className="px-5 py-3.5">Recipient</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Mode</th>
                  <th className="px-5 py-3.5">Attachments</th>
                  <th className="px-5 py-3.5">Dispatched At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/60 font-sans">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-ink-500">
                      No broadcast emails sent yet.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id} className="hover:bg-ink-900/40 transition">
                      <td className="px-5 py-3 font-mono text-ink-200">
                        {h.to}
                        {h.recipient_name && <div className="text-[10px] text-ink-500 font-sans">{h.recipient_name}</div>}
                      </td>
                      <td className="px-5 py-3 text-white font-medium max-w-xs truncate">{h.subject}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            h.status === "success"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-red-500/20 text-red-300 border border-red-500/40"
                          }`}
                        >
                          {h.status === "success" ? "✓ Sent" : "✗ Failed"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 bg-ink-900 text-ink-400 border border-ink-800 rounded text-[10px] font-mono">
                          {h.batch_id ? "Bulk Batch" : "Single"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-400 text-[11px]">
                        {(h.attachment_names || []).length > 0 ? (
                          <span className="truncate max-w-[160px] inline-block font-mono">
                            📎 {(h.attachment_names || []).join(", ")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3 text-ink-500 text-[11px] font-mono">
                        {h.created_at ? new Date(h.created_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
