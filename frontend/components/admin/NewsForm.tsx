"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { adminCreateNews, adminUpdateNews } from "@/lib/api/news";
import { uploadImage } from "@/lib/api/upload";
import type { NewsPost, CreateNewsPayload, NewsCategory, NewsStatus } from "@/types/news";

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: "announcement", label: "Thông báo" },
  { value: "story", label: "Câu chuyện cảm hứng" },
  { value: "guide", label: "Hướng dẫn sử dụng" },
  { value: "event", label: "Hoạt động cộng đồng" },
];

const STATUSES: { value: NewsStatus; label: string }[] = [
  { value: "draft", label: "Lưu nháp" },
  { value: "published", label: "Đăng ngay" },
  { value: "hidden", label: "Ẩn" },
];

interface NewsFormProps {
  /** Pass existing post to edit; omit to create new */
  post?: NewsPost;
}

export function NewsForm({ post }: NewsFormProps) {
  const router = useRouter();
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [category, setCategory] = useState<NewsCategory>(post?.category ?? "announcement");
  const [status, setStatus] = useState<NewsStatus>(post?.status ?? "draft");
  const [content, setContent] = useState(post?.content ?? "");
  const [isPinned, setIsPinned] = useState(post?.isPinned ?? false);
  const [thumbnailUrl, setThumbnailUrl] = useState(post?.thumbnail ?? "");
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setThumbnailUrl(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Tải ảnh bìa thất bại");
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnailUrl) {
      setError("Vui lòng tải lên ảnh bìa");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateNewsPayload = {
        title,
        thumbnail: thumbnailUrl,
        content,
        category,
        status,
        isPinned,
      };
      if (isEdit) {
        await adminUpdateNews(post._id, payload);
      } else {
        await adminCreateNews(payload);
      }
      router.push("/admin/news");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-[10px] border border-[var(--border-green)] bg-white px-3 py-2 text-sm text-brand-darker placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-dark/30";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Error */}
      {error && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-brand-darker">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tiêu đề bài viết..."
          required
          minLength={5}
          maxLength={200}
          className={inputClass}
        />
      </div>

      {/* Category + Status row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-brand-darker">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as NewsCategory)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-brand-darker">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as NewsStatus)}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-brand-darker">
          Ảnh bìa <span className="text-red-500">*</span>
          <span className="ml-1 text-xs font-normal text-muted-foreground">(tối đa 5 MB)</span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleThumbnailChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={thumbnailUploading}
          className="flex items-center gap-2 rounded-[10px] border border-dashed border-[var(--border-green)] bg-white px-4 py-3 text-sm text-muted-foreground hover:bg-brand-light/20 transition-colors disabled:opacity-50"
        >
          {thumbnailUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {thumbnailUploading
            ? "Đang tải lên..."
            : thumbnailUrl
              ? "Đổi ảnh bìa"
              : "Chọn ảnh bìa"}
        </button>
        {thumbnailUrl && (
          <div className="relative mt-2 aspect-[16/9] w-full max-w-sm overflow-hidden rounded-[10px] border border-[var(--border-green)]">
            <Image src={thumbnailUrl} alt="Ảnh bìa" fill className="object-cover" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-brand-darker">
          Nội dung <span className="text-red-500">*</span>
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (hỗ trợ Markdown)
          </span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nhập nội dung bài viết... (hỗ trợ Markdown)"
          required
          rows={16}
          className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
        />
      </div>

      {/* isPinned */}
      <div className="flex items-center gap-2">
        <input
          id="isPinned"
          type="checkbox"
          checked={isPinned}
          onChange={(e) => setIsPinned(e.target.checked)}
          className="size-4 rounded border-[var(--border-green)] accent-brand-dark"
        />
        <label htmlFor="isPinned" className="text-sm text-brand-darker">
          Ghim bài viết lên đầu trang Bản tin
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || thumbnailUploading}
          className="inline-flex items-center gap-2 rounded-full bg-brand-dark px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-darker transition-colors disabled:opacity-50"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Lưu thay đổi" : status === "published" ? "Đăng bài" : "Lưu nháp"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/news")}
          className="rounded-full border border-[var(--border-green)] px-6 py-2.5 text-sm font-medium text-brand-darker hover:bg-brand-light/30 transition-colors"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
