"use client";

import React, { useState, useMemo } from "react";
import { Pagination, AdminSearchBar, StatusBadge } from "../common";
import { BookOpen, CheckCircle, XCircle, Clock, Mail, ShieldCheck } from "lucide-react";

interface CourseEnrollmentsTabProps {
  registrations: any[];
  onStatusChange: (regId: string, status: "approved" | "rejected") => Promise<void>;
  itemsPerPage?: number;
}

export const CourseEnrollmentsTab: React.FC<CourseEnrollmentsTabProps> = ({
  registrations,
  onStatusChange,
  itemsPerPage = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        r.user_name?.toLowerCase().includes(q) ||
        r.user_email?.toLowerCase().includes(q) ||
        r.course_name?.toLowerCase().includes(q) ||
        r.transaction_id?.toLowerCase().includes(q);

      const matchStatus = statusFilter === "ALL" || r.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [registrations, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage) || 1;
  const paginatedRegistrations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRegistrations.slice(start, start + itemsPerPage);
  }, [filteredRegistrations, currentPage, itemsPerPage]);

  const handleAction = async (regId: string, status: "approved" | "rejected") => {
    try {
      setLoadingActionId(regId);
      await onStatusChange(regId, status);
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <AdminSearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search learner, course, or transaction ID..."
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-800/80 border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Statuses ({registrations.length})</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved & Active</option>
            <option value="rejected">Rejected / Cancelled</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-4 px-6">Learner</th>
                <th className="py-4 px-6">Enrolled Course</th>
                <th className="py-4 px-6">Amount / TxID</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-normal">
              {paginatedRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No course registrations match your current filter.
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map((r) => {
                  const isPending = !r.status || r.status.toLowerCase() === "pending";
                  const isActionLoading = loadingActionId === r.id;

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-white/[0.02] transition-colors duration-150"
                    >
                      {/* Learner */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">
                          {r.user_name || "Anonymous Learner"}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {r.user_email}
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="font-medium text-slate-200">
                            {r.course_name || "Certification Program"}
                          </span>
                        </div>
                      </td>

                      {/* Amount / TxID */}
                      <td className="py-4 px-6">
                        <div className="font-medium text-emerald-400">
                          {r.amount ? `₹${r.amount}` : "Free / Trial"}
                        </div>
                        {r.transaction_id && (
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            Tx: {r.transaction_id.slice(0, 14)}...
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <StatusBadge status={r.status || "pending"} />
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(r.id, "approved")}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleAction(r.id, "rejected")}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">
                            Decided ({r.status})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRegistrations.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};
