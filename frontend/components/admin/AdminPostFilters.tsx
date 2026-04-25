"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "Tất cả danh mục" },
  { value: "do_nam", label: "Đồ Nam" },
  { value: "do_nu", label: "Đồ Nữ" },
  { value: "do_tre_em", label: "Đồ Trẻ em" },
  { value: "phu_kien", label: "Phụ kiện" },
];

const STATUSES = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "available", label: "Sẵn sàng" },
  { value: "in_transaction", label: "Đang giao dịch" },
  { value: "traded", label: "Đã giao dịch" },
  { value: "completed", label: "Hoàn thành" },
];

const SELECT_CLS =
  "h-8 rounded-lg border border-[var(--border-green)] bg-white px-2 text-sm text-brand-darker outline-none focus:ring-1 focus:ring-brand-dark";

export function AdminPostFilters() {
  const sp = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(sp.get("search") ?? "");

  // sync search input when URL changes externally
  useEffect(() => {
    setSearch(sp.get("search") ?? "");
  }, [sp]);

  // debounce search → URL
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(sp.toString());
      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`/admin/posts?${params}`);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/admin/posts?${params}`);
  };

  const hasFilters =
    sp.get("search") || sp.get("category") || sp.get("status") || sp.get("dateFrom") || sp.get("dateTo");

  const clearAll = () => {
    setSearch("");
    router.push("/admin/posts");
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
          placeholder="Tìm tiêu đề, tên / email người đăng..."
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

      {/* Date range */}
      <input
        type="date"
        value={sp.get("dateFrom") ?? ""}
        onChange={(e) => update("dateFrom", e.target.value)}
        title="Từ ngày"
        className={SELECT_CLS}
      />
      <span className="text-xs text-muted-foreground">→</span>
      <input
        type="date"
        value={sp.get("dateTo") ?? ""}
        onChange={(e) => update("dateTo", e.target.value)}
        title="Đến ngày"
        className={SELECT_CLS}
      />

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
        >
          <X className="size-3" />
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
