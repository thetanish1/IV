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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] p-6 sm:p-8 shadow-2xl space-y-6 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-gray-200 dark:border-[#27272A] pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
              Application #{app.id}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-[#27272A] text-gray-700 dark:text-gray-300">
              {app.duration} Track
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{app.full_name}</h2>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap font-mono">
            <span>{app.email}</span>
            <span>•</span>
            <span>{app.phone}</span>
            {app.google_email && (
              <>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400">Google: {app.google_email}</span>
              </>
            )}
          </div>
        </div>

        {/* Academic & Track Profile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2E2E33] space-y-1">
            <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px] block">Academic Background</span>
            <div className="font-semibold text-gray-900 dark:text-white">{app.college}</div>
            <div className="text-gray-600 dark:text-gray-300">{app.degree} ({app.year_of_study})</div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2E2E33] space-y-1">
            <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px] block">Preferred Domain</span>
            <div className="font-semibold text-blue-600 dark:text-blue-400">{app.role_preference || "Not specified"}</div>
            <div className="text-gray-500 dark:text-gray-400 truncate">{app.skills?.join(", ") || "No skills listed"}</div>
          </div>
        </div>

        {/* Professional Links */}
        <div className="flex items-center gap-2 flex-wrap">
          {app.linkedin_url && (
            <a
              href={app.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-gray-100 dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#27272A] border border-gray-200 dark:border-[#2E2E33] text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
            </a>
          )}
          {app.github_url && (
            <a
              href={app.github_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-gray-100 dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#27272A] border border-gray-200 dark:border-[#2E2E33] text-gray-900 dark:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" /> GitHub
            </a>
          )}
          {app.portfolio_url && (
            <a
              href={app.portfolio_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-gray-100 dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#27272A] border border-gray-200 dark:border-[#2E2E33] text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" /> Portfolio
            </a>
          )}
          {app.resume_filename && (
            <button
              type="button"
              onClick={() => onPreviewResume(getResumeUrl(app.resume_filename), app.full_name)}
              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> View Resume PDF
            </button>
          )}
        </div>

        {/* Experience & Cover Letter */}
        {app.experience_description && (
          <div className="space-y-1.5 bg-gray-50 dark:bg-[#1F1F23] p-4 rounded-xl border border-gray-200 dark:border-[#2E2E33]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Technical Experience & Projects</span>
            <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{app.experience_description}</p>
          </div>
        )}

        {app.cover_letter && (
          <div className="space-y-1.5 bg-gray-50 dark:bg-[#1F1F23] p-4 rounded-xl border border-gray-200 dark:border-[#2E2E33]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Cover Letter & Motivation</span>
            <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{app.cover_letter}</p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-4 border-t border-gray-200 dark:border-[#27272A] flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => onDeleteApp(app.id, app.full_name)}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-red-600 dark:text-rose-400 border border-red-200 dark:border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Application
          </button>

          <div className="flex items-center gap-2">
            {app.status !== "accepted" && (
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => onUpdateStatus(app.id, "accepted")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
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
                className="px-3.5 py-2 bg-gray-100 hover:bg-red-50 dark:bg-[#1F1F23] dark:hover:bg-rose-500/20 text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-rose-300 border border-gray-200 dark:border-[#2E2E33] rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
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
