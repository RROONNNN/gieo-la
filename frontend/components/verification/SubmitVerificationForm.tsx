"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { submitVerificationRequest } from "@/lib/api/verification";
import { uploadFiles } from "@/lib/api/upload";

interface SubmitVerificationFormProps {
  hasPendingRequest: boolean;
  isAlreadyVerified: boolean;
  rejectedReason: string | null;
  requestType: "individual" | "ngo";
}

export function SubmitVerificationForm({
  hasPendingRequest,
  isAlreadyVerified,
  rejectedReason,
  requestType,
}: SubmitVerificationFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (hasPendingRequest || isAlreadyVerified) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Vui lòng tải lên ít nhất 1 tài liệu");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      // Upload all files first
      setUploading(true);
      const urls = await uploadFiles(files);
      setUploading(false);

      const documents = urls.map((url, i) => ({
        url,
        label: files[i].name,
      }));

      await submitVerificationRequest({
        requestType,
        documents,
        notes: notes.trim() || undefined,
      });

      router.refresh();
    } catch (err) {
      setError( err instanceof Error? err.message : "Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const typeLabel =
    requestType === "ngo" ? "Tổ chức thiện nguyện (NGO)" : "Cá nhân hoàn cảnh khó khăn";

  return (
    <div className="rounded-[15px] border border-[var(--border-green)] bg-white p-6">
      <h2 className="mb-1 font-heading text-lg font-semibold text-brand-darker">
        Gửi yêu cầu xác thực
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Loại tài khoản: <strong className="text-brand-darker">{typeLabel}</strong>
      </p>

      {rejectedReason && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Lý do bị từ chối trước:</strong> {rejectedReason}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* File upload */}
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-darker">
            Tài liệu chứng minh <span className="text-red-500">*</span>
          </label>
          <p className="mb-3 text-xs text-muted-foreground">
            {requestType === "ngo"
              ? "Giấy phép hoạt động, quyết định thành lập tổ chức, v.v."
              : "CCCD/CMND, xác nhận của địa phương, v.v."}
          </p>

          {/* Drop zone */}
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--border-green)] bg-bg-cream px-6 py-8 text-center hover:border-brand-dark transition-colors">
            <Upload className="size-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Nhấn để chọn file (tối đa 5 file)
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={files.length >= 5}
            />
          </label>

          {/* Preview */}
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((file, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-[var(--border-green)] bg-white px-3 py-2 text-sm"
                >
                  <span className="truncate text-brand-darker">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="ml-2 shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-darker">
            Ghi chú thêm (tuỳ chọn)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Mô tả thêm về hoàn cảnh hoặc tổ chức của bạn..."
            rows={3}
            className="w-full resize-none rounded-lg border border-[var(--border-green)] bg-bg-cream px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-dark"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={submitting || uploading} className="w-full">
          {uploading ? "Đang tải lên..." : submitting ? "Đang gửi..." : "Gửi yêu cầu xác thực"}
        </Button>
      </form>
    </div>
  );
}
