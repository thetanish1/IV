import React, { useState, useEffect, useCallback } from "react";
import { Users, Eye, Trash2, Download, Loader2, RefreshCw } from "lucide-react";
import { InternshipApplicationResponse, PaginatedResult } from "@/types";
import { apiRequest } from "@/lib/api-client";
import { FadeIn } from "@/components/animations/FadeIn";
import Pagination from "../common/Pagination";
import StatusBadge from "../common/StatusBadge";
import DurationFilterSelect from "../common/DurationFilterSelect";
import AdminSearchBar from "../common/AdminSearchBar";
import ApplicationDetailModal from "./ApplicationDetailModal";

interface ApplicantsTabProps {
  onPreviewResume: (url: string, name: string) => void;
  getResumeUrl: (filename?: string | null) => string;
  onRefreshStats: () => void;
}

export default function ApplicantsTab({
  onPreviewResume,
  getResumeUrl,
  onRefreshStats,
}: ApplicantsTabProps) {
  const [appsData, setAppsData] = useState<PaginatedResult<InternshipApplicationResponse>>({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 1,
    items: [],
  });
  const [appsSearch, setAppsSearch] = useState("");
  const [appsDuration, setAppsDuration] = useState("all");
  const [appsPage, setAppsPage] = useState(1);
  const [loadingApps, setLoadingApps] = useState(false);

  const [selectedApp, setSelectedApp] = useState<InternshipApplicationResponse | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingAppId, setDeletingAppId] = useState<number | null>(null);
  const [deletingAllApps, setDeletingAllApps] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const params = new URLSearchParams({
        page: appsPage.toString(),
        limit: "10",
      });
      if (appsSearch) params.set("q", appsSearch);
      if (appsDuration !== "all") params.set("duration", appsDuration);

      const data = await apiRequest<PaginatedResult<InternshipApplicationResponse>>(
        `/admin/applications?${params.toString()}`
      );
      setAppsData(data && Array.isArray(data.items) ? data : { total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
    } catch (err) {
      console.error("Failed to load applications", err);
      setAppsData({ total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
    } finally {
      setLoadingApps(false);
    }
  }, [appsPage, appsSearch, appsDuration]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleUpdateAppStatus = async (appId: number, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const updated = await apiRequest<InternshipApplicationResponse>(`/admin/applications/${appId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setSelectedApp(updated);
      setAppsData((prev) => ({
        ...prev,
        items: (prev?.items || []).map((item) => (item.id === appId ? { ...item, status: newStatus } : item)),
      }));
      onRefreshStats();
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteApp = async (appId: number, studentName?: string) => {
    if (!confirm(`Are you sure you want to permanently delete the application for "${studentName || `ID #${appId}`}" from the database?`)) return;
    setDeletingAppId(appId);
    try {
      await apiRequest(`/admin/applications/${appId}`, { method: "DELETE" });
      if (selectedApp?.id === appId) setSelectedApp(null);
      setAppsData((prev) => ({
        ...prev,
        total: Math.max(0, (prev?.total || 1) - 1),
        items: (prev?.items || []).filter((item) => item.id !== appId),
      }));
      onRefreshStats();
    } catch (err) {
      console.error("Failed to delete application", err);
      alert("Failed to delete application. Please try again.");
    } finally {
      setDeletingAppId(null);
    }
  };

  const handleDeleteAllApps = async () => {
    const confirmation = prompt("⚠️ DANGER: Type 'DELETE ALL' to permanently erase ALL internship applications:");
    if (confirmation !== "DELETE ALL") {
      if (confirmation !== null) alert("Operation cancelled.");
      return;
    }
    setDeletingAllApps(true);
    try {
      await apiRequest("/admin/applications/all", { method: "DELETE" });
      setSelectedApp(null);
      setAppsData({ total: 0, page: 1, limit: 10, total_pages: 1, items: [] });
      onRefreshStats();
      alert("All applications have been successfully deleted.");
    } catch (err) {
      console.error("Failed to delete all applications", err);
      alert("Failed to delete all applications.");
    } finally {
      setDeletingAllApps(false);
    }
  };

  return (
    <FadeIn delay={0.2} direction="up">
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400" /> Internship Applications
            </h2>
            <p className="text-xs text-ink-400 mt-0.5">
              Review applicant resumes, academic background, track preference, and enrollment statuses.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <AdminSearchBar
              placeholder="Search applicants..."
              value={appsSearch}
              onChange={(val) => {
                setAppsSearch(val);
                setAppsPage(1);
              }}
            />
            <DurationFilterSelect
              value={appsDuration}
              onChange={(val) => {
                setAppsDuration(val);
                setAppsPage(1);
              }}
            />
            <button
              type="button"
              onClick={fetchApplications}
              className="p-2 bg-ink-900 border border-ink-800 rounded-lg text-ink-300 hover:text-white transition"
              title="Refresh applications"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDeleteAllApps}
              disabled={deletingAllApps}
              className="px-3 py-1.5 text-xs font-semibold bg-red-950/60 border border-red-800/70 hover:bg-red-900 text-red-300 hover:text-white rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
              title="Delete all applications"
            >
              {deletingAllApps ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete All
            </button>
          </div>
        </div>

        <div className="border border-ink-800 rounded-xl overflow-hidden bg-ink-950/40 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-ink-900/60 text-ink-400 font-medium border-b border-ink-800 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Applicant</th>
                  <th className="px-5 py-3.5 font-medium">College & Degree</th>
                  <th className="px-5 py-3.5 font-medium">Track / Skills</th>
                  <th className="px-5 py-3.5 font-medium">Duration</th>
                  <th className="px-5 py-3.5 font-medium">Resume</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/50">
                {loadingApps ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-400" />
                    </td>
                  </tr>
                ) : appsData.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-ink-500 text-sm">
                      No internship applications found.
                    </td>
                  </tr>
                ) : (
                  appsData.items.map((app) => (
                    <tr key={app.id} className="hover:bg-ink-900/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{app.full_name}</div>
                        <div className="text-xs text-ink-400">{app.email}</div>
                        {app.phone && <div className="text-[11px] text-ink-500">{app.phone}</div>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-ink-200 font-medium">{app.college}</div>
                        <div className="text-xs text-ink-400">{app.degree} · {app.year_of_study}</div>
                      </td>
                      <td className="px-5 py-4 max-w-[220px]">
                        {app.role_preference && (
                          <div className="text-xs font-semibold text-brand-400 truncate mb-1">
                            {app.role_preference}
                          </div>
                        )}
                        <div className="text-ink-400 text-xs truncate">
                          {app.skills?.join(", ") || "None"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded bg-ink-900 text-ink-300 text-xs font-medium border border-ink-800">
                          {app.duration}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {app.resume_filename ? (
                          <button
                            type="button"
                            onClick={() => onPreviewResume(getResumeUrl(app.resume_filename), app.full_name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/40 text-brand-300 rounded text-xs font-semibold transition"
                            title="Preview Resume in Modal"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        ) : (
                          <span className="text-xs text-ink-500 italic">No File</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={app.status || "pending"} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedApp(app)}
                            className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-ink-200 hover:text-white border border-ink-800 rounded-lg text-xs font-semibold transition"
                          >
                            Review
                          </button>
                          <button
                            type="button"
                            disabled={deletingAppId === app.id}
                            onClick={() => handleDeleteApp(app.id, app.full_name)}
                            className="p-1.5 text-ink-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                            title="Delete Application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={appsData.page}
            totalPages={appsData.total_pages}
            totalItems={appsData.total}
            itemName="applications"
            onPageChange={(p) => setAppsPage(p)}
          />
        </div>

        {/* Application Detail Modal */}
        <ApplicationDetailModal
          app={selectedApp}
          updatingStatus={updatingStatus}
          onClose={() => setSelectedApp(null)}
          onUpdateStatus={handleUpdateAppStatus}
          onPreviewResume={onPreviewResume}
          onDeleteApp={handleDeleteApp}
          getResumeUrl={getResumeUrl}
        />
      </div>
    </FadeIn>
  );
}
