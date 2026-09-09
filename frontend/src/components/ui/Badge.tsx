import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "success" | "warning" | "neutral" | "outline" | "highlight";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  children,
  variant = "brand",
  size = "md",
  dot = false,
  className,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-bold uppercase tracking-wider rounded-full select-none";

  const sizeStyles = {
    sm: "text-[10px] px-2.5 py-0.5 gap-1.5",
    md: "text-xs px-3 py-1 gap-2",
  };

  const variantStyles = {
    brand:
      "bg-brand-500/10 text-brand-300 border border-brand-500/30",
    success:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    warning:
      "bg-amber-500/10 text-amber-300 border border-amber-500/30",
    neutral:
      "bg-ink-900 text-ink-300 border border-ink-800",
    outline:
      "bg-transparent text-ink-200 border border-ink-700",
    highlight:
      "bg-brand-500 text-white shadow-sm",
  };

  const dotColors = {
    brand: "bg-brand-400",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    neutral: "bg-ink-400",
    outline: "bg-ink-300",
    highlight: "bg-white",
  };

  return (
    <span
      className={twMerge(
        clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            "w-1.5 h-1.5 rounded-full shrink-0 animate-pulse",
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}
