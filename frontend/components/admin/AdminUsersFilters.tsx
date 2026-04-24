"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

const ROLES = [
  { value: "", label: "Tất cả vai trò" },
  { value: "member", label: "Thành viên" },
  { value: "ngo", label: "NGO" },
  { value: "individual", label: "Cá nhân" },
  { value: "admin", label: "Admin" },
];

const VERIFICATION_STATUSES = [
  { value: "", label: "Tất cả xác thực" },
  { value: "unverified", label: "Chưa xác thực" },
  { value: "pending", label: "Đang chờ" },
  { value: "verified", label: "Đã xác thực" },
  { value: "rejected", label: "Bị từ chối" },
];

const ACCOUNT_STATUSES = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "active", label: "Hoạt động" },
  { value: "suspended", label: "Tạm khóa" },
  { value: "banned", label: "Bị cấm" },
];

const SELECT_CLS =
  "h-8 rounded-lg border border-[var(--border-green)] bg-white px-2 text-sm text-brand-darker outline-none focus:ring-1 focus:ring-brand-dark";

export function AdminUsersFilters() {
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
      router.push(`/admin/users?${params}`);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/admin/users?${params}`);
  };

  const hasFilters =
    sp.get("search") ||
    sp.get("role") ||
    sp.get("verificationStatus") ||
    sp.get("accountStatus");

  const clearAll = () => {
    setSearch("");
    router.push("/admin/users");
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
          placeholder="Tìm tên hoặc email..."
          className="h-8 w-56 rounded-lg border border-[var(--border-green)] bg-white pl-8 pr-3 text-sm text-brand-darker placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-brand-dark"
        />
      </div>

      {/* Role */}
      <select
        value={sp.get("role") ?? ""}
        onChange={(e) => update("role", e.target.value)}
        className={SELECT_CLS}
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      {/* Verification status */}
      <select
        value={sp.get("verificationStatus") ?? ""}
        onChange={(e) => update("verificationStatus", e.target.value)}
        className={SELECT_CLS}
      >
        {VERIFICATION_STATUSES.map((v) => (
          <option key={v.value} value={v.value}>
            {v.label}
          </option>
        ))}
      </select>

      {/* Account status */}
      <select
        value={sp.get("accountStatus") ?? ""}
        onChange={(e) => update("accountStatus", e.target.value)}
        className={SELECT_CLS}
      >
        {ACCOUNT_STATUSES.map((a) => (
          <option key={a.value} value={a.value}>
            {a.label}
          </option>
        ))}
      </select>

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
