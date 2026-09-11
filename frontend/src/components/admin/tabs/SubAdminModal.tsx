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

const ROLE_PRESETS: { [key: string]: { label: string; role: string; perms: string[]; desc: string } } = {
  doubts_only: {
    label: "Doubts & Query Support Desk",
    role: "doubts_only",
    perms: ["overview", "doubts", "contacts"],
    desc: "Specialized direct responder for student technical doubts, code bugs, and inquiries.",
  },
  finance_manager: {
    label: "Payment & Finance Management",
    role: "finance_manager",
    perms: ["overview", "payments"],
    desc: "Inspect Cashfree financial transactions, payment logs, and order verification.",
  },
  technical_mentor: {
    label: "Technical Mentor",
    role: "technical_mentor",
    perms: ["overview", "submissions", "unlocks", "doubts"],
    desc: "Review student code milestones, approve curriculum module unlocks, and resolve doubts.",
  },
  mentor: {
    label: "Internship Operations Manager",
    role: "internship_manager",
    perms: ["overview", "applications", "submissions", "unlocks", "doubts", "certificates"],
    desc: "Manage applicants, evaluate task submissions, unlock roadmap modules, and issue certificates.",
  },
  course_coordinator: {
    label: "Course & Admissions Coordinator",
    role: "course_coordinator",
    perms: ["overview", "enrollments", "payments", "certificates", "contacts"],
    desc: "Review bootcamp registrations, manage course intake, and verify course payments.",
  },
  auditor: {
    label: "Auditor / View-Only Observer",
    role: "auditor",
    perms: ["overview", "payments", "submissions"],
    desc: "Read-only access to payment ledgers, milestone logs, and telemetry.",
  },
  full_sub_admin: {
    label: "General Sub-Admin (All Modules)",
    role: "full_sub_admin",
    perms: [
      "overview",
      "applications",
      "submissions",
      "unlocks",
      "doubts",
      "certificates",
      "enrollments",
      "payments",
      "contacts",
      "users",
      "mailer",
    ],
    desc: "Full operational access across all student, course, and payment modules excluding IAM provision.",
  },
};

const ALL_PERMISSIONS: { key: string; label: string; desc: string }[] = [
  { key: "overview", label: "Overview & Telemetry", desc: "View platform KPI summaries and system telemetry" },
  { key: "doubts", label: "Doubts & Code Query Desk", desc: "Answer student code questions, mentor queries, and helpdesk tickets" },
  { key: "payments", label: "Payment & Financial Ledger", desc: "Inspect Cashfree transactions, order verification, and financial records" },
  { key: "applications", label: "Internship Applications", desc: "Review candidate profiles, download resumes, and manage acceptance" },
  { key: "submissions", label: "Task Milestone Submissions", desc: "Review student GitHub repos, project milestones, and grade tasks" },
  { key: "unlocks", label: "Curriculum Module Unlocks", desc: "Authorize early access to time-gated curriculum modules" },
  { key: "enrollments", label: "Course Enrollments", desc: "Manage bootcamp course registrations and student admissions" },
  { key: "certificates", label: "Digital Certificates", desc: "Issue, verify, inspect, and revoke cryptographic credentials" },
  { key: "contacts", label: "Contact Inquiries", desc: "Manage incoming student/partner contact requests and send replies" },
  { key: "users", label: "User Accounts", desc: "Inspect and manage registered student user accounts" },
  { key: "mailer", label: "Branded Dispatcher", desc: "Draft and dispatch official broadcast announcements" },
  { key: "settings", label: "IAM & Platform Settings", desc: "Provision sub-admins and platform toggles (Super Admin)" },
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
    role: "doubts_only",
    permissions: ROLE_PRESETS.doubts_only.perms,
  });
  const [selectedPreset, setSelectedPreset] = useState<string>("doubts_only");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAdmin) {
      setFormData({
        id: editingAdmin.id,
        email: editingAdmin.email,
        full_name: editingAdmin.full_name,
        role: editingAdmin.role || "doubts_only",
        permissions: editingAdmin.permissions || [],
      });
      setSelectedPreset("custom");
    } else {
      setFormData({
        email: "",
        full_name: "",
        password: "",
        role: "doubts_only",
        permissions: ROLE_PRESETS.doubts_only.perms,
      });
      setSelectedPreset("doubts_only");
    }
    setError(null);
  }, [editingAdmin, isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (presetKey: string) => {
    setSelectedPreset(presetKey);
    if (presetKey !== "custom" && ROLE_PRESETS[presetKey]) {
      setFormData((prev) => ({
        ...prev,
        role: ROLE_PRESETS[presetKey].role,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-[#27272A] flex items-center justify-between bg-gray-50/80 dark:bg-[#141417]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingAdmin ? "Edit Sub-Admin Permissions" : "Provision New Sub-Admin"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Grant granular role-based privileges & operational access control.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-rose-500/10 border border-red-200 dark:border-rose-500/20 text-red-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  disabled={!!editingAdmin}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. mentor@domain.com"
                  className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 shadow-sm"
                />
              </div>
            </div>
          </div>

          {!editingAdmin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Temporary Password *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Assign a secure temporary password..."
                  className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Role Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
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
                      ? "bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300"
                      : "bg-gray-50 dark:bg-[#1F1F23] border-gray-200 dark:border-[#2E2E33] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="font-semibold text-xs text-gray-900 dark:text-white">{preset.label}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Granular Permission Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Granular Permissions ({formData.permissions.length} granted)
              </label>
              <span className="text-[11px] text-gray-400 italic">
                Custom overrides auto-apply
              </span>
            </div>

            <div className="space-y-2 bg-gray-50 dark:bg-[#141417] border border-gray-200 dark:border-[#27272A] rounded-xl p-3">
              {ALL_PERMISSIONS.map((perm) => {
                const isChecked = formData.permissions.includes(perm.key);
                return (
                  <div
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="mt-0.5 text-blue-600 dark:text-blue-400">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">{perm.label}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">{perm.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-gray-200 dark:border-[#27272A] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : editingAdmin ? "Update Sub-Admin" : "Provision Sub-Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
