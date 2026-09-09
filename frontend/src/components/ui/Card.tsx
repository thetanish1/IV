import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
  glow?: boolean;
}

export function Card({
  children,
  hover = true,
  glass = true,
  glow = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "rounded-2xl border border-ink-800 p-6 md:p-7 relative overflow-hidden transition-all duration-300",
          glass ? "bg-ink-950/90 backdrop-blur-sm" : "bg-ink-950",
          hover &&
            "hover:border-brand-500/60 hover:shadow-[0_0_30px_rgba(48,112,219,0.12)] group",
          glow && "shadow-[0_0_20px_rgba(48,112,219,0.2)] border-brand-500/50",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx("space-y-2 mb-4", className))} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={twMerge(
        clsx(
          "text-xl font-bold text-white group-hover:text-brand-300 transition-colors tracking-tight",
          className
        )
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={twMerge(
        clsx("text-xs text-ink-400 leading-relaxed", className)
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx("space-y-4", className))} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        clsx("pt-4 mt-6 border-t border-ink-800/80", className)
      )}
      {...props}
    >
      {children}
    </div>
  );
}
