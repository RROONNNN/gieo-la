"use client";

import { useState } from "react";
import { Pencil, Trash2, CheckCircle2, RotateCcw, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { deletePost, updatePostStatus } from "@/lib/api/posts";
import type { PostStatus } from "@/types/enums";
import { undoSelectApplicant } from "@/lib/api/applications";

interface PostOwnerActionsProps {
  postId: string;
  postStatus: PostStatus;
  isAuthor: boolean;
  receiverConfirmed?: boolean;
}

export function PostOwnerActions({
  postId,
  postStatus,
  isAuthor,
  receiverConfirmed = false,
}: PostOwnerActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  if (!isAuthor) return null;

  const canEdit = postStatus === "available";

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bài đăng này không?")) return;
    setDeleting(true);
    try {
      await deletePost(postId);
      router.push("/posts");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Không thể xóa bài đăng");
      setDeleting(false);
    }
  };

  const handleStatusTransition = async (newStatus: PostStatus) => {
    setTransitioning(true);
    try {
      await updatePostStatus(postId, newStatus);
      router.refresh();
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Không thể thay đổi trạng thái",
      );
    } finally {
      setTransitioning(false);
    }
  };
  const handleUndoSelect = async () => {
    if (!confirm("Bạn có chắc muốn hoàn tác lựa chọn người nhận này không?"))
      return;
    setTransitioning(true);
    try {
      await undoSelectApplicant(postId);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Không thể hoàn tác lựa chọn");
    } finally {
      setTransitioning(false);
    }
  };

  return (
    <div className="mb-4 space-y-3">
      {/* Edit / Delete row */}
      <div className="flex gap-2">
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

      {/* Status transition panel */}
      {postStatus === "in_transaction" && (
        <div className="flex flex-wrap gap-2 rounded-[15px] border border-[var(--border-green)] bg-white p-4">
          <p className="w-full text-sm font-medium text-brand-darker mb-1">
            Trạng thái giao dịch
          </p>
          <Button
            size="sm"
            disabled={transitioning}
            onClick={() => handleStatusTransition("traded")}
          >
            <CheckCircle2 className="mr-1.5 size-4" />
            {transitioning ? "Đang cập nhật..." : "Xác nhận đã giao"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={transitioning}
            onClick={handleUndoSelect}
          >
            <RotateCcw className="mr-1.5 size-4" />
            Hoàn tác
          </Button>
        </div>
      )}

      {postStatus === "traded" && (
        <div className="rounded-[15px] border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              Đang chờ xác nhận hoàn thành
            </p>
          </div>
          <ul className="mt-2 space-y-1 pl-6 text-xs text-amber-700">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 shrink-0 text-green-600" />
              Bạn đã xác nhận đã giao
            </li>
            <li className="flex items-center gap-1.5">
              {receiverConfirmed ? (
                <CheckCircle2 className="size-3.5 shrink-0 text-green-600" />
              ) : (
                <Clock className="size-3.5 shrink-0 text-amber-500" />
              )}
              {receiverConfirmed
                ? "Người nhận đã xác nhận"
                : "Chờ người nhận xác nhận..."}
            </li>
            <li className="flex items-center gap-1.5">
              {receiverConfirmed ? (
                <Clock className="size-3.5 shrink-0 text-amber-500" />
              ) : (
                <Clock className="size-3.5 shrink-0 text-amber-300" />
              )}
              {receiverConfirmed
                ? "Chờ Admin duyệt hoàn thành"
                : "Admin duyệt (sau khi người nhận xác nhận)"}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
