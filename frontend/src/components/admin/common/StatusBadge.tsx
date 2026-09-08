import React from "react";
import { CheckCircle2, X, Clock, AlertTriangle, CheckCircle, XCircle, Unlock, Lock } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  type?: "application" | "submission" | "unlock" | "doubt" | "contact" | "iam" | "generic";
  className?: string;
}

export default function StatusBadge({ status, type = "generic", className = "" }: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase().trim();

  // IAM Access Status
  if (type === "iam" || normalized === "active" || normalized === "revoked") {
    if (normalized === "active" || status === "true" || normalized === "granted") {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 ${className}`}>
          <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Active / Granted
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30 ${className}`}>
        <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" /> Access Revoked
      </span>
    );
  }

  // Task Unlock Desk Status
  if (type === "unlock") {
    if (normalized === "approved") {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 ${className}`}>
          <Unlock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Form Active (ON)
        </span>
      );
    }
    if (normalized === "rejected") {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30 ${className}`}>
          <Lock className="w-3 h-3 text-red-600 dark:text-red-400" /> Form Locked (OFF)
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30 animate-pulse ${className}`}>
        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Pending Review
      </span>
    );
  }

  // Doubts Helpdesk Status
  if (type === "doubt") {
    if (normalized === "answered" || normalized === "resolved") {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 ${className}`}>
          ✓ Resolved
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/40 animate-pulse ${className}`}>
        ● Open Query
      </span>
    );
  }

  // Contacts Status
  if (type === "contact") {
    if (normalized === "replied") {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 ${className}`}>
          ✓ Replied
        </span>
      );
    }
    if (normalized === "new") {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40 animate-pulse ${className}`}>
          ● New Inquiry
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 ${className}`}>
        Read
      </span>
    );
  }

  // Standard Application & Submission statuses
  if (normalized === "accepted" || normalized === "approved" || normalized === "captured" || normalized === "success") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-xs font-bold ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        {normalized === "accepted" ? "Enrolled & Accepted" : normalized === "approved" ? "Approved" : "Successful"}
      </span>
    );
  }

  if (normalized === "rejected" || normalized === "failed") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 text-xs font-bold ${className}`}>
        <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        {normalized === "rejected" ? "Rejected" : "Failed"}
      </span>
    );
  }

  if (normalized === "needs_revision" || normalized === "changes_requested") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30 text-xs font-bold ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Needs Revision
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20 text-xs font-bold ${className}`}>
      <Clock className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400 animate-pulse" />
      {normalized === "submitted" ? "Under Review" : "Pending"}
    </span>
  );
}
