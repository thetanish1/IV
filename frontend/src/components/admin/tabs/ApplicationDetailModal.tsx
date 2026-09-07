import React from "react";
import { X, CheckCircle2, FileText, ExternalLink, Trash2, Loader2, Globe, Code2 } from "lucide-react";
import { InternshipApplicationResponse } from "@/types";

interface ApplicationDetailModalProps {
  app: InternshipApplicationResponse | null;
  updatingStatus: boolean;
  onClose: () => void;
  onUpdateStatus: (id: number, status: string) => void;
  onPreviewResume: (url: string, name: string) => void;
  onDeleteApp: (id: number, name?: string) => void;
  getResumeUrl: (filename?: string | null) => string;
}

export default function ApplicationDetailModal({
  app,
  updatingStatus,
  onClose,
  onUpdateStatus,
  onPreviewResume,
  onDeleteApp,
  getResumeUrl,
}: ApplicationDetailModalProps) {
  if (!app) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ink-950 border-2 border-brand-500/40 p-6 sm:p-8 shadow-2xl space-y-6 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-ink-400 hover:text-white transition rounded-lg hover:bg-ink-900"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-ink-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Application #{app.id}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ink-800 text-ink-300">
              {app.duration} Track
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-2">{app.full_name}</h2>
          <div className="text-xs text-ink-400 mt-1 flex items-center gap-2 flex-wrap font-mono">
            <span>{app.email}</span>
            <span>•</span>
            <span>{app.phone}</span>
            {app.google_email && (
              <>
                <span>•</span>
                <span className="text-brand-400">Google: {app.google_email}</span>
              </>
            )}
          </div>
        </div>

        {/* Academic & Track Profile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-ink-900/60 border border-ink-800 space-y-1">
            <span className="text-ink-400 font-bold uppercase tracking-wider text-[10px] block">Academic Background</span>
            <div className="font-semibold text-white">{app.college}</div>
            <div className="text-ink-300">{app.degree} ({app.year_of_study})</div>
          </div>

          <div className="p-3.5 rounded-xl bg-ink-900/60 border border-ink-800 space-y-1">
            <span className="text-ink-400 font-bold uppercase tracking-wider text-[10px] block">Preferred Domain</span>
            <div className="font-semibold text-brand-300">{app.role_preference || "Not specified"}</div>
            <div className="text-ink-400 truncate">{app.skills?.join(", ") || "No skills listed"}</div>
          </div>
        </div>

        {/* Professional Links */}
        <div className="flex items-center gap-2 flex-wrap">
          {app.linkedin_url && (
            <a
              href={app.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 border border-ink-800 text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
            </a>
          )}
          {app.github_url && (
            <a
              href={app.github_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 border border-ink-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Code2 className="w-3.5 h-3.5" /> GitHub
            </a>
          )}
          {app.portfolio_url && (
            <a
              href={app.portfolio_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 border border-ink-800 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Globe className="w-3.5 h-3.5" /> Portfolio
            </a>
          )}
          {app.resume_filename && (
            <button
              type="button"
              onClick={() => onPreviewResume(getResumeUrl(app.resume_filename), app.full_name)}
              className="px-3 py-1.5 bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/40 text-brand-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5" /> View Resume PDF
            </button>
          )}
        </div>

        {/* Experience & Cover Letter */}
        {app.experience_description && (
          <div className="space-y-1.5 bg-ink-900/40 p-4 rounded-xl border border-ink-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block">Technical Experience & Projects</span>
            <p className="text-xs text-ink-200 leading-relaxed whitespace-pre-wrap">{app.experience_description}</p>
          </div>
        )}

        {app.cover_letter && (
          <div className="space-y-1.5 bg-ink-900/40 p-4 rounded-xl border border-ink-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block">Cover Letter & Motivation</span>
            <p className="text-xs text-ink-200 leading-relaxed whitespace-pre-wrap">{app.cover_letter}</p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-4 border-t border-ink-800 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => onDeleteApp(app.id, app.full_name)}
            className="px-3 py-2 bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-800/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" /> Delete Application
          </button>

          <div className="flex items-center gap-2">
            {app.status !== "accepted" && (
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => onUpdateStatus(app.id, "accepted")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
              >
                {updatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Approve & Send Onboarding
              </button>
            )}
            {app.status !== "rejected" && (
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => onUpdateStatus(app.id, "rejected")}
                className="px-3.5 py-2 bg-ink-900 hover:bg-red-600/30 text-ink-300 hover:text-red-300 border border-ink-800 rounded-lg text-xs font-medium transition disabled:opacity-50"
              >
                Reject
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
