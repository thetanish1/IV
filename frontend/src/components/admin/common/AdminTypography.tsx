import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
  size?: "display" | "h1" | "h2" | "h3" | "h4";
}

export function Heading({
  children,
  level = 2,
  size,
  className,
  ...props
}: HeadingProps) {
  const chosenSize = size || (`h${level}` as const);

  const sizeStyles = {
    display: "text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white leading-tight",
    h1: "text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight",
    h2: "text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white",
    h3: "text-lg font-bold text-gray-900 dark:text-white tracking-tight",
    h4: "text-base font-semibold text-gray-900 dark:text-white",
  };

  const combinedClasses = twMerge(clsx(sizeStyles[chosenSize], className));

  if (level === 1) return <h1 className={combinedClasses} {...props}>{children}</h1>;
  if (level === 3) return <h3 className={combinedClasses} {...props}>{children}</h3>;
  if (level === 4) return <h4 className={combinedClasses} {...props}>{children}</h4>;
  return <h2 className={combinedClasses} {...props}>{children}</h2>;
}

export function Eyebrow({
  children,
  icon,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { icon?: React.ReactNode }) {
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-200 dark:border-brand-500/30",
          className
        )
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export function Text({
  children,
  size = "md",
  variant = "muted",
  prose = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "primary" | "muted" | "subtle" | "brand";
  prose?: boolean;
}) {
  const sizeStyles = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const variantStyles = {
    primary: "text-gray-900 dark:text-white",
    muted: "text-gray-600 dark:text-ink-300",
    subtle: "text-gray-500 dark:text-ink-400",
    brand: "text-brand-600 dark:text-brand-300",
  };

  return (
    <p
      className={twMerge(
        clsx(
          sizeStyles[size],
          variantStyles[variant],
          prose && "max-w-[65ch] leading-relaxed",
          className
        )
      )}
      {...props}
    >
      {children}
    </p>
  );
}
