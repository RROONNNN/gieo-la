/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { adminApprove, adminReject } from "@/lib/api/verification";

interface VerificationActionsProps {
  requestId: string;
  currentStatus: string;
}

export function VerificationActions({
  requestId,
  currentStatus,
}: VerificationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (currentStatus !== "pending") {
    return (
      <p className="text-sm text-muted-foreground">
        Yêu cầu này đã được xử lý.
      </p>
    );
  }

  const handleApprove = async () => {
    setLoading("approve");
    setError(null);
    try {
      await adminApprove(requestId);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Không thể phê duyệt");
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }
    setLoading("reject");
    setError(null);
    try {
      await adminReject(requestId, rejectionReason.trim());
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Không thể từ chối");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Button
          onClick={handleApprove}
          disabled={loading !== null}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading === "approve" ? "Đang xử lý..." : "Phê duyệt"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowRejectForm((v) => !v)}
          disabled={loading !== null}
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          Từ chối
        </Button>
      </div>

      {showRejectForm && (
        <div className="space-y-2">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            rows={3}
            className="w-full resize-none rounded-lg border border-[var(--border-green)] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-dark"
          />
          <Button
            size="sm"
            onClick={handleReject}
            disabled={loading !== null}
            className="border-red-300 bg-red-600 hover:bg-red-700 text-white"
          >
            {loading === "reject" ? "Đang xử lý..." : "Xác nhận từ chối"}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
