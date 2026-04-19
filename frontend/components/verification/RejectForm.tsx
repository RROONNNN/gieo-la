"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { adminReject } from "@/lib/api/verification";

interface RejectFormProps {
  requestId: string;
}

export default function RejectForm({ requestId }: RejectFormProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleReject() {
    if (reason.trim().length < 5) {
      setValidationError("Lý do từ chối phải có ít nhất 5 ký tự.");
      return;
    }
    setValidationError(null);
    setLoading(true);
    setError(null);
    try {
      await adminReject(requestId, reason.trim());
      router.push("/admin/verifications");
    } catch {
      setError("Không thể từ chối đơn. Vui lòng thử lại.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Lý do từ chối
      </label>
      <textarea
        value={reason}
        onChange={(e) => {
          setReason(e.target.value);
          if (validationError) setValidationError(null);
        }}
        placeholder="Nhập lý do từ chối (bắt buộc)..."
        rows={3}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        variant="danger"
        onClick={handleReject}
        loading={loading}
        disabled={loading}
      >
        Từ chối
      </Button>
    </div>
  );
}
