"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  size?: "default" | "hero";
}

export function SearchBar({
  defaultValue = "",
  placeholder = "Tìm kiếm món đồ...",
  className,
  size = "default",
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSearch = () => {
    const trimmed = query.trim();
    router.push(
      `/posts${trimmed ? `?search=${encodeURIComponent(trimmed)}` : ""}`,
    );
  };

  if (size === "hero") {
    return (
      <div
        className={cn(
          "flex items-center rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl ring-1 ring-white/20 overflow-hidden",
          className,
        )}
      >
        <Search className="ml-5 size-5 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-4 py-4 text-base text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button
          onClick={handleSearch}
          className="m-2 shrink-0 rounded-xl bg-brand-dark px-7 py-3 text-sm font-semibold text-white hover:bg-brand-darker active:scale-95 transition-all"
        >
          Tìm kiếm
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center rounded-full border border-[var(--border-green)] bg-bg-cream px-3 py-2",
        className,
      )}
    >
      <Search className="size-5 text-muted-foreground shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 py-1.5 text-base text-foreground placeholder:text-muted-foreground outline-none"
      />
      <button
        onClick={handleSearch}
        className="shrink-0 rounded-full bg-brand-dark px-6 py-2 text-sm font-semibold text-white hover:bg-brand-darker transition-colors"
      >
        Tìm kiếm
      </button>
    </div>
  );
}
