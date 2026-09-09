import React from "react";
import { Loader2 } from "lucide-react";

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "brand";
  size?: "xs" | "sm" | "md";
  icon?: React.ReactNode;
  loading?: boolean;
}

export default function AdminButton({
  children,
  variant = "primary",
  size = "sm",
  icon,
  loading = false,
  disabled,
  className = "",
  ...props
}: AdminButtonProps) {
  const sizeStyles = {
    xs: "px-2.5 py-1 text-xs gap-1.5 rounded-md",
    sm: "px-3 py-1.5 text-xs gap-2 rounded-lg font-medium",
    md: "px-4 py-2 text-sm gap-2 rounded-lg font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-gray-900 text-white hover:bg-black shadow-sm border border-transparent dark:bg-white dark:text-black dark:hover:bg-ink-100 disabled:opacity-50",
    brand:
      "bg-brand-600 hover:bg-brand-500 text-white shadow-sm border border-brand-500/30 disabled:opacity-50",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 dark:bg-ink-900 dark:hover:bg-ink-800 dark:text-ink-200 dark:border-ink-800 disabled:opacity-50",
    outline:
      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 dark:bg-transparent dark:hover:bg-ink-900 dark:text-ink-300 dark:border-ink-700 dark:hover:border-brand-500 disabled:opacity-50 shadow-sm",
    danger:
      "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 disabled:opacity-50",
    ghost:
      "bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 dark:text-ink-400 dark:hover:text-white dark:hover:bg-ink-800/60 disabled:opacity-50",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}
