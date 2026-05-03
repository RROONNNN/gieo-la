/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Send, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { createComment, deleteComment } from "@/lib/api/comments";
import { uploadImage } from "@/lib/api/upload";
import { formatRelativeTimeVN } from "@/lib/utils";
import type { PostComment } from "@/types/comment";

interface CommentSectionProps {
  postId: string;
  initialComments: PostComment[];
}

const MAX_IMAGES = 3;

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<PostComment[]>(initialComments);
  const [content, setContent] = useState("");
  /** local File objects for preview */
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  /** preview data URLs */
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Image picker ──────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - pendingFiles.length;
    const accepted = files.slice(0, remaining);

    setPendingFiles((prev) => [...prev, ...accepted]);
    accepted.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPreviews((prev) => [...prev, ev.target!.result as string]);
      reader.readAsDataURL(f);
    });

    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const removePreview = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && pendingFiles.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      // Upload images first
      let uploadedUrls: string[] = [];
      if (pendingFiles.length > 0) {
        setUploading(true);
        uploadedUrls = await Promise.all(pendingFiles.map((f) => uploadImage(f)));
        setUploading(false);
      }

      // Optimistic comment
      const optimisticId = `temp-${Date.now()}`;
      const optimistic: PostComment = {
        _id: optimisticId,
        post: postId,
        author: {
          _id: user!._id,
          name: user!.name,
          avatar: user!.avatar ?? null,
          role: user!.role,
          badge: user!.badge,
        },
        content: content.trim(),
        images: uploadedUrls,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setComments((prev) => [...prev, optimistic]);
      setContent("");
      setPendingFiles([]);
      setPreviews([]);

      const res = await createComment(postId, optimistic.content, uploadedUrls);
      setComments((prev) =>
        prev.map((c) => (c._id === optimisticId ? res.data.comment : c)),
      );
    } catch (err: any) {
      setUploading(false);
      // Revert optimistic
      setComments((prev) => prev.filter((c) => !c._id.startsWith("temp-")));
      setError(err.message || "Không thể đăng bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (commentId: string) => {
    const removed = comments.find((c) => c._id === commentId);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    try {
      await deleteComment(postId, commentId);
    } catch (err: any) {
      if (removed) setComments((prev) => [...prev, removed]);
      alert(err.message || "Không thể xóa bình luận");
    }
  };

  const canSubmit = !submitting && (content.trim().length > 0 || pendingFiles.length > 0);

  return (
    <div className="mt-8">
      <h2 className="mb-4 font-heading text-xl font-semibold text-brand-darker">
        Bình luận ({comments.length})
      </h2>

      {/* Comment list */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Chưa có bình luận. Hãy là người đầu tiên!
          </p>
        )}
        {comments.map((comment) => {
          const isOwn = user?._id === comment.author._id;
          const isAdmin = user?.role === "admin";
          return (
            <div
              key={comment._id}
              className="flex gap-3 rounded-[15px] border border-[var(--border-green)] bg-white p-4"
            >
              <Avatar src={comment.author.avatar} alt={comment.author.name} size="sm" userId={comment.author._id} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-brand-darker">
                    {comment.author.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTimeVN(comment.createdAt)}
                    </span>
                    {(isOwn || isAdmin) && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                        title="Xóa bình luận"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {comment.content && (
                  <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}

                {comment.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {comment.images.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`ảnh ${i + 1}`}
                          className="h-24 w-24 rounded-lg object-cover border border-[var(--border-green)] hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
          <Avatar src={user?.avatar} alt={user?.name} size="sm" userId={user?._id} />
          <div className="flex-1 space-y-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết bình luận..."
              rows={2}
              maxLength={500}
              className="w-full resize-none rounded-lg border border-[var(--border-green)] bg-bg-cream px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-dark"
            />

            {/* Image previews */}
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`preview ${i + 1}`}
                      className="h-20 w-20 rounded-lg object-cover border border-[var(--border-green)]"
                    />
                    <button
                      type="button"
                      onClick={() => removePreview(i)}
                      className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex items-center justify-between">
              {/* Image picker button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={pendingFiles.length >= MAX_IMAGES}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-dark disabled:opacity-40 transition-colors"
                title="Thêm ảnh (tối đa 3)"
              >
                <ImagePlus className="size-4" />
                Thêm ảnh ({pendingFiles.length}/{MAX_IMAGES})
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <Button type="submit" size="sm" disabled={!canSubmit}>
                <Send className="mr-1 size-3.5" />
                {uploading ? "Đang tải ảnh..." : submitting ? "Đang gửi..." : "Gửi"}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          <a href="/login" className="text-brand-dark underline">
            Đăng nhập
          </a>{" "}
          để bình luận.
        </p>
      )}
    </div>
  );
}
