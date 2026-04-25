"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createWishlist } from "@/lib/api/wishlist";
import { ENDPOINTS, BASE_URL } from "@/lib/api/endpoints";
import { CATEGORY_LABEL } from "@/lib/postLabels";
import type { PostCategory } from "@/types/enums";

const TOKEN_KEY = "la_lanh_token";
const CATEGORIES = Object.entries(CATEGORY_LABEL) as [PostCategory, string][];

export function CreateWishlistForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    category: "" as PostCategory | "",
    quantity: 1,
    description: "",
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
      setErrors((prev) => ({
        ...prev,
        images: err instanceof Error ? err.message : "Upload thất bại",
      }));
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
    if (form.title.trim().length < 3) errs.title = "Tiêu đề ít nhất 3 ký tự";
    if (!form.category) errs.category = "Chọn danh mục";
    if (form.quantity < 1) errs.quantity = "Số lượng tối thiểu là 1";
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
      await createWishlist({
        title: form.title.trim(),
        category: form.category as PostCategory,
        quantity: form.quantity,
        images,
        description: form.description.trim() || undefined,
      });
      router.push("/wishlist");
    } catch (err: unknown) {
      setErrors({
        submit: err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-darker">
          Tên vật phẩm cần <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Ví dụ: Quần áo trẻ em size 2–4 tuổi"
          className="w-full rounded-[10px] border border-[var(--border-green)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Category + Quantity */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-darker">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full rounded-[10px] border border-[var(--border-green)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
          >
            <option value="">Chọn danh mục</option>
            {CATEGORIES.map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-darker">
            Số lượng cần <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            value={form.quantity}
            onChange={(e) => set("quantity", parseInt(e.target.value, 10) || 1)}
            className="w-full rounded-[10px] border border-[var(--border-green)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
          />
          {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-darker">
          Ảnh minh họa{" "}
          <span className="font-normal text-muted-foreground">(không bắt buộc, tối đa 5 ảnh)</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative size-20 overflow-hidden rounded-[10px] border border-[var(--border-green)]"
            >
              <img src={url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="flex size-20 cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[var(--border-green)] text-muted-foreground hover:border-brand-dark transition-colors">
              {uploadingIndex !== null ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Upload className="size-5" />
              )}
              <span className="mt-1 text-xs">Thêm ảnh</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingIndex !== null}
              />
            </label>
          )}
        </div>
        {errors.images && <p className="mt-1 text-xs text-red-500">{errors.images}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-darker">
          Mô tả thêm{" "}
          <span className="font-normal text-muted-foreground">(không bắt buộc)</span>
        </label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Nêu rõ kích thước, màu sắc hoặc yêu cầu cụ thể..."
          className="w-full rounded-[10px] border border-[var(--border-green)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark resize-none"
        />
      </div>

      {errors.submit && (
        <p className="rounded-[10px] bg-red-50 px-4 py-2 text-sm text-red-600">{errors.submit}</p>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Đang đăng...
          </span>
        ) : (
          "Đăng Wishlist"
        )}
      </Button>
    </form>
  );
}
