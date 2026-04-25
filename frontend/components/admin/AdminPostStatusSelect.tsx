"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdatePostStatus } from "@/lib/api/admin";

const STATUS_OPTIONS = [
  { value: "available", label: "Sẵn sàng" },
  { value: "in_transaction", label: "Đang giao dịch" },
  { value: "traded", label: "Đã giao dịch" },
  { value: "completed", label: "Hoàn thành" },
];

interface AdminPostStatusSelectProps {
  postId: string;
  currentStatus: string;
}

export function AdminPostStatusSelect({
  postId,
  currentStatus,
}: AdminPostStatusSelectProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isCompleted = currentStatus === "completed";

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    if (!confirm(`Chuyển trạng thái sang "${STATUS_OPTIONS.find((o) => o.value === newStatus)?.label}"?`)) return;

    setLoading(true);
    try {
      await adminUpdatePostStatus(postId, newStatus);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Không thể cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={loading || isCompleted}
      className="rounded-lg border border-[var(--border-green)] bg-white px-2 py-1 text-xs text-brand-darker outline-none focus:ring-1 focus:ring-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {loading && opt.value === currentStatus ? "Đang cập nhật..." : opt.label}
        </option>
      ))}
    </select>
  );
}
