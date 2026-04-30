"use client";

import { useState } from "react";
import { Pin, PinOff, EyeOff, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminDeleteNews, adminTogglePinNews, adminUpdateNews } from "@/lib/api/news";
import type { NewsStatus } from "@/types/news";

interface NewsAdminActionsProps {
  id: string;
  isPinned: boolean;
  status: NewsStatus;
}

export function NewsAdminActions({ id, isPinned, status }: NewsAdminActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const run = async (action: string, fn: () => Promise<unknown>) => {
    setLoading(action);
    try {
      await fn();
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      alert(message);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = () => {
    if (!confirm("Xóa bài viết này? Hành động không thể hoàn tác.")) return;
    run("delete", () => adminDeleteNews(id));
  };

  const handleTogglePin = () => run("pin", () => adminTogglePinNews(id));

  const handleToggleVisibility = () => {
    const newStatus: NewsStatus = status === "published" ? "hidden" : "published";
    run("visibility", () => adminUpdateNews(id, { status: newStatus }));
  };

  return (
    <div className="flex items-center gap-1">
      {/* Pin / Unpin */}
      <button
        onClick={handleTogglePin}
        disabled={loading !== null}
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-40"
        title={isPinned ? "Bỏ ghim" : "Ghim bài"}
      >
        {isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
      </button>

      {/* Hide / Publish toggle */}
      {status !== "draft" && (
        <button
          onClick={handleToggleVisibility}
          disabled={loading !== null}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-40"
          title={status === "published" ? "Ẩn bài" : "Đăng bài"}
        >
          {status === "published" ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      )}

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={loading !== null}
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
        title="Xóa bài"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
