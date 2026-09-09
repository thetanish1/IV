import React from "react";
import * as LucideIcons from "lucide-react";

export type IconName = keyof typeof LucideIcons;

export interface AdminIconProps {
  name: string;
  size?: number | string;
  className?: string;
  label?: string;
}

export default function AdminIcon({
  name,
  size = 16,
  className = "",
  label,
}: AdminIconProps) {
  // Convert kebab-case or lowercase to PascalCase if needed
  const formattedName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") as IconName;

  const IconComponent = (LucideIcons as any)[formattedName] || LucideIcons.HelpCircle;

  return (
    <IconComponent
      size={size}
      className={className}
      aria-hidden={!label}
      aria-label={label}
    />
  );
}
