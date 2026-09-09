import React, { useState, useRef, useEffect } from "react";

export interface DropdownItem {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  onClick: () => void;
  danger?: boolean;
}

export interface AdminDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  title?: string;
  align?: "left" | "right";
  className?: string;
}

export default function AdminDropdown({
  trigger,
  items,
  title,
  align = "right",
  className = "",
}: AdminDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Animated Dropdown Menu */}
      <div
        className={`absolute mt-2 w-56 rounded-2xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950 text-gray-900 dark:text-ink-100 py-1.5 z-50 text-xs shadow-xl backdrop-blur-md transition-all duration-180 ease-out origin-top ${
          align === "right" ? "right-0" : "left-0"
        } ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        {title && (
          <div className="px-3.5 py-2 border-b border-gray-100 dark:border-ink-800 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-ink-400">
            {title}
          </div>
        )}

        <div className="py-1">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors ${
                item.danger
                  ? "hover:bg-red-50 text-red-600 dark:hover:bg-red-500/10 dark:text-red-400"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-ink-300 dark:hover:text-white dark:hover:bg-ink-900"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <div className="min-w-0">
                  <p className="font-semibold truncate">{item.label}</p>
                  {item.description && (
                    <p className="text-[10px] text-gray-500 dark:text-ink-400 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {item.badge && (
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-ink-800 dark:text-brand-400 dark:border-brand-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
