import React from "react";

interface DurationFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  accentColor?: "blue" | "amber" | "pink" | "brand" | "default";
  className?: string;
}

export default function DurationFilterSelect({
  value,
  onChange,
  accentColor = "default",
  className = "",
}: DurationFilterSelectProps) {
  const borderFocus =
    accentColor === "blue"
      ? "focus:border-blue-500"
      : accentColor === "amber"
      ? "focus:border-amber-500"
      : accentColor === "pink"
      ? "focus:border-pink-500"
      : "focus:border-brand-500";

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-ink-950 border border-ink-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none ${borderFocus} transition-colors cursor-pointer ${className}`}
      title="Filter records by internship duration"
    >
      <option value="all">All Durations</option>
      <option value="1 Month">1 Month Track</option>
      <option value="3 Months">3 Months Track</option>
      <option value="6 Months">6 Months Track</option>
    </select>
  );
}
