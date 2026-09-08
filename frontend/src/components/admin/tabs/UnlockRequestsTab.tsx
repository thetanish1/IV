import React, { useState, useEffect, useCallback } from "react";
import { Unlock, Lock, RefreshCw, Loader2 } from "lucide-react";
import { UnlockRequestAdminItem } from "@/types";
import { apiRequest } from "@/lib/api-client";
import { FadeIn } from "@/components/animations/FadeIn";
import StatusBadge from "../common/StatusBadge";
import DurationFilterSelect from "../common/DurationFilterSelect";

export default function UnlockRequestsTab() {
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequestAdminItem[]>([]);
  const [loadingUnlocks, setLoadingUnlocks] = useState(false);
  const [unlockFilter, setUnlockFilter] = useState("all");
  const [unlockDurationFilter, setUnlockDurationFilter] = useState("all");
  const [actioningUnlockId, setActioningUnlockId] = useState<number | null>(null);

  const fetchUnlockRequests = useCallback(async () => {
    setLoadingUnlocks(true);
    try {
      const params = new URLSearchParams();
      if (unlockFilter !== "all") params.set("status", unlockFilter);
      if (unlockDurationFilter !== "all") params.set("duration", unlockDurationFilter);
      const endpoint = params.toString() ? `/admin/unlock-requests?${params.toString()}` : "/admin/unlock-requests";
      const data = await apiRequest<{ items: UnlockRequestAdminItem[]; total: number } | UnlockRequestAdminItem[]>(endpoint);
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []);
      setUnlockRequests(list);
    } catch (err) {
      console.error("Failed to load unlock requests", err);
      setUnlockRequests([]);
    } finally {
      setLoadingUnlocks(false);
    }
  }, [unlockFilter, unlockDurationFilter]);

  useEffect(() => {
    fetchUnlockRequests();
  }, [fetchUnlockRequests]);

  const handleUnlockAction = async (id: number, action: "approve" | "reject" | "toggle") => {
    setActioningUnlockId(id);
    try {
      const res = await apiRequest<{ success: boolean; status?: string; message?: string }>(
        `/admin/unlock-requests/${id}/action`,
        {
          method: "POST",
          body: JSON.stringify({ action }),
        }
      );
      const updatedStatus = res?.status || (action === "approve" ? "approved" : "rejected");
      setUnlockRequests((prev) =>
        (Array.isArray(prev) ? prev : []).map((r) => (r.id === id ? { ...r, status: updatedStatus } : r))
      );
    } catch (err) {
      console.error(`Failed to ${action} unlock request`, err);
    } finally {
      setActioningUnlockId(null);
    }
  };

  return (
    <FadeIn delay={0.2} direction="up">
      <div className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Unlock className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Student Task Unlock Desk
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Review individual deadline extension & early access requests. Toggle task submission forms ON/OFF for each candidate.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={unlockFilter}
              onChange={(e) => setUnlockFilter(e.target.value)}
              className="bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-[#EDEDED] focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors cursor-pointer font-medium"
            >
              <option value="all">All Unlock Requests</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved / Form Active (ON)</option>
              <option value="rejected">Rejected / Form Locked (OFF)</option>
            </select>
            <DurationFilterSelect
              value={unlockDurationFilter}
              onChange={(val) => setUnlockDurationFilter(val)}
              accentColor="blue"
            />
            <button
              type="button"
              onClick={fetchUnlockRequests}
              className="p-2 bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A30] transition shadow-sm"
              title="Refresh Unlock Requests"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-[#27272A] rounded-xl overflow-hidden bg-white dark:bg-[#18181B] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-[#151518] text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-[#27272A] text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Student</th>
                  <th className="px-5 py-3.5 font-semibold">Requested Module</th>
                  <th className="px-5 py-3.5 font-semibold">Student Reason & Justification</th>
                  <th className="px-5 py-3.5 font-semibold">Requested At</th>
                  <th className="px-5 py-3.5 font-semibold">Submission Form State</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Form Controls (ON / OFF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#27272A]">
                {loadingUnlocks ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
                    </td>
                  </tr>
                ) : unlockRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                      No unlock requests found.
                    </td>
                  </tr>
                ) : (
                  unlockRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/80 dark:hover:bg-[#1F1F23]/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{req.student_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{req.student_email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                            {req.task_key}
                          </span>
                          {req.task_title}
                        </div>
                      </td>
                      <td className="px-5 py-4 max-w-xs truncate">
                        <span className="text-xs text-gray-600 dark:text-gray-300 italic" title={req.reason}>
                          &ldquo;{req.reason}&rdquo;
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={req.status} type="unlock" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === "approved" ? (
                            <button
                              type="button"
                              disabled={actioningUnlockId === req.id}
                              onClick={() => handleUnlockAction(req.id, "reject")}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 dark:border-red-800/60 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                              title="Lock student task form"
                            >
                              <Lock className="w-3.5 h-3.5 text-red-600 dark:text-red-400" /> Turn OFF (Lock)
                            </button>
                          ) : req.status === "rejected" ? (
                            <button
                              type="button"
                              disabled={actioningUnlockId === req.id}
                              onClick={() => handleUnlockAction(req.id, "approve")}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800/60 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                              title="Unlock student task form"
                            >
                              <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Turn ON (Unlock)
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={actioningUnlockId === req.id}
                                onClick={() => handleUnlockAction(req.id, "approve")}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                              >
                                <Unlock className="w-3.5 h-3.5" /> Approve & Turn ON
                              </button>
                              <button
                                type="button"
                                disabled={actioningUnlockId === req.id}
                                onClick={() => handleUnlockAction(req.id, "reject")}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 dark:bg-[#222226] dark:hover:bg-red-900/50 dark:text-gray-300 dark:hover:text-white border border-gray-300 dark:border-[#2E2E33] rounded-lg text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                              >
                                <Lock className="w-3.5 h-3.5" /> Reject (Keep OFF)
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
