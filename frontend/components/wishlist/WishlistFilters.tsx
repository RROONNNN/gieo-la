"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORY_LABEL } from "@/lib/postLabels";
import type { PostCategory } from "@/types/enums";

const CATEGORIES = Object.entries(CATEGORY_LABEL) as [PostCategory, string][];

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "open", label: "Đang cần" },
  { value: "fulfilled", label: "Đã đủ" },
];

export function WishlistFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const currentCategory = sp.get("category") ?? "";
  const currentStatus = sp.get("status") ?? "";

  function buildHref(category: string, status: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    return `/wishlist${params.size > 0 ? `?${params}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => router.push(buildHref("", currentStatus))}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            !currentCategory
              ? "border-brand-dark bg-brand-dark text-white"
              : "border-[var(--border-green)] text-brand-dark hover:bg-[var(--brand-light)]"
          }`}
        >
          Tất cả
        </button>
        {CATEGORIES.map(([val, label]) => (
          <button
            key={val}
            onClick={() => router.push(buildHref(val, currentStatus))}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              currentCategory === val
                ? "border-brand-dark bg-brand-dark text-white"
                : "border-[var(--border-green)] text-brand-dark hover:bg-[var(--brand-light)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <select
        value={currentStatus}
        onChange={(e) => router.push(buildHref(currentCategory, e.target.value))}
        className="rounded-[10px] border border-[var(--border-green)] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
