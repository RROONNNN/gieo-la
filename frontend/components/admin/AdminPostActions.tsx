/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Pin, PinOff, CheckCircle2, Trash2, Clock } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useRouter } from "next/navigation";

interface AdminPostActionsProps {
  postId: string;
  isPinned: boolean;
  status: string;
  receiverConfirmed?: boolean;
}

export function AdminPostActions({
  postId,
  isPinned,
  status,
  receiverConfirmed = false,
}: AdminPostActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const run = async (action: string, fn: () => Promise<unknown>) => {
    setLoading(action);
    try {
      await fn();
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Pin / Unpin */}
      <button
        onClick={() =>
          run("pin", () => apiClient.patch(ENDPOINTS.ADMIN_POSTS.PIN(postId), {}))
        }
        disabled={loading !== null}
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-40"
        title={isPinned ? "Bỏ ghim" : "Ghim bài"}
      >
        {isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
      </button>

      {/* Complete */}
      {status !== "completed" && (
        <button
          onClick={() =>
            run("complete", () =>
              apiClient.patch(ENDPOINTS.ADMIN_POSTS.COMPLETE(postId), {}),
            )
          }
          disabled={loading !== null}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-40"
          title={
            status === "traded" && !receiverConfirmed
              ? "Chờ người nhận xác nhận trước"
              : "Đánh dấu hoàn thành"
          }
        >
          {status === "traded" && !receiverConfirmed ? (
            <Clock className="size-4 text-amber-400" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
        </button>
      )}

      {/* Delete */}
      <button
        onClick={() => {
          if (!confirm("Xác nhận xoá bài đăng này?")) return;
          run("delete", () =>
            apiClient.delete(ENDPOINTS.ADMIN_POSTS.DELETE(postId)),
          );
        }}
        disabled={loading !== null}
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
        title="Xoá bài đăng"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
