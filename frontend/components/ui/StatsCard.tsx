import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  className?: string;
}

export function StatsCard({ icon, label, value, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-[15px] border border-[var(--border-green)] bg-white p-5",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-light text-brand-dark">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-brand-darker">{value}</p>
      </div>
    </div>
  );
}
