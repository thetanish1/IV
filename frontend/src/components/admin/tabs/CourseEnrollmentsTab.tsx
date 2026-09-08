"use client";

import React, { useState, useMemo } from "react";
import { Pagination, AdminSearchBar, StatusBadge } from "../common";
import { BookOpen, CheckCircle, XCircle, Clock, Mail, ShieldCheck } from "lucide-react";

interface CourseEnrollmentsTabProps {
  registrations: any[];
  onStatusChange: (regId: string, status: "approved" | "rejected") => Promise<void>;
  onDeleteRegistration?: (regId: string | number) => Promise<void>;
  itemsPerPage?: number;
}

export const CourseEnrollmentsTab: React.FC<CourseEnrollmentsTabProps> = ({
  registrations,
  onStatusChange,
  onDeleteRegistration,
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
    <div className="space-y-4 pt-1">
      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="w-full md:w-80">
          <AdminSearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search learner, course, or transaction ID..."
            accentColor="blue"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] text-xs text-gray-800 dark:text-[#EDEDED] font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors cursor-pointer"
          >
            <option value="ALL">All Statuses ({registrations.length})</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved & Active</option>
            <option value="rejected">Rejected / Cancelled</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-[#151518] border-b border-gray-200 dark:border-[#27272A] text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 font-semibold">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Learner</th>
                <th className="py-3.5 px-6 font-semibold">Enrolled Course</th>
                <th className="py-3.5 px-6 font-semibold">Amount / TxID</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold">Date</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#27272A]">
              {paginatedRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
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
                      className="hover:bg-gray-50/80 dark:hover:bg-[#1F1F23]/60 transition-colors"
                    >
                      {/* Learner */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {r.user_name || "Anonymous Learner"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5 font-mono">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {r.user_email}
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {r.course_name || "Certification Program"}
                          </span>
                        </div>
                      </td>

                      {/* Amount / TxID */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-emerald-700 dark:text-emerald-400">
                          {r.amount ? `₹${r.amount}` : "Free / Trial"}
                        </div>
                        {r.transaction_id && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                            Tx: {r.transaction_id.slice(0, 14)}...
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <StatusBadge status={r.status || "pending"} />
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400">
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
                        <div className="flex items-center justify-end gap-2">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleAction(r.id, "approved")}
                                disabled={isActionLoading}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800/60 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50 shadow-sm"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleAction(r.id, "rejected")}
                                disabled={isActionLoading}
                                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 dark:border-rose-800/60 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50 shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                              Decided ({r.status})
                            </span>
                          )}

                          {onDeleteRegistration && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete registration record #${r.id}?`)) {
                                  onDeleteRegistration(r.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-400 dark:bg-[#222226] dark:hover:bg-rose-500/20 dark:text-gray-400 dark:hover:text-rose-400 transition-colors shadow-sm"
                              title="Delete Record"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredRegistrations.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
