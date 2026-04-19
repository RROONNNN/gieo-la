"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { adminApprove } from "@/lib/api/verification";

interface ApproveButtonProps {
  requestId: string;
}

export default function ApproveButton({ requestId }: ApproveButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setLoading(true);
    setError(null);
    try {
      await adminApprove(requestId);
      router.push("/admin/verifications");
    } catch {
      setError("Không thể phê duyệt. Vui lòng thử lại.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="primary"
        onClick={handleApprove}
        loading={loading}
        disabled={loading}
      >
        Phê duyệt
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
