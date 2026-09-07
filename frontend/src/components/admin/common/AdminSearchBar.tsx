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
  accentColor = "brand",
}: AdminSearchBarProps) {
  const borderFocus =
    accentColor === "blue"
      ? "focus:border-blue-500"
      : accentColor === "pink"
      ? "focus:border-pink-500"
      : accentColor === "cyan"
      ? "focus:border-cyan-500"
      : accentColor === "emerald"
      ? "focus:border-emerald-500"
      : "focus:border-brand-500";

  return (
    <div className={`relative w-full sm:w-64 ${className}`}>
      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-ink-950 border border-ink-800 rounded-lg pl-9 pr-8 py-1.5 text-sm text-white placeholder-ink-500 focus:outline-none ${borderFocus} transition-colors`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-2 text-ink-400 hover:text-white transition"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
