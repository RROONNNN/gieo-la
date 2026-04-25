import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "info"
  | "error"
  | "role-ngo"
  | "role-individual"
  | "role-member"
  | "condition"
  | "category"
  | "pinned"
  | "news-event"
  | "news-story"
  | "news-guide"
  | "news-announcement";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[#e8efe5] text-brand-dark",
  success:
    "bg-[#d4e9c7] text-brand-dark",
  warning:
    "bg-[#fef3c7] text-[#92400e]",
  info:
    "bg-[#dbeafe] text-[#1e40af]",
  error:
    "bg-[#fee2e2] text-[#991b1b]",
  "role-ngo":
    "bg-brand-light text-brand-dark",
  "role-individual":
    "bg-[#d4e9c7] text-brand-dark",
  "role-member":
    "bg-[#f3f4f6] text-[#4b5563]",
  condition:
    "bg-brand-light text-brand-dark",
  category:
    "bg-[#e8efe5] text-brand-dark",
  pinned:
    "bg-[#fef3c7] text-[#92400e]",
  "news-event":
    "bg-[#fff7ed] text-[#c2410c]",
  "news-story":
    "bg-[#f0fdf4] text-brand-dark",
  "news-guide":
    "bg-[#f0fdfa] text-[#0f766e]",
  "news-announcement":
    "bg-[#eff6ff] text-[#1d4ed8]",
};

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
