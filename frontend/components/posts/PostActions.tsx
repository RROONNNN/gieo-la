"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { updatePostStatus, deletePost } from "@/lib/api/posts";
import type { Post } from "@/types/post";
import type { PostStatus, UserRole } from "@/types/enums";

interface Props {
  post: Post;
  isAuthor: boolean;
  viewerRole: UserRole | null;
}

export function PostActions({ post, isAuthor, viewerRole }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isAuthor && viewerRole !== "admin") return null;

  async function handleStatusChange(status: PostStatus) {
    setLoading(true);
    try {
      await updatePostStatus(post._id, status);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Bạn có chắc muốn xoá bài đăng này?")) return;
    setLoading(true);
    try {
      await deletePost(post._id);
      router.push("/posts");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="font-medium text-foreground">Hành động</h3>

      {isAuthor && post.status === "available" && (
        <Button variant="outline" className="w-full" onClick={() => router.push(`/posts/${post._id}/edit`)} disabled={loading}>
          Chỉnh sửa
        </Button>
      )}

      {isAuthor && post.status === "in_transaction" && (
        <Button variant="primary" className="w-full" onClick={() => handleStatusChange("traded")} disabled={loading}>
          Xác nhận đã giao
        </Button>
      )}

      {isAuthor && post.status === "available" && (
        <Button variant="danger" className="w-full" onClick={handleDelete} disabled={loading}>
          Xoá bài đăng
        </Button>
      )}
    </div>
  );
}
