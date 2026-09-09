import React from "react";
import { ArrowUpRight } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  badge?: string;
  badgeVariant?: "success" | "warning" | "brand" | "neutral";
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  iconBgColor = "text-blue-600 bg-blue-50 border-blue-100 dark:text-brand-400 dark:bg-brand-500/10 dark:border-ink-800",
  badge,
  badgeVariant = "brand",
  subtitle,
  onClick,
  className = "",
}: MetricCardProps) {
  const isClickable = Boolean(onClick);

  const badgeStyles = {
    brand: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    neutral: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-ink-800 dark:text-ink-300 dark:border-ink-700",
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950/80 backdrop-blur-sm transition-all duration-200 relative overflow-hidden group shadow-sm ${
        isClickable
          ? "cursor-pointer hover:border-brand-500/50 hover:shadow-[0_0_20px_rgba(48,112,219,0.1)] hover:-translate-y-0.5"
          : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-wide uppercase text-gray-500 dark:text-ink-400 group-hover:text-gray-800 dark:group-hover:text-ink-200 transition-colors">
          {title}
        </span>
        <div className={`p-2 rounded-xl border shrink-0 shadow-sm ${iconBgColor}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          {value}
        </div>

        {badge && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyles[badgeVariant]}`}
          >
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-gray-500 dark:text-ink-400 mt-2 font-medium">
          {subtitle}
        </p>
      )}

      {isClickable && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-600 dark:text-brand-400">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
