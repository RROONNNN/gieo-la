import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-8 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
