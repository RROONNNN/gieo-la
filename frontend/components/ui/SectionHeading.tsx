import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({ children, action, className }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-[var(--border-green)] pb-4",
        className,
      )}
    >
      <h2 className="font-heading text-[32px] font-semibold leading-tight text-brand-darker">
        {children}
      </h2>
      {action}
    </div>
  );
}
