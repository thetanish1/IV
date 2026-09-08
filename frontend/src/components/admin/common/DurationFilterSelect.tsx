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
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] text-gray-800 dark:text-[#EDEDED] rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer shadow-sm ${className}`}
      title="Filter records by internship duration"
    >
      <option value="all">All Durations</option>
      <option value="1 Month">1 Month Track</option>
      <option value="3 Months">3 Months Track</option>
      <option value="6 Months">6 Months Track</option>
    </select>
  );
}
