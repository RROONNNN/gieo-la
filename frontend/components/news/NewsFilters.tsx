"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "", label: "Tất cả" },
  { value: "announcement", label: "Thông báo" },
  { value: "story", label: "Câu chuyện" },
  { value: "guide", label: "Hướng dẫn" },
  { value: "event", label: "Hoạt động" },
] as const;

export function NewsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") ?? "";

  const setCategory = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("category", value);
      } else {
        params.delete("category");
      }
      params.delete("page");
      router.push(`/news?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => setCategory(cat.value)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            current === cat.value
              ? "border-brand-dark bg-brand-dark text-white"
              : "border-[var(--border-green)] bg-white text-brand-darker hover:bg-brand-light/40",
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
