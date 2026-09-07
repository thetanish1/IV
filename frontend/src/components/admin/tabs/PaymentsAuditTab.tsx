"use client";

import React, { useState, useMemo } from "react";
import { Pagination, AdminSearchBar, StatusBadge } from "../common";
import { CreditCard, ArrowUpRight, DollarSign, Calendar, ShieldCheck, Trash2 } from "lucide-react";

interface PaymentsAuditTabProps {
  payments: any[];
  onDeletePayment?: (pmtId: string | number) => Promise<void>;
  itemsPerPage?: number;
}

export const PaymentsAuditTab: React.FC<PaymentsAuditTabProps> = ({
  payments,
  onDeletePayment,
  itemsPerPage = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        p.user_email?.toLowerCase().includes(q) ||
        p.payment_id?.toLowerCase().includes(q) ||
        p.order_id?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q);

      const pStatus = (p.status || "").toLowerCase();
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "SUCCESS" && (pStatus === "success" || pStatus === "completed" || pStatus === "captured")) ||
        (statusFilter === "PENDING" && pStatus === "pending") ||
        (statusFilter === "FAILED" && (pStatus === "failed" || pStatus === "error"));

      return matchSearch && matchStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  const totalVolume = useMemo(() => {
    return payments
      .filter((p) => {
        const s = (p.status || "").toLowerCase();
        return s === "success" || s === "completed" || s === "captured";
      })
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [payments]);

  return (
    <div className="space-y-6">
      {/* KPI Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Captured Revenue Volume
            </span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">₹{totalVolume.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Verified settlement total</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Transactions
            </span>
            <div className="p-2 bg-white/5 rounded-xl text-slate-300">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{payments.length}</div>
          <div className="text-xs text-slate-400 mt-1">Audit log records</div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Payment Gateway Security
            </span>
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">100% TLS / Razorpay</div>
          <div className="text-xs text-slate-400 mt-1">Webhook signature verified</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <AdminSearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search email, order ID, or payment ID..."
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
            <option value="ALL">All Payment States ({payments.length})</option>
            <option value="SUCCESS">Captured / Success</option>
            <option value="PENDING">Pending / Processing</option>
            <option value="FAILED">Failed / Declined</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-4 px-6">Customer / Payer</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Gateway Identifiers</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-normal">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No transactions match your query criteria.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p) => (
                  <tr
                    key={p.id || p.payment_id}
                    className="hover:bg-white/[0.02] transition-colors duration-150"
                  >
                    {/* Customer */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">
                        {p.user_email || "Anonymous Payer"}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        ID: {p.id ? p.id.slice(0, 16) : "N/A"}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-white text-base">
                        ₹{Number(p.amount || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 uppercase">
                        {p.currency || "INR"}
                      </div>
                    </td>

                    {/* Gateway Identifiers */}
                    <td className="py-4 px-6">
                      {p.payment_id && (
                        <div className="text-xs text-cyan-400 font-mono">
                          pay: {p.payment_id}
                        </div>
                      )}
                      {p.order_id && (
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          ord: {p.order_id}
                        </div>
                      )}
                      {!p.payment_id && !p.order_id && (
                        <span className="text-xs text-slate-500 italic">Direct / Manual</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <StatusBadge status={p.status || "pending"} />
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-6 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {p.created_at
                          ? new Date(p.created_at).toLocaleString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      {onDeletePayment && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete payment record #${p.id}?`)) {
                              onDeletePayment(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete Payment Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPayments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};
