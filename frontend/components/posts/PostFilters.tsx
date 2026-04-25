"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "do_nam", label: "Đồ Nam" },
  { key: "do_nu", label: "Đồ Nữ" },
  { key: "do_tre_em", label: "Đồ Trẻ em" },
  { key: "phu_kien", label: "Phụ kiện" },
];

const STATUSES = [
  { key: "available", label: "Sẵn sàng" },
  { key: "in_transaction", label: "Đang giao dịch" },
  { key: "traded", label: "Đã giao dịch" },
  { key: "completed", label: "Hoàn thành" },
];

interface PostFiltersProps {
  currentCategory?: string;
  currentSearch?: string;
  isAuthenticated?: boolean;
  isMine?: boolean;
}

export function PostFilters({
  currentCategory,
  currentSearch,
  isAuthenticated,
  isMine,
}: PostFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/posts?${params.toString()}`);
  };

  const toggleMine = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isMine) {
      params.delete("mine");
    } else {
      params.set("mine", "true");
      params.delete("status");
    }
    params.delete("page");
    router.push(`/posts?${params.toString()}`);
  };

  const activeCategory = searchParams.get("category");
  const activeStatus = searchParams.get("status");

  return (
    <div className="space-y-6">
      {/* Bài đăng của tôi */}
      {isAuthenticated && (
        <div>
          <button
            onClick={toggleMine}
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              isMine
                ? "border-brand-dark bg-brand-dark text-white"
                : "border-[var(--border-green)] bg-white text-brand-darker hover:bg-brand-light/30",
            )}
          >
            {isMine ? "✓ Bài đăng của tôi" : "Bài đăng của tôi"}
          </button>
        </div>
      )}

      {/* Danh mục */}
      <div>
        <h3 className="mb-3 font-heading text-lg font-semibold text-brand-darker">
          Danh mục
        </h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeCategory === cat.key}
                onChange={() =>
                  updateFilter(
                    "category",
                    activeCategory === cat.key ? null : cat.key,
                  )
                }
                className="size-4 rounded border-[var(--border-green)] accent-brand-dark"
              />
              <span className="text-sm text-foreground">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Trạng thái */}
      {!isMine && (
        <div>
          <h3 className="mb-3 font-heading text-lg font-semibold text-brand-darker">
            Trạng thái
          </h3>
          <div className="space-y-2">
            {STATUSES.map((st) => (
              <label key={st.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeStatus === st.key}
                  onChange={() =>
                    updateFilter(
                      "status",
                      activeStatus === st.key ? null : st.key,
                    )
                  }
                  className="size-4 rounded border-[var(--border-green)] accent-brand-dark"
                />
                <span className="text-sm text-foreground">{st.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Khu vực */}
      <div>
        <h3 className="mb-3 font-heading text-lg font-semibold text-brand-darker">
          Khu vực
        </h3>
        <select
          className="w-full rounded-lg border border-[var(--border-green)] bg-white px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-brand-dark"
          value={searchParams.get("city") || "all"}
          onChange={(e) =>
            updateFilter("city", e.target.value === "all" ? null : e.target.value)
          }
        >
          <option value="all">Tất cả</option>
          <option value="Hà Nội">Hà Nội</option>
          <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
          <option value="Đà Nẵng">Đà Nẵng</option>
        </select>
      </div>
    </div>
  );
}
