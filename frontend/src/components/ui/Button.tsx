import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "brand" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  icon,
  iconPosition = "right",
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none select-none";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-md gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-lg gap-2",
    lg: "px-8 py-4 text-base rounded-xl gap-2.5 shadow-lg",
  };

  const variantStyles = {
    primary:
      "bg-white text-black hover:bg-ink-100 shadow-md hover:-translate-y-0.5 active:translate-y-0",
    brand:
      "bg-brand-600 hover:bg-brand-500 text-white shadow-md hover:-translate-y-0.5 active:translate-y-0 border border-brand-500/30",
    secondary:
      "bg-ink-800 hover:bg-ink-700 text-white border border-ink-700 hover:border-ink-600",
    outline:
      "bg-transparent hover:bg-ink-900 text-white border border-ink-700 hover:border-brand-500 transition-colors",
    ghost:
      "bg-transparent hover:bg-ink-800/60 text-ink-300 hover:text-white",
    dark:
      "bg-ink-950 hover:bg-ink-900 text-ink-200 hover:text-white border border-ink-800 hover:border-brand-500/50",
  };

  const combinedClasses = twMerge(
    clsx(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      fullWidth && "w-full",
      className
    )
  );

  const content = (
    <>
      {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {content}
    </button>
  );
}
