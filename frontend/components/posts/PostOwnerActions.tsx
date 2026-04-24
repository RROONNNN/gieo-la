/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { deletePost } from "@/lib/api/posts";
import type { PostStatus } from "@/types/enums";

interface PostOwnerActionsProps {
  postId: string;
  postStatus: PostStatus;
  isAuthor: boolean;
}

export function PostOwnerActions({ postId, postStatus, isAuthor }: PostOwnerActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  if (!isAuthor) return null;

  const canEdit = postStatus === "available";

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bài đăng này không?")) return;
    setDeleting(true);
    try {
      await deletePost(postId);
      router.push("/posts");
    } catch (err: any) {
      alert(err.message || "Không thể xóa bài đăng");
      setDeleting(false);
    }
  };

  return (
    <div className="mb-4 flex gap-2">
      {canEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/posts/${postId}/edit`)}
        >
          <Pencil className="mr-1.5 size-4" />
          Chỉnh sửa
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={deleting}
        onClick={handleDelete}
        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
      >
        <Trash2 className="mr-1.5 size-4" />
        {deleting ? "Đang xóa..." : "Xóa bài"}
      </Button>
    </div>
  );
}
