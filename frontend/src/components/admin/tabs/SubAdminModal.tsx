"use client";

import React, { useState, useEffect } from "react";
import { X, Shield, Key, Mail, User, CheckSquare, Square, AlertCircle } from "lucide-react";

export interface SubAdminData {
  id?: string;
  email: string;
  full_name: string;
  password?: string;
  role: string;
  permissions: string[];
  is_active?: boolean;
}

const ROLE_PRESETS: { [key: string]: { label: string; perms: string[]; desc: string } } = {
  mentor: {
    label: "Internship & Technical Mentor",
    perms: ["manage_interns", "review_submissions", "resolve_doubts"],
    desc: "Can review tasks, approve/reject submissions, and answer doubt tickets.",
  },
  admissions: {
    label: "Admissions & Operations Officer",
    perms: ["manage_interns", "manage_courses", "send_broadcasts"],
    desc: "Can approve internship requests, course enrollments, and send emails.",
  },
  doubts_only: {
    label: "Helpdesk & Support Mentor",
    perms: ["resolve_doubts"],
    desc: "Specialized direct responder for doubts desk and code queries.",
  },
  auditor: {
    label: "Auditor / View-Only Observer",
    perms: ["view_audit_logs"],
    desc: "Read-only access to transactions, student logs, and telemetry.",
  },
  full_sub_admin: {
    label: "General Sub-Admin (All Modules)",
    perms: [
      "manage_interns",
      "review_submissions",
      "resolve_doubts",
      "manage_courses",
      "manage_users",
      "view_audit_logs",
      "send_broadcasts",
    ],
    desc: "Full operational access across all student operations excluding IAM provision.",
  },
};

const ALL_PERMISSIONS: { key: string; label: string; desc: string }[] = [
  { key: "manage_interns", label: "Manage Internships", desc: "Approve/reject applicants and issue roadmap unlocks" },
  { key: "review_submissions", label: "Review Submissions", desc: "Grade task submissions, approve or request revisions" },
  { key: "resolve_doubts", label: "Resolve Doubts & Helpdesk", desc: "Answer student code queries and helpdesk tickets" },
  { key: "manage_courses", label: "Manage Course Registrations", desc: "Approve or reject bootcamp course applications" },
  { key: "manage_users", label: "View & Audit Users", desc: "Audit student accounts and credential hints" },
  { key: "view_audit_logs", label: "View Financial & Audit Logs", desc: "Inspect payment transactions and audit telemetry" },
  { key: "send_broadcasts", label: "Send Branded Emails", desc: "Draft and dispatch official branded email broadcasts" },
];

interface SubAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (adminData: SubAdminData) => Promise<void>;
  editingAdmin?: SubAdminData | null;
}

export const SubAdminModal: React.FC<SubAdminModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAdmin,
}) => {
  const [formData, setFormData] = useState<SubAdminData>({
    email: "",
    full_name: "",
    password: "",
    role: "admin",
    permissions: ROLE_PRESETS.mentor.perms,
  });
  const [selectedPreset, setSelectedPreset] = useState<string>("mentor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAdmin) {
      setFormData({
        id: editingAdmin.id,
        email: editingAdmin.email,
        full_name: editingAdmin.full_name,
        role: editingAdmin.role || "admin",
        permissions: editingAdmin.permissions || [],
      });
      setSelectedPreset("custom");
    } else {
      setFormData({
        email: "",
        full_name: "",
        password: "",
        role: "admin",
        permissions: ROLE_PRESETS.mentor.perms,
      });
      setSelectedPreset("mentor");
    }
    setError(null);
  }, [editingAdmin, isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (presetKey: string) => {
    setSelectedPreset(presetKey);
    if (presetKey !== "custom" && ROLE_PRESETS[presetKey]) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...ROLE_PRESETS[presetKey].perms],
      }));
    }
  };

  const togglePermission = (permKey: string) => {
    setSelectedPreset("custom");
    setFormData((prev) => {
      const exists = prev.permissions.includes(permKey);
      const updated = exists
        ? prev.permissions.filter((p) => p !== permKey)
        : [...prev.permissions, permKey];
      return { ...prev, permissions: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.full_name) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!editingAdmin && !formData.password) {
      setError("Password is required when creating a new sub-admin.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save sub-admin account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {editingAdmin ? "Edit Sub-Admin Permissions" : "Provision New Sub-Admin"}
              </h3>
              <p className="text-xs text-slate-400">
                Grant granular role-based privileges & operational access control.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  disabled={!!editingAdmin}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. mentor@domain.com"
                  className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {!editingAdmin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Temporary Password *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Assign a secure temporary password..."
                  className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Role Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Role Template / Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => handlePresetSelect(key)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selectedPreset === key
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-300"
                      : "bg-slate-800/40 border-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{preset.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Granular Permission Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Granular Permissions ({formData.permissions.length} granted)
              </label>
              <span className="text-[11px] text-slate-500 italic">
                Custom overrides auto-apply
              </span>
            </div>

            <div className="space-y-2 bg-slate-950/40 border border-white/5 rounded-xl p-3">
              {ALL_PERMISSIONS.map((perm) => {
                const isChecked = formData.permissions.includes(perm.key);
                return (
                  <div
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="mt-0.5 text-indigo-400">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{perm.label}</div>
                      <div className="text-[11px] text-slate-400">{perm.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Saving..." : editingAdmin ? "Update Sub-Admin" : "Provision Sub-Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
