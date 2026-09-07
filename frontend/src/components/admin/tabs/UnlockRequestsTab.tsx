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
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Unlock className="w-5 h-5 text-amber-400" /> Student Task Unlock Desk
            </h2>
            <p className="text-xs text-ink-400 mt-0.5">
              Review individual deadline extension & early access requests. Toggle task submission forms ON/OFF for each candidate.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={unlockFilter}
              onChange={(e) => setUnlockFilter(e.target.value)}
              className="bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
            >
              <option value="all">All Unlock Requests</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved / Form Active (ON)</option>
              <option value="rejected">Rejected / Form Locked (OFF)</option>
            </select>
            <DurationFilterSelect
              value={unlockDurationFilter}
              onChange={(val) => setUnlockDurationFilter(val)}
              accentColor="amber"
            />
            <button
              type="button"
              onClick={fetchUnlockRequests}
              className="p-2 bg-ink-900 border border-ink-800 rounded-lg text-ink-300 hover:text-white transition"
              title="Refresh Unlock Requests"
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
                  <th className="px-5 py-3.5 font-medium">Requested Module</th>
                  <th className="px-5 py-3.5 font-medium">Student Reason & Justification</th>
                  <th className="px-5 py-3.5 font-medium">Requested At</th>
                  <th className="px-5 py-3.5 font-medium">Submission Form State</th>
                  <th className="px-5 py-3.5 font-medium text-right">Form Controls (ON / OFF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800/50">
                {loadingUnlocks ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-amber-400" />
                    </td>
                  </tr>
                ) : unlockRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-ink-500 text-sm">
                      No unlock requests found.
                    </td>
                  </tr>
                ) : (
                  unlockRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-ink-900/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{req.student_name}</div>
                        <div className="text-xs text-ink-400 font-mono">{req.student_email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-ink-800 text-amber-400">
                            {req.task_key}
                          </span>
                          {req.task_title}
                        </div>
                      </td>
                      <td className="px-5 py-4 max-w-xs truncate">
                        <span className="text-xs text-ink-300 italic" title={req.reason}>
                          &ldquo;{req.reason}&rdquo;
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-ink-400">
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
                              className="px-3 py-1.5 bg-ink-900 hover:bg-red-600/30 text-ink-300 hover:text-red-300 border border-ink-800 hover:border-red-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                              title="Lock student task form"
                            >
                              <Lock className="w-3.5 h-3.5 text-red-400" /> Turn OFF (Lock)
                            </button>
                          ) : req.status === "rejected" ? (
                            <button
                              type="button"
                              disabled={actioningUnlockId === req.id}
                              onClick={() => handleUnlockAction(req.id, "approve")}
                              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                              title="Unlock student task form"
                            >
                              <Unlock className="w-3.5 h-3.5 text-emerald-400" /> Turn ON (Unlock)
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={actioningUnlockId === req.id}
                                onClick={() => handleUnlockAction(req.id, "approve")}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                              >
                                <Unlock className="w-3.5 h-3.5" /> Approve & Turn ON
                              </button>
                              <button
                                type="button"
                                disabled={actioningUnlockId === req.id}
                                onClick={() => handleUnlockAction(req.id, "reject")}
                                className="px-3 py-1.5 bg-ink-800 hover:bg-red-600/80 text-ink-300 hover:text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50"
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
