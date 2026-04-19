"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { DocumentGroupInput } from "./DocumentGroupInput";
import { uploadImage } from "@/lib/api/upload";
import { submitVerificationRequest } from "@/lib/api/verification";

interface DocumentGroup {
  label: string;
  uploadedUrls: string[];
  uploading: boolean;
  uploadError: string | null;
}

interface SubmitVerificationFormProps {
  hasPendingRequest: boolean;
  isAlreadyVerified: boolean;
  rejectedReason?: string | null;
  requestType?: "individual" | "ngo";
}

const MAX_GROUPS = 10;

function createEmptyGroup(): DocumentGroup {
  return { label: "", uploadedUrls: [], uploading: false, uploadError: null };
}

export function SubmitVerificationForm({
  hasPendingRequest,
  isAlreadyVerified,
  rejectedReason,
  requestType = "individual",
}: SubmitVerificationFormProps) {
  const [groups, setGroups] = useState<DocumentGroup[]>([createEmptyGroup()]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (isAlreadyVerified) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Tài khoản của bạn đã được xác minh.</p>
      </Card>
    );
  }

  if (hasPendingRequest) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Bạn đã có yêu cầu đang chờ duyệt.</p>
      </Card>
    );
  }

  if (success) {
    return (
      <Card>
        <p className="text-sm font-semibold text-green-700">
          Đơn xác minh đã được gửi thành công! Vui lòng chờ Admin duyệt.
        </p>
      </Card>
    );
  }

  function handleLabelChange(idx: number, value: string) {
    setGroups((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, label: value } : g)),
    );
  }

  async function handleImagesAdded(idx: number, files: FileList) {
    setGroups((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, uploading: true, uploadError: null } : g)),
    );

    const uploaded: string[] = [];
    let errorMsg: string | null = null;

    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file);
        uploaded.push(url);
      } catch (err) {
        errorMsg = err instanceof Error ? err.message : "Tải ảnh lên thất bại.";
        break;
      }
    }

    setGroups((prev) =>
      prev.map((g, i) =>
        i === idx
          ? {
              ...g,
              uploading: false,
              uploadedUrls: [...g.uploadedUrls, ...uploaded],
              uploadError: errorMsg,
            }
          : g,
      ),
    );
  }

  function handleImageRemove(groupIdx: number, imageIdx: number) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === groupIdx
          ? { ...g, uploadedUrls: g.uploadedUrls.filter((_, j) => j !== imageIdx) }
          : g,
      ),
    );
  }

  function handleGroupRemove(idx: number) {
    setGroups((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleAddGroup() {
    if (groups.length >= MAX_GROUPS) return;
    setGroups((prev) => [...prev, createEmptyGroup()]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const hasAnyImage = groups.some((g) => g.uploadedUrls.length > 0);
    if (!hasAnyImage) {
      setSubmitError("Cần ít nhất 1 ảnh minh chứng. Vui lòng tải ảnh lên.");
      return;
    }

    const isUploading = groups.some((g) => g.uploading);
    if (isUploading) {
      setSubmitError("Vui lòng chờ ảnh tải lên xong trước khi gửi đơn.");
      return;
    }

    const documents = groups
      .filter((g) => g.uploadedUrls.length > 0)
      .flatMap((g) =>
        g.uploadedUrls.map((url) => ({ url, label: g.label || null })),
      );

    setSubmitting(true);
    try {
      await submitVerificationRequest({
        requestType,
        documents,
        notes: notes.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Gửi đơn thất bại. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <h2 className="text-base font-semibold text-foreground mb-4">Nộp đơn xác minh</h2>

      {rejectedReason && (
        <div className="rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 mb-4">
          <p className="text-sm font-medium text-orange-800">Lý do từ chối lần trước:</p>
          <p className="text-sm text-orange-700 mt-1">{rejectedReason}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-3">
          {groups.map((group, idx) => (
            <DocumentGroupInput
              key={idx}
              index={idx}
              label={group.label}
              uploadedUrls={group.uploadedUrls}
              uploading={group.uploading}
              uploadError={group.uploadError}
              onLabelChange={handleLabelChange}
              onImagesAdded={handleImagesAdded}
              onImageRemove={handleImageRemove}
              onGroupRemove={handleGroupRemove}
              canRemove={groups.length > 1}
            />
          ))}
        </div>

        {groups.length < MAX_GROUPS && (
          <Button type="button" variant="outline" size="sm" onClick={handleAddGroup}>
            + Thêm loại giấy tờ
          </Button>
        )}

        <div className="flex flex-col gap-1">
          <label
            htmlFor="verify-notes"
            className="text-sm font-medium text-foreground"
          >
            {requestType === "ngo" ? "Ghi chú thêm" : "Mô tả hoàn cảnh"}{" "}
            <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
          </label>
          <textarea
            id="verify-notes"
            rows={4}
            placeholder={
              requestType === "ngo"
                ? "Thông tin bổ sung về tổ chức (không bắt buộc)..."
                : "Chia sẻ thêm về hoàn cảnh của bạn để Admin hiểu rõ hơn..."
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">{notes.length}/1000</p>
        </div>

        {submitError && (
          <p className="text-sm text-red-600">{submitError}</p>
        )}

        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner size="sm" />
              <span className="ml-2">Đang gửi đơn...</span>
            </>
          ) : (
            "Gửi đơn xác minh"
          )}
        </Button>
      </form>
    </Card>
  );
}
