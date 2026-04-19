import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { VerificationRequest } from "@/types/verification";

interface VerificationStatusCardProps {
  latestRequest: VerificationRequest | null;
  isAlreadyVerified?: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function VerificationStatusCard({
  latestRequest,
  isAlreadyVerified,
}: VerificationStatusCardProps) {
  // Account is verified (role already updated) — show regardless of latestRequest
  if (isAlreadyVerified) {
    return (
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="success">✓ Tài khoản đã được xác minh</Badge>
        </div>
        <p className="text-sm text-foreground">
          Tài khoản của bạn đã được cấp quyền xác minh. Huy hiệu xác thực đang hiển thị trên trang hồ sơ của bạn.
        </p>
      </Card>
    );
  }

  if (!latestRequest) {
    return (
      <Card className="mb-6">
        <p className="text-sm text-muted-foreground">
          Bạn chưa có yêu cầu xác minh nào.{" "}
          <a href="#verify-form" className="text-blue-600 hover:underline">
            Nộp đơn xác minh
          </a>{" "}
          để được xét duyệt.
        </p>
      </Card>
    );
  }

  if (latestRequest.status === "pending") {
    const docLabels = [
      ...new Set(
        latestRequest.documents
          .map((d) => d.label)
          .filter((l): l is string => l !== null && l.trim() !== ""),
      ),
    ];

    return (
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="warning">⏳ Đang chờ duyệt</Badge>
          <span className="text-xs text-muted-foreground">
            Ngày nộp: {formatDate(latestRequest.createdAt)}
          </span>
        </div>
        {docLabels.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-foreground mb-1">Giấy tờ đã nộp:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
              {docLabels.map((label, i) => (
                <li key={i}>{label}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          Admin sẽ xem xét và phản hồi sớm nhất có thể.
        </p>
      </Card>
    );
  }

  if (latestRequest.status === "approved") {
    return (
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="success">✓ Đã xác minh</Badge>
          {latestRequest.reviewedAt && (
            <span className="text-xs text-muted-foreground">
              Ngày duyệt: {formatDate(latestRequest.reviewedAt)}
            </span>
          )}
        </div>
        <p className="text-sm text-foreground">
          Chúc mừng! Tài khoản của bạn đã được xác minh thành công.
          Huy hiệu xác thực đã xuất hiện trên trang hồ sơ của bạn.
        </p>
      </Card>
    );
  }

  // rejected
  return (
    <Card className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="danger">✗ Bị từ chối</Badge>
        {latestRequest.reviewedAt && (
          <span className="text-xs text-muted-foreground">
            Ngày xử lý: {formatDate(latestRequest.reviewedAt)}
          </span>
        )}
      </div>
      {latestRequest.rejectionReason && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 mb-3">
          <p className="text-sm font-medium text-red-800">Lý do từ chối:</p>
          <p className="text-sm text-red-700 mt-0.5">{latestRequest.rejectionReason}</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Bạn có thể nộp đơn mới bên dưới sau khi bổ sung đủ giấy tờ.
      </p>
    </Card>
  );
}
