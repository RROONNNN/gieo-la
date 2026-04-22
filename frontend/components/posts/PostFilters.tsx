"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { CATEGORY_LABEL } from "@/lib/postLabels";
import type { PostCategory } from "@/types/enums";

const CATEGORY_TABS: Array<{ label: string; value: string }> = [
  { label: "Tất cả", value: "" },
  ...Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label })),
];

interface Props {
  currentCategory?: PostCategory;
  currentSearch?: string;
}

export function PostFilters({ currentCategory, currentSearch }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentSearch ?? "");

  function navigate(params: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page"); // Reset to page 1 on filter change
    router.push(`${pathname}?${next.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: searchValue.trim() });
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm bài đăng..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Tìm
        </button>
      </form>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => navigate({ category: tab.value })}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              (currentCategory ?? "") === tab.value
                ? "bg-primary-600 text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
