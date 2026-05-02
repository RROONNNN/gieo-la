"use client";

import { useState } from "react";
import { Pin, PinOff, Trash2, CheckCircle2, RotateCcw } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useRouter } from "next/navigation";

interface AdminWishlistActionsProps {
  wishlistId: string;
  isPinned: boolean;
  status: "open" | "fulfilled";
}

export function AdminWishlistActions({
  wishlistId,
  isPinned,
  status,
}: AdminWishlistActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const toggleStatus = () => {
    const newStatus = status === "open" ? "fulfilled" : "open";
    const label = newStatus === "fulfilled" ? "đáp ứng" : "mở lại";
    if (!confirm(`Đánh dấu wishlist là "${label}"?`)) return;
    run("status", () =>
      apiClient.patch(ENDPOINTS.ADMIN_WISHLIST.UPDATE_STATUS(wishlistId), {
        status: newStatus,
      }),
    );
  };

  return (
    <div className="flex items-center gap-1">
      {/* Pin / Unpin */}
      <button
        onClick={() =>
          run("pin", () =>
            apiClient.patch(ENDPOINTS.ADMIN_WISHLIST.PIN(wishlistId), {}),
          )
        }
        disabled={loading !== null}
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-40"
        title={isPinned ? "Bỏ ghim" : "Ghim wishlist"}
      >
        {isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
      </button>

      {/* Toggle status */}
      <button
        onClick={toggleStatus}
        disabled={loading !== null}
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-40"
        title={status === "open" ? "Đánh dấu đã đáp ứng" : "Mở lại wishlist"}
      >
        {status === "open" ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <RotateCcw className="size-4" />
        )}
      </button>

      {/* Delete */}
      <button
        onClick={() => {
          if (!confirm("Xác nhận xoá wishlist này?")) return;
          run("delete", () =>
            apiClient.delete(ENDPOINTS.ADMIN_WISHLIST.DELETE(wishlistId)),
          );
        }}
        disabled={loading !== null}
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
        title="Xoá wishlist"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
