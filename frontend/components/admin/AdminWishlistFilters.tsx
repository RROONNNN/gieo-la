"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { CATEGORY_LABEL } from "@/lib/postLabels";

const CATEGORIES = [
  { value: "", label: "Tất cả danh mục" },
  ...Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label })),
];

const STATUSES = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "open", label: "Đang mở" },
  { value: "fulfilled", label: "Đã đáp ứng" },
];

const SELECT_CLS =
  "h-8 rounded-lg border border-[var(--border-green)] bg-white px-2 text-sm text-brand-darker outline-none focus:ring-1 focus:ring-brand-dark";

export function AdminWishlistFilters() {
  const sp = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(sp.get("search") ?? "");

  useEffect(() => {
    setSearch(sp.get("search") ?? "");
  }, [sp]);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(sp.toString());
      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`/admin/wishlist?${params}`);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/admin/wishlist?${params}`);
  };

  const hasFilters =
    sp.get("search") || sp.get("category") || sp.get("status") ||
    sp.get("dateFrom") || sp.get("dateTo");

  const clearAll = () => {
    setSearch("");
    router.push("/admin/wishlist");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-green)] bg-bg-cream px-4 py-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm tiêu đề, tên / email NGO..."
          className="h-8 w-64 rounded-lg border border-[var(--border-green)] bg-white pl-8 pr-3 text-sm text-brand-darker placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-brand-dark"
        />
      </div>

      {/* Category */}
      <select
        value={sp.get("category") ?? ""}
        onChange={(e) => update("category", e.target.value)}
        className={SELECT_CLS}
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      {/* Status */}
      <select
        value={sp.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className={SELECT_CLS}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Date from */}
      <input
        type="date"
        value={sp.get("dateFrom") ?? ""}
        onChange={(e) => update("dateFrom", e.target.value)}
        className={SELECT_CLS}
        title="Từ ngày"
      />

      {/* Date to */}
      <input
        type="date"
        value={sp.get("dateTo") ?? ""}
        onChange={(e) => update("dateTo", e.target.value)}
        className={SELECT_CLS}
        title="Đến ngày"
      />

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 h-8 rounded-lg px-2 text-sm text-muted-foreground hover:text-red-500 transition-colors"
        >
          <X className="size-3.5" />
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
