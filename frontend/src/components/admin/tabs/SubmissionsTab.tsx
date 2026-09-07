import React, { useState, useEffect, useCallback } from "react";
import { FolderGit2, Search, RefreshCw, Loader2, Code2, Globe, FileText } from "lucide-react";
import { SubmissionAdminItem } from "@/types";
import { apiRequest } from "@/lib/api-client";
import { FadeIn } from "@/components/animations/FadeIn";
import StatusBadge from "../common/StatusBadge";
import DurationFilterSelect from "../common/DurationFilterSelect";
import AdminSearchBar from "../common/AdminSearchBar";
import SubmissionReviewModal from "./SubmissionReviewModal";

export default function SubmissionsTab() {
  const [submissionsList, setSubmissionsList] = useState<SubmissionAdminItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [subSearch, setSubSearch] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState("all");
  const [subDurationFilter, setSubDurationFilter] = useState("all");

  const [selectedSub, setSelectedSub] = useState<SubmissionAdminItem | null>(null);
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewUnlocked, setReviewUnlocked] = useState(true);
  const [savingReview, setSavingReview] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoadingSubmissions(true);
    try {
      const params = new URLSearchParams();
      if (subStatusFilter !== "all") params.set("status", subStatusFilter);
      if (subDurationFilter !== "all") params.set("duration", subDurationFilter);
      if (subSearch) params.set("q", subSearch);

      const data = await apiRequest<{ items: SubmissionAdminItem[]; total: number } | SubmissionAdminItem[]>(
        `/admin/submissions?${params.toString()}`
      );
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []);
      setSubmissionsList(list);
    } catch (err) {
      console.error("Failed to fetch submissions", err);
      setSubmissionsList([]);
    } finally {
      setLoadingSubmissions(false);
    }
  }, [subStatusFilter, subDurationFilter, subSearch]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleOpenReviewModal = (sub: SubmissionAdminItem) => {
    setSelectedSub(sub);
    setReviewStatus(sub.status || "approved");
    setReviewFeedback(sub.admin_feedback || "");
    setReviewUnlocked(sub.is_unlocked ?? true);
  };

  const handleSaveReview = async () => {
    if (!selectedSub) return;
    setSavingReview(true);
    try {
      const updated = await apiRequest<SubmissionAdminItem>(`/admin/submissions/${selectedSub.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: reviewStatus,
          admin_feedback: reviewFeedback,
          is_unlocked: reviewUnlocked,
        }),
      });
      setSubmissionsList((prev) =>
        (Array.isArray(prev) ? prev : []).map((s) => (s.id === selectedSub.id ? { ...s, ...updated } : s))
      );
      setSelectedSub(null);
    } catch (err) {
      console.error("Failed to save review", err);
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <FadeIn delay={0.2} direction="up">
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-400" /> Student Task & Project Submissions
            </h2>
            <p className="text-xs text-ink-400 mt-0.5">
              Review weekly deliverables, GitHub repositories, live deployments, and assign mentor feedback.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <AdminSearchBar
              placeholder="Search student or task..."
              value={subSearch}
              onChange={(val) => setSubSearch(val)}
              accentColor="blue"
            />
            <select
              value={subStatusFilter}
              onChange={(e) => setSubStatusFilter(e.target.value)}
              className="bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="needs_revision">Needs Revision</option>
            </select>
            <DurationFilterSelect
              value={subDurationFilter}
              onChange={(val) => setSubDurationFilter(val)}
              accentColor="blue"
            />
            <button
              type="button"
              onClick={fetchSubmissions}
              className="p-2 bg-ink-900 border border-ink-800 rounded-lg text-ink-300 hover:text-white transition"
              title="Refresh Submissions"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-950/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-ink-900/50 text-ink-400 font-medium border-b border-ink-800 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Student</th>
                  <th className="px-5 py-3.5 font-medium">Domain & Track</th>
                  <th className="px-5 py-3.5 font-medium">Task / Project</th>
                  <th className="px-5 py-3.5 font-medium">Work Artifacts</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Submitted</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/50">
                {loadingSubmissions ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-400" />
                    </td>
                  </tr>
                ) : submissionsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-ink-500 text-sm">
                      No submissions found matching criteria.
                    </td>
                  </tr>
                ) : (
                  submissionsList.map((sub) => (
                    <tr key={sub.id} className="hover:bg-ink-900/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{sub.student_name}</div>
                        <div className="text-xs text-ink-400 font-mono">{sub.student_email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs text-ink-200">{sub.role_preference}</div>
                        <div className="text-[10px] text-ink-500">{sub.duration} Track</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-ink-800 text-brand-400">
                            {sub.task_key}
                          </span>
                          {sub.title}
                        </div>
                        {sub.project_topic && (
                          <div className="text-[11px] text-purple-400 mt-0.5 font-medium">
                            Topic: {sub.project_topic}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {sub.github_url && (
                            <a
                              href={sub.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-ink-900 hover:bg-ink-800 text-ink-200 hover:text-white border border-ink-800 rounded text-xs flex items-center gap-1 transition"
                              title="Open GitHub Repository"
                            >
                              <Code2 className="w-3 h-3 text-blue-400" /> Code
                            </a>
                          )}
                          {sub.live_url && (
                            <a
                              href={sub.live_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-ink-900 hover:bg-ink-800 text-ink-200 hover:text-white border border-ink-800 rounded text-xs flex items-center gap-1 transition"
                              title="Open Live Deployment"
                            >
                              <Globe className="w-3 h-3 text-emerald-400" /> Demo
                            </a>
                          )}
                          {sub.documentation_url && (
                            <a
                              href={sub.documentation_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-ink-900 hover:bg-ink-800 text-ink-200 hover:text-white border border-ink-800 rounded text-xs flex items-center gap-1 transition"
                              title="Open Documentation"
                            >
                              <FileText className="w-3 h-3 text-purple-400" /> Docs
                            </a>
                          )}
                          {!sub.github_url && !sub.live_url && !sub.documentation_url && (
                            <span className="text-xs text-ink-500 italic">No links</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={sub.status || "submitted"} />
                      </td>
                      <td className="px-5 py-4 text-xs text-ink-400">
                        {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal(sub)}
                          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold transition"
                        >
                          Review / Grade
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grade / Review Modal */}
        <SubmissionReviewModal
          sub={selectedSub}
          reviewStatus={reviewStatus}
          setReviewStatus={setReviewStatus}
          reviewFeedback={reviewFeedback}
          setReviewFeedback={setReviewFeedback}
          reviewUnlocked={reviewUnlocked}
          setReviewUnlocked={setReviewUnlocked}
          savingReview={savingReview}
          onClose={() => setSelectedSub(null)}
          onSaveReview={handleSaveReview}
        />
      </div>
    </FadeIn>
  );
}
