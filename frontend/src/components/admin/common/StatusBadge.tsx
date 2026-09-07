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
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${className}`}>
          <CheckCircle className="w-3 h-3 text-emerald-400" /> Active / Granted
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30 ${className}`}>
        <XCircle className="w-3 h-3 text-red-400" /> Access Revoked
      </span>
    );
  }

  // Task Unlock Desk Status
  if (type === "unlock") {
    if (normalized === "approved") {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${className}`}>
          <Unlock className="w-3 h-3 text-emerald-400" /> Form Active (ON)
        </span>
      );
    }
    if (normalized === "rejected") {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30 ${className}`}>
          <Lock className="w-3 h-3 text-red-400" /> Form Locked (OFF)
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse ${className}`}>
        <Clock className="w-3 h-3 text-amber-400" /> Pending Review
      </span>
    );
  }

  // Doubts Helpdesk Status
  if (type === "doubt") {
    if (normalized === "answered" || normalized === "resolved") {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${className}`}>
          ✓ Resolved
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse ${className}`}>
        ● Open Query
      </span>
    );
  }

  // Contacts Status
  if (type === "contact") {
    if (normalized === "replied") {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${className}`}>
          ✓ Replied
        </span>
      );
    }
    if (normalized === "new") {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse ${className}`}>
          ● New Inquiry
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 ${className}`}>
        Read
      </span>
    );
  }

  // Standard Application & Submission statuses
  if (normalized === "accepted" || normalized === "approved" || normalized === "captured" || normalized === "success") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        {normalized === "accepted" ? "Enrolled & Accepted" : normalized === "approved" ? "Approved" : "Successful"}
      </span>
    );
  }

  if (normalized === "rejected" || normalized === "failed") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 ${className}`}>
        <X className="w-3.5 h-3.5 text-red-400" />
        {normalized === "rejected" ? "Rejected" : "Failed"}
      </span>
    );
  }

  if (normalized === "needs_revision" || normalized === "changes_requested") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Needs Revision
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20 ${className}`}>
      <Clock className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
      {normalized === "submitted" ? "Under Review" : "Pending"}
    </span>
  );
}
