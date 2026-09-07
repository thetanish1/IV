"use client";

import React, { useState } from "react";
import { SubAdminModal, SubAdminData } from "./SubAdminModal";
import { StatusBadge } from "../common";
import {
  Settings,
  Shield,
  ShieldCheck,
  UserPlus,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Trash2,
  UserX,
  UserCheck,
  Key,
  Lock,
  BookOpen,
  Briefcase,
  AlertTriangle,
} from "lucide-react";

interface SettingsIAMTabProps {
  settings: {
    courses_enabled?: boolean;
    careers_enabled?: boolean;
  };
  onUpdateSetting: (key: string, value: boolean) => Promise<void>;
  currentAdmin: {
    id?: string;
    email?: string;
    full_name?: string;
    role?: string;
    permissions?: string[];
    is_super_admin?: boolean;
  } | null;
  subAdmins: any[];
  onSaveSubAdmin: (adminData: SubAdminData) => Promise<void>;
  onToggleSubAdminStatus: (adminId: string, isActive: boolean) => Promise<void>;
  onDeleteSubAdmin: (adminId: string) => Promise<void>;
}

export const SettingsIAMTab: React.FC<SettingsIAMTabProps> = ({
  settings,
  onUpdateSetting,
  currentAdmin,
  subAdmins,
  onSaveSubAdmin,
  onToggleSubAdminStatus,
  onDeleteSubAdmin,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<SubAdminData | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const isSuperAdmin = currentAdmin?.is_super_admin || currentAdmin?.role === "super_admin";

  const handleToggle = async (key: string, currentValue: boolean) => {
    try {
      setTogglingKey(key);
      await onUpdateSetting(key, !currentValue);
    } finally {
      setTogglingKey(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAdmin(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (admin: any) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (adminId: string, currentStatus: boolean) => {
    try {
      setActionLoadingId(adminId);
      await onToggleSubAdminStatus(adminId, !currentStatus);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (adminId: string) => {
    if (confirm("Are you sure you want to permanently revoke and delete this sub-admin account?")) {
      try {
        setActionLoadingId(adminId);
        await onDeleteSubAdmin(adminId);
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Operator Profile Pill */}
      <div className="bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shrink-0">
            {isSuperAdmin ? <ShieldCheck className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {currentAdmin?.full_name || "Admin Session"}
              </h3>
              {isSuperAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Super Admin (Owner)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Sub-Admin Operator
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>{currentAdmin?.email}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Session Authenticated</span>
            </div>
          </div>
        </div>

        {/* Permissions summary */}
        {!isSuperAdmin && currentAdmin?.permissions && (
          <div className="flex flex-wrap gap-1.5 max-w-md">
            {currentAdmin.permissions.map((p) => (
              <span
                key={p}
                className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[11px] text-slate-300 font-mono"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Feature Switches & Visibility Control */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Global Feature Switches</h4>
            <p className="text-xs text-slate-400">
              Instantly enable or disable public page routes and navigation items across the portal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Courses Toggle */}
          <div className="bg-slate-800/40 border border-white/5 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Public Courses Catalog</div>
                <div className="text-xs text-slate-400">
                  Controls navbar & footer link and `/courses` route access.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleToggle("courses_enabled", !!settings.courses_enabled)}
              disabled={togglingKey === "courses_enabled"}
              className="text-cyan-400 hover:text-cyan-300 transition-colors p-1"
            >
              {settings.courses_enabled ? (
                <ToggleRight className="w-8 h-8 text-cyan-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>

          {/* Careers Toggle */}
          <div className="bg-slate-800/40 border border-white/5 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Careers & Hiring Board</div>
                <div className="text-xs text-slate-400">
                  Controls careers page visibility and job applicant forms.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleToggle("careers_enabled", !!settings.careers_enabled)}
              disabled={togglingKey === "careers_enabled"}
              className="text-cyan-400 hover:text-cyan-300 transition-colors p-1"
            >
              {settings.careers_enabled ? (
                <ToggleRight className="w-8 h-8 text-cyan-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* IAM Sub-Admin Provisioning & Access Revocation */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-0">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">IAM Sub-Admin Management</h4>
              <p className="text-xs text-slate-400">
                Delegate operational tasks to mentors and team members with instant revocation.
              </p>
            </div>
          </div>

          {isSuperAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-90 flex items-center gap-2 transition-opacity"
            >
              <UserPlus className="w-4 h-4" /> Provision Sub-Admin
            </button>
          )}
        </div>

        {/* Sub-Admins Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-4 px-6">Admin Name & Email</th>
                <th className="py-4 px-6">Role & Status</th>
                <th className="py-4 px-6">Assigned Permissions</th>
                <th className="py-4 px-6 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-normal">
              {subAdmins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No sub-admin accounts created yet. Click "Provision Sub-Admin" to delegate roles.
                  </td>
                </tr>
              ) : (
                subAdmins.map((adm) => {
                  const isActive = adm.is_active !== false;
                  const isSelf = currentAdmin?.email === adm.email;

                  return (
                    <tr
                      key={adm.id}
                      className={`hover:bg-white/[0.02] transition-colors duration-150 ${
                        !isActive ? "opacity-60 bg-rose-950/10" : ""
                      }`}
                    >
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">
                          {adm.full_name || "Admin Staff"}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{adm.email}</div>
                      </td>

                      {/* Role & Status */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          {adm.role === "super_admin" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400">
                              <Shield className="w-3.5 h-3.5" /> Sub-Admin
                            </span>
                          )}
                          <StatusBadge status={isActive ? "active" : "revoked"} />
                        </div>
                      </td>

                      {/* Permissions Pills */}
                      <td className="py-4 px-6">
                        {adm.role === "super_admin" ? (
                          <span className="text-xs font-semibold text-amber-400/90 italic">
                            Full Root Authority (All Modules)
                          </span>
                        ) : adm.permissions && adm.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {adm.permissions.map((p: string) => (
                              <span
                                key={p}
                                className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-white/5 rounded text-[10px] font-mono"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No permissions assigned</span>
                        )}
                      </td>

                      {/* Access Control Actions */}
                      <td className="py-4 px-6 text-right">
                        {adm.role === "super_admin" || isSelf ? (
                          <span className="text-xs text-slate-500 italic">Protected</span>
                        ) : isSuperAdmin ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(adm)}
                              disabled={actionLoadingId === adm.id}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                              title="Edit permissions"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleStatusToggle(adm.id, isActive)}
                              disabled={actionLoadingId === adm.id}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isActive
                                  ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                              }`}
                              title={isActive ? "Revoke Access Immediately" : "Restore Access"}
                            >
                              {isActive ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDelete(adm.id)}
                              disabled={actionLoadingId === adm.id}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="Delete Sub-Admin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Read-only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SubAdmin Modal */}
      <SubAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveSubAdmin}
        editingAdmin={editingAdmin}
      />
    </div>
  );
};
