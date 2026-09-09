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
      "bg-white text-black hover:bg-ink-100 shadow-sm border border-transparent disabled:opacity-50",
    brand:
      "bg-brand-600 hover:bg-brand-500 text-white shadow-sm border border-brand-500/30 disabled:opacity-50",
    secondary:
      "bg-ink-900 hover:bg-ink-800 text-ink-200 hover:text-white border border-ink-800 disabled:opacity-50",
    outline:
      "bg-transparent hover:bg-ink-900 text-ink-300 hover:text-white border border-ink-700 hover:border-brand-500 disabled:opacity-50",
    danger:
      "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 disabled:opacity-50",
    ghost:
      "bg-transparent hover:bg-ink-800/60 text-ink-400 hover:text-white disabled:opacity-50",
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
