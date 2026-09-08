import React from "react";
import { Search, X } from "lucide-react";

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  accentColor?: "blue" | "pink" | "cyan" | "emerald" | "brand";
}

export default function AdminSearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  accentColor = "blue",
}: AdminSearchBarProps) {
  return (
    <div className={`relative w-full sm:w-64 ${className}`}>
      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] rounded-lg pl-9 pr-8 py-1.5 text-xs text-gray-900 dark:text-[#EDEDED] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
