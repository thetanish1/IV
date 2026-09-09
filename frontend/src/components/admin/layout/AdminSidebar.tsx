import React, { useEffect } from "react";
import { Search, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { TabKey } from "@/app/admin/dashboard/page";

export interface NavGroup {
  groupTitle: string;
  items: {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    count?: number;
    badge?: string;
  }[];
}

export interface AdminSidebarProps {
  navGroups: NavGroup[];
  activeTab: TabKey;
  sidebarCollapsed: boolean;
  mobileMenuOpen?: boolean;
  searchQuery: string;
  onSelectTab: (tab: TabKey) => void;
  onToggleCollapse: () => void;
  onCloseMobileMenu?: () => void;
  onSearchChange: (query: string) => void;
}

export default function AdminSidebar({
  navGroups,
  activeTab,
  sidebarCollapsed,
  mobileMenuOpen = false,
  searchQuery,
  onSelectTab,
  onToggleCollapse,
  onCloseMobileMenu,
  onSearchChange,
}: AdminSidebarProps) {
  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen && onCloseMobileMenu) {
        onCloseMobileMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, onCloseMobileMenu]);

  const navContent = (
    <div className="flex-1 overflow-y-auto py-3.5 px-3 space-y-4">
      {/* Quick Search Bar */}
      {(!sidebarCollapsed || mobileMenuOpen) && (
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ink-400" />
          <input
            type="text"
            placeholder="Quick search..."
            value={searchQuery}
            aria-label="Quick search navigation items"
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-12 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-ink-800 bg-gray-50 dark:bg-ink-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-ink-400 focus:outline-none focus:border-brand-500 transition-colors shadow-inner"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-gray-200 dark:border-ink-800 bg-gray-200/60 dark:bg-ink-800 text-gray-500 dark:text-ink-400">
            Ctrl K
          </span>
        </div>
      )}

      {/* Grouped Navigation */}
      {navGroups.map((group, gIdx) => {
        const filteredItems = group.items.filter(
          (i) =>
            !searchQuery ||
            i.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filteredItems.length === 0) return null;

        return (
          <div key={gIdx} className="space-y-1">
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-ink-400">
                {group.groupTitle}
              </div>
            )}

            {filteredItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onSelectTab(item.key);
                    if (mobileMenuOpen && onCloseMobileMenu) {
                      onCloseMobileMenu();
                    }
                  }}
                  title={sidebarCollapsed && !mobileMenuOpen ? item.label : undefined}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600 dark:bg-brand-600/15 dark:text-white dark:border-brand-500 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-ink-400 dark:hover:text-white dark:hover:bg-ink-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={
                        isActive
                          ? "text-blue-600 dark:text-brand-400"
                          : "text-gray-500 dark:text-ink-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      }
                    >
                      {item.icon}
                    </span>
                    {(!sidebarCollapsed || mobileMenuOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {(!sidebarCollapsed || mobileMenuOpen) && (
                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 border border-gray-200 dark:bg-ink-800 dark:text-ink-300 dark:border-ink-700">
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            isActive
                              ? "bg-blue-600 text-white dark:bg-brand-500"
                              : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-brand-500/20 dark:text-brand-300 dark:border-brand-500/30"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        aria-label="Desktop Admin Navigation"
        className={`hidden md:flex flex-shrink-0 border-r border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950 transition-all duration-200 flex-col justify-between select-none ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {navContent}

        {/* Collapse Action Footer */}
        <div className="p-2.5 border-t border-gray-200 dark:border-ink-800">
          <button
            onClick={onToggleCollapse}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-full flex items-center justify-center p-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-ink-400 dark:hover:text-white dark:hover:bg-ink-900 transition-colors"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <div className="flex items-center gap-2 w-full px-2 text-xs">
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse menu</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            onClick={onCloseMobileMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Canvas */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-ink-950 border-r border-gray-200 dark:border-ink-800 shadow-2xl z-10">
            <div className="p-4 border-b border-gray-200 dark:border-ink-800 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Admin Navigation
              </span>
              <button
                onClick={onCloseMobileMenu}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-lg border border-gray-200 dark:border-ink-800 text-gray-600 dark:text-ink-400 hover:bg-gray-100 dark:hover:text-white bg-gray-50 dark:bg-ink-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
