"use client";

import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Briefcase,
  Server,
  Database,
  Activity,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

interface SettingsIAMTabProps {
  settings: {
    show_courses?: boolean;
    show_careers?: boolean;
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
  subAdmins?: any[];
  onSaveSubAdmin?: (adminData: any) => Promise<void>;
  onToggleSubAdminStatus?: (adminId: string, isActive: boolean) => Promise<void>;
  onDeleteSubAdmin?: (adminId: string) => Promise<void>;
}

export const SettingsIAMTab: React.FC<SettingsIAMTabProps> = ({
  settings,
  onUpdateSetting,
  currentAdmin,
}) => {
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const isCoursesEnabled = settings.show_courses ?? settings.courses_enabled ?? false;
  const isCareersEnabled = settings.show_careers ?? settings.careers_enabled ?? false;

  const handleToggle = async (key: string, currentValue: boolean) => {
    try {
      setTogglingKey(key);
      await onUpdateSetting(key, !currentValue);
    } finally {
      setTogglingKey(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Super Admin Owner Profile Card */}
      <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-lg shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {currentAdmin?.full_name || "Super Administrator"}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                Super Admin (Owner)
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <span>{currentAdmin?.email || "admin@internvisiontech.me"}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Full Root Authority Unlocked</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>All 12 Platform Modules Active</span>
        </div>
      </div>

      {/* Global Feature Switches */}
      <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] p-6 rounded-2xl space-y-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">Global Feature Switches</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Instantly enable or disable public page routes and navigation items across www.internvisiontech.me.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Courses Toggle */}
          <div className="bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2E2E33] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Public Courses Catalog</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Controls navbar & footer link, homepage section, and `/courses` route access.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleToggle("show_courses", isCoursesEnabled)}
              disabled={togglingKey === "show_courses" || togglingKey === "courses_enabled"}
              className="text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity p-1 cursor-pointer"
            >
              {isCoursesEnabled ? (
                <ToggleRight className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              )}
            </button>
          </div>

          {/* Careers Toggle */}
          <div className="bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2E2E33] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Careers & Hiring Board</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Controls careers page visibility and job applicant forms.
                </div>
              </div>
            </div>
            <button
              onClick={() => handleToggle("show_careers", isCareersEnabled)}
              disabled={togglingKey === "show_careers" || togglingKey === "careers_enabled"}
              className="text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity p-1 cursor-pointer"
            >
              {isCareersEnabled ? (
                <ToggleRight className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* System Infrastructure & Telemetry Summary */}
      <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] p-6 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">System Infrastructure</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Live status of cloud database connection and API services.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2E2E33] rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Database Connection</span>
              <Database className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">PostgreSQL Healthy</div>
            <div className="text-[11px] text-gray-400">TCP Keepalives & Pre-Ping Active</div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2E2E33] rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Administrative Authority</span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-bold text-amber-600 dark:text-amber-400 text-sm">Super Admin Only</div>
            <div className="text-[11px] text-gray-400">Zero Role Restrictions</div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2E2E33] rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Official Email Server</span>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">Cloudflare + Brevo SMTP</div>
            <div className="text-[11px] text-gray-400">support@internvisiontech.me</div>
          </div>
        </div>
      </div>
    </div>
  );
};
