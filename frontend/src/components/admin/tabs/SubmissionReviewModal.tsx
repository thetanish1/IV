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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ink-950 border-2 border-blue-500/40 p-6 sm:p-8 shadow-2xl space-y-6 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-ink-400 hover:text-white transition rounded-lg hover:bg-ink-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-ink-800 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-lg">
            <FolderGit2 className="w-3.5 h-3.5" /> Grade & Review Deliverable
          </div>
          <h2 className="text-xl font-bold text-white mt-2">
            {sub.task_key.toUpperCase()}: {sub.title}
          </h2>
          <div className="text-xs text-ink-400 mt-1">
            Candidate: <strong className="text-white">{sub.student_name}</strong> ({sub.student_email})
          </div>
        </div>

        {/* Work Links */}
        <div className="space-y-3 bg-ink-900/50 p-4 border border-ink-800 rounded-xl">
          <h4 className="text-xs font-bold uppercase text-ink-400 tracking-wider">Submitted Links & Artifacts</h4>
          <div className="flex flex-wrap gap-2.5">
            {sub.github_url && (
              <a
                href={sub.github_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-ink-950 hover:bg-ink-900 text-blue-400 border border-ink-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Code2 className="w-3.5 h-3.5" /> GitHub Repository
              </a>
            )}
            {sub.live_url && (
              <a
                href={sub.live_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-ink-950 hover:bg-ink-900 text-emerald-400 border border-ink-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Globe className="w-3.5 h-3.5" /> Live Production URL
              </a>
            )}
            {sub.documentation_url && (
              <a
                href={sub.documentation_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-ink-950 hover:bg-ink-900 text-purple-400 border border-ink-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5" /> Documentation
              </a>
            )}
          </div>

          {sub.notes && (
            <div className="pt-2 border-t border-ink-800/60 text-xs text-ink-300">
              <strong className="text-white block mb-1">Student Notes:</strong>
              <p className="whitespace-pre-wrap">{sub.notes}</p>
            </div>
          )}
        </div>

        {/* Review Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-300 uppercase">Grade / Evaluation Decision</label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              className="w-full bg-ink-900 border border-ink-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="approved">Approved / Accepted (Complete)</option>
              <option value="needs_revision">Needs Revision (Request changes)</option>
              <option value="submitted">Under Review</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-300 uppercase">
              Admin Feedback & Mentor Comments
            </label>
            <textarea
              rows={4}
              placeholder="Provide constructive feedback, notes, code suggestions or approval remarks..."
              value={reviewFeedback}
              onChange={(e) => setReviewFeedback(e.target.value)}
              className="w-full bg-ink-900 border border-ink-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-ink-900/40 border border-ink-800 rounded-lg">
            <input
              type="checkbox"
              id="reviewUnlocked"
              checked={reviewUnlocked}
              onChange={(e) => setReviewUnlocked(e.target.checked)}
              className="w-4 h-4 rounded bg-ink-950 border-ink-700 text-blue-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="reviewUnlocked" className="text-xs text-ink-200 cursor-pointer select-none">
              Module Access Status: <strong>{reviewUnlocked ? "Unlocked for candidate" : "Locked"}</strong>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-ink-900 hover:bg-ink-800 text-ink-300 rounded-lg text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={savingReview}
            onClick={onSaveReview}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-blue-600/30"
          >
            {savingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Evaluation"}
          </button>
        </div>
      </div>
    </div>
  );
}
