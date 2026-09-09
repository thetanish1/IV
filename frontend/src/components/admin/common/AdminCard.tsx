import React from "react";
import { ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "featured" | "interactive" | "dark";
  hover?: boolean;
}

export function AdminCard({
  children,
  variant = "default",
  hover = false,
  className = "",
  ...props
}: AdminCardProps) {
  const variantStyles = {
    default: "bg-white dark:bg-ink-950/80 border-gray-200 dark:border-ink-800 text-gray-900 dark:text-white shadow-sm",
    featured: "bg-white dark:bg-ink-950 border-brand-500/40 text-gray-900 dark:text-white shadow-[0_0_20px_rgba(48,112,219,0.08)]",
    interactive:
      "bg-white dark:bg-ink-950/90 border-gray-200 dark:border-ink-800 hover:border-brand-500/60 hover:shadow-[0_0_25px_rgba(48,112,219,0.12)] cursor-pointer hover:-translate-y-0.5 text-gray-900 dark:text-white shadow-sm",
    dark: "bg-gray-50 dark:bg-ink-950 border-gray-200 dark:border-ink-800/80 text-gray-900 dark:text-white",
  };

  return (
    <div
      className={twMerge(
        clsx(
          "p-5 sm:p-6 rounded-2xl border backdrop-blur-sm transition-all duration-200 relative overflow-hidden",
          variantStyles[variant],
          hover && "hover:border-brand-500/50 hover:shadow-md",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AdminCardHeader({
  title,
  subtitle,
  icon,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        clsx(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100 dark:border-ink-800/80",
          className
        )
      )}
    >
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-ink-900 border border-blue-100 dark:border-ink-800 text-blue-600 dark:text-brand-400 shrink-0 shadow-sm">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-ink-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function InteractiveCard({
  title,
  description,
  badge,
  icon,
  visual,
  actionLabel = "Explore",
  onClick,
  className = "",
}: {
  title: string;
  description: string;
  badge?: string;
  icon?: React.ReactNode;
  visual?: React.ReactNode;
  actionLabel?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          "p-6 rounded-2xl border border-gray-200 dark:border-ink-800 bg-white dark:bg-ink-950/90 hover:border-brand-500/60 transition-all duration-300 group flex flex-col justify-between space-y-4 hover:shadow-[0_0_30px_rgba(48,112,219,0.12)] hover:-translate-y-0.5 cursor-pointer relative overflow-hidden shadow-sm",
          className
        )
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {icon && (
            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-ink-800 text-brand-600 dark:text-brand-400 group-hover:scale-105 transition-transform shadow-sm">
              {icon}
            </div>
          )}
          {badge && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 border border-brand-200 dark:border-brand-500/30 rounded-full">
              {badge}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-ink-400 leading-relaxed max-w-[65ch]">
            {description}
          </p>
        </div>

        {visual && (
          <div className="pt-2 rounded-xl overflow-hidden border border-gray-200 dark:border-ink-800 bg-gray-50 dark:bg-ink-900/60 p-3 shadow-inner">
            {visual}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-ink-800/80 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300">
        <span>{actionLabel}</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
