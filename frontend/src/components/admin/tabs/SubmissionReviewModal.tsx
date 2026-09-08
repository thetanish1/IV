import React from "react";
import { X, FolderGit2, Code2, Globe, FileText, Loader2 } from "lucide-react";
import { SubmissionAdminItem } from "@/types";

interface SubmissionReviewModalProps {
  sub: SubmissionAdminItem | null;
  reviewStatus: string;
  setReviewStatus: (s: string) => void;
  reviewFeedback: string;
  setReviewFeedback: (f: string) => void;
  reviewUnlocked: boolean;
  setReviewUnlocked: (u: boolean) => void;
  savingReview: boolean;
  onClose: () => void;
  onSaveReview: () => void;
}

export default function SubmissionReviewModal({
  sub,
  reviewStatus,
  setReviewStatus,
  reviewFeedback,
  setReviewFeedback,
  reviewUnlocked,
  setReviewUnlocked,
  savingReview,
  onClose,
  onSaveReview,
}: SubmissionReviewModalProps) {
  if (!sub) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#2E2E33] p-6 sm:p-8 shadow-2xl space-y-6 rounded-2xl text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A30]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-lg">
            <FolderGit2 className="w-3.5 h-3.5" /> Grade & Review Deliverable
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
            {sub.task_key.toUpperCase()}: {sub.title}
          </h2>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Candidate: <strong className="text-gray-800 dark:text-gray-200">{sub.student_name}</strong> ({sub.student_email})
          </div>
        </div>

        {/* Work Links */}
        <div className="space-y-3 bg-gray-50 dark:bg-[#1F1F23] p-4 border border-gray-200 dark:border-zinc-800 rounded-xl">
          <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Submitted Links & Artifacts</h4>
          <div className="flex flex-wrap gap-2.5">
            {sub.github_url && (
              <a
                href={sub.github_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white dark:bg-[#151518] hover:bg-gray-100 dark:hover:bg-[#2A2A30] text-blue-700 dark:text-blue-400 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
              >
                <Code2 className="w-3.5 h-3.5" /> GitHub Repository
              </a>
            )}
            {sub.live_url && (
              <a
                href={sub.live_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white dark:bg-[#151518] hover:bg-gray-100 dark:hover:bg-[#2A2A30] text-emerald-700 dark:text-emerald-400 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
              >
                <Globe className="w-3.5 h-3.5" /> Live Production URL
              </a>
            )}
            {sub.documentation_url && (
              <a
                href={sub.documentation_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white dark:bg-[#151518] hover:bg-gray-100 dark:hover:bg-[#2A2A30] text-purple-700 dark:text-purple-400 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" /> Documentation
              </a>
            )}
          </div>

          {sub.notes && (
            <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 text-xs text-gray-700 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-white block mb-1">Student Notes:</strong>
              <p className="whitespace-pre-wrap">{sub.notes}</p>
            </div>
          )}
        </div>

        {/* Review Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Grade / Evaluation Decision</label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            >
              <option value="approved">Approved / Accepted (Complete)</option>
              <option value="needs_revision">Needs Revision (Request changes)</option>
              <option value="submitted">Under Review</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
              Admin Feedback & Mentor Comments
            </label>
            <textarea
              rows={4}
              placeholder="Provide constructive feedback, notes, code suggestions or approval remarks..."
              value={reviewFeedback}
              onChange={(e) => setReviewFeedback(e.target.value)}
              className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] rounded-lg p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-zinc-800 rounded-lg">
            <input
              type="checkbox"
              id="reviewUnlocked"
              checked={reviewUnlocked}
              onChange={(e) => setReviewUnlocked(e.target.checked)}
              className="w-4 h-4 rounded bg-white dark:bg-[#121214] border-gray-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="reviewUnlocked" className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              Module Access Status: <strong>{reviewUnlocked ? "Unlocked for candidate" : "Locked"}</strong>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#2A2A30] dark:hover:bg-[#323238] text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={savingReview}
            onClick={onSaveReview}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-blue-600/20"
          >
            {savingReview ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : (
              "Save Review & Send Update"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
