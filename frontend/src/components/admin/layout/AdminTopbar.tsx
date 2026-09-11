import React from "react";
import Image from "next/image";
import {
  Sparkles,
  HelpCircle,
  Sun,
  Moon,
  RefreshCw,
  ChevronDown,
  Settings as SettingsIcon,
  LogOut,
  User,
  Menu,
} from "lucide-react";
import AdminDropdown from "../common/AdminDropdown";

export interface AdminTopbarProps {
  currentAdmin: any;
  theme: "light" | "dark";
  refreshing: boolean;
  onToggleTheme: () => void;
  onRefreshData: () => void;
  onNavigateTab: (tab: string) => void;
  onLogout: () => void;
  onToggleMobileMenu?: () => void;
}

export default function AdminTopbar({
  currentAdmin,
  theme,
  refreshing,
  onToggleTheme,
  onRefreshData,
  onNavigateTab,
  onLogout,
  onToggleMobileMenu,
}: AdminTopbarProps) {
  const isSuperAdmin =
    currentAdmin?.is_super_admin ||
    (currentAdmin?.role || "").toLowerCase().trim() === "super_admin" ||
    (currentAdmin?.permissions || []).includes("settings");

  const accountItems = [
    {
      label: currentAdmin?.full_name || "Admin",
      description: currentAdmin?.email || "admin@internvision.tech",
      icon: <User className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />,
      badge: currentAdmin?.role || "operator",
      onClick: () => {
        if (isSuperAdmin) onNavigateTab("settings");
      },
    },
  ];

  const profileItems = [
    ...(isSuperAdmin
      ? [
          {
            label: "IAM & Platform Settings",
            description: "Manage roles & permissions",
            icon: <SettingsIcon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />,
            onClick: () => onNavigateTab("settings"),
          },
        ]
      : []),
    {
      label: "Sign Out",
      description: "Terminate active admin session",
      icon: <LogOut className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />,
      danger: true,
      onClick: onLogout,
    },
  ];

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-gray-200 dark:border-ink-800 bg-white/95 dark:bg-ink-950/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 transition-colors duration-200 shadow-sm">
      {/* Brand & Mobile Hamburger Toggle & Account Selector */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger button */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="Open mobile navigation menu"
            className="md:hidden p-2 rounded-lg border border-gray-200 dark:border-ink-800 bg-gray-50 dark:bg-ink-900 text-gray-700 dark:text-ink-300 hover:bg-gray-100 dark:hover:text-white transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => onNavigateTab("overview")}
          title="InternVision Tech Admin"
        >
          <div className="relative flex items-center justify-center shrink-0">
            <Image
              src="/logo.png"
              alt="InternVision Tech Logo"
              width={30}
              height={30}
              className="h-7 w-7 object-contain group-hover:scale-105 transition-transform duration-200"
              priority
            />
          </div>
          <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white hidden sm:inline">
            InternVision <span className="text-brand-600 dark:text-brand-400">Tech</span>
          </span>
        </div>

        {/* Account Selector Dropdown (Progressive Disclosure) */}
        <div className="hidden sm:block">
          <AdminDropdown
            title="Active Session"
            align="left"
            items={accountItems}
            trigger={
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-ink-800 bg-gray-50 dark:bg-ink-900 text-gray-800 dark:text-ink-200 hover:bg-gray-100 dark:hover:bg-ink-800 dark:hover:text-white transition-colors">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <span className="max-w-[140px] truncate">
                  {currentAdmin?.email || "Enterprise Admin"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </div>
            }
          />
        </div>
      </div>

      {/* Topbar Right Actions: Ask AI, Support, Theme Switcher, Refresh, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Ask AI Assistant */}
        <button
          onClick={() => onNavigateTab("doubts")}
          aria-label="Ask AI Assistant"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-ink-800 bg-gray-50 dark:bg-ink-900 text-gray-800 dark:text-ink-200 hover:border-brand-500 dark:hover:border-brand-500/60 hover:text-brand-600 dark:hover:text-white transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Ask AI</span>
        </button>

        {/* Support */}
        <button
          onClick={() => window.open("/docs", "_blank")}
          aria-label="View documentation"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-ink-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Support</span>
        </button>

        {/* Theme Switcher Toggle */}
        <button
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
          className="p-2 rounded-lg border border-gray-200 dark:border-ink-800 bg-gray-50 dark:bg-ink-900 text-gray-700 dark:text-amber-400 hover:bg-gray-100 dark:hover:bg-ink-800 transition-colors flex items-center justify-center shadow-sm"
          title={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-brand-600" />
          )}
        </button>

        {/* Telemetry Refresh */}
        <button
          onClick={onRefreshData}
          disabled={refreshing}
          aria-label="Refresh telemetry data"
          className="p-2 rounded-lg border border-gray-200 dark:border-ink-800 bg-gray-50 dark:bg-ink-900 text-gray-700 dark:text-ink-300 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-ink-800 transition-colors shadow-sm"
          title="Refresh telemetry"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              refreshing ? "animate-spin text-brand-600 dark:text-brand-400" : ""
            }`}
          />
        </button>

        {/* Profile Dropdown */}
        <AdminDropdown
          title={currentAdmin?.full_name || "Admin Account"}
          align="right"
          items={profileItems}
          trigger={
            <div
              role="button"
              aria-label="User profile menu"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-700 to-brand-500 text-white font-black text-xs flex items-center justify-center shadow-md border border-brand-300/30 hover:scale-105 transition-transform cursor-pointer"
            >
              {(currentAdmin?.full_name || currentAdmin?.email || "A")
                .slice(0, 1)
                .toUpperCase()}
            </div>
          }
        />
      </div>
    </header>
  );
}
