import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface AdminContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  gutter?: boolean;
}

export default function AdminContainer({
  children,
  size = "xl",
  gutter = true,
  className,
  ...props
}: AdminContainerProps) {
  const sizeStyles = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    "2xl": "max-w-[1400px]",
    full: "max-w-full",
  };

  return (
    <div
      className={twMerge(
        clsx(
          "w-full mx-auto",
          sizeStyles[size],
          gutter && "px-4 sm:px-6 lg:px-8",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
