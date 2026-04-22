"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createPost } from "@/lib/api/posts";
import { ENDPOINTS, BASE_URL } from "@/lib/api/endpoints";
import { CATEGORY_LABEL, CONDITION_LABEL } from "@/lib/postLabels";
import type { PostCategory, PostCondition } from "@/types/enums";
import { Post } from "@/types/post";

const TOKEN_KEY = "la_lanh_token";
const CATEGORIES = Object.entries(CATEGORY_LABEL) as [PostCategory, string][];
const CONDITIONS = Object.entries(CONDITION_LABEL) as [PostCondition, string][];

export default function CreatePostPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    category: "" as PostCategory | "",
    quantity: 1,
    condition: "" as PostCondition | "",
    conditionNote: "",
    description: "",
    city: "",
    district: "",
  });

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= 5) {
      setErrors((prev) => ({ ...prev, images: "Tối đa 5 ảnh" }));
      return;
    }

    const index = images.length;
    setUploadingIndex(index);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const data = new FormData();
      data.append("image", file);
      const res = await fetch(`${BASE_URL}${ENDPOINTS.UPLOAD.IMAGE}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload thất bại");
      setImages((prev) => [...prev, json.data.url as string]);
    } catch (err: unknown) {
      setErrors((prev) => ({ ...prev, images: err instanceof Error ? err.message : "Upload thất bại" }));
    } finally {
      setUploadingIndex(null);
      e.target.value = "";
    }
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Vui lòng nhập tiêu đề";
    if (form.title.trim().length < 5) errs.title = "Tiêu đề ít nhất 5 ký tự";
    if (!form.category) errs.category = "Chọn danh mục";
    if (!form.condition) errs.condition = "Chọn tình trạng";
    if (form.quantity < 1) errs.quantity = "Số lượng ít nhất 1";
    if (images.length === 0) errs.images = "Cần ít nhất 1 ảnh";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await createPost({
        title: form.title.trim(),
        category: form.category as PostCategory,
        quantity: Number(form.quantity),
        condition: form.condition as PostCondition,
        conditionNote: form.conditionNote.trim() || undefined,
        images,
        description: form.description.trim() || undefined,
        location: form.city ? { city: form.city.trim(), district: form.district.trim() || undefined } : undefined,
      });
      router.push(`/posts/${res.data.post._id}`);
    } catch (err: unknown) {
      setErrors({ submit: err instanceof Error ? err.message : "Có lỗi xảy ra" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Đăng bài tặng đồ</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ví dụ: Áo khoác nam size M còn mới"
            maxLength={120}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        {/* Category + Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Chọn danh mục</option>
              {CATEGORIES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Tình trạng <span className="text-red-500">*</span>
            </label>
            <select
              value={form.condition}
              onChange={(e) => set("condition", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Chọn tình trạng</option>
              {CONDITIONS.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            {errors.condition && <p className="mt-1 text-xs text-red-500">{errors.condition}</p>}
          </div>
        </div>

        {/* Condition note */}
        {form.condition === "custom" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Ghi chú tình trạng</label>
            <input
              type="text"
              value={form.conditionNote}
              onChange={(e) => set("conditionNote", e.target.value)}
              placeholder="Mô tả tình trạng thực tế..."
              maxLength={500}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Số lượng <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={form.quantity}
            onChange={(e) => set("quantity", parseInt(e.target.value, 10) || 1)}
            className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
        </div>

        {/* Images */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Hình ảnh <span className="text-red-500">*</span>{" "}
            <span className="font-normal text-muted-foreground">({images.length}/5)</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
                <Image src={url} alt={`ảnh ${i + 1}`} fill className="object-cover" sizes="96px" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors">
                {uploadingIndex !== null ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="mt-1 text-xs text-muted-foreground">Thêm ảnh</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingIndex !== null}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {errors.images && <p className="mt-1 text-xs text-red-500">{errors.images}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Mô tả thêm</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Thông tin thêm về đồ vật..."
            maxLength={2000}
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
          />
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Tỉnh/Thành phố</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Hà Nội"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Quận/Huyện</label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => set("district", e.target.value)}
              placeholder="Cầu Giấy"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {errors.submit && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950">{errors.submit}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting || uploadingIndex !== null}>
            {submitting ? "Đang đăng..." : "Đăng bài"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            Huỷ
          </Button>
        </div>
      </form>
    </div>
  );
}
