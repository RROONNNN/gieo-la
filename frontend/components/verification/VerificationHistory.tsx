import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { VerificationRequest } from "@/types/verification";

interface VerificationHistoryProps {
  requests: VerificationRequest[];
}

const statusLabel: Record<string, string> = {
  pending: "Đang chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
};

const statusVariant: Record<
  string,
  "warning" | "success" | "danger" | "default"
> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function VerificationHistory({ requests }: VerificationHistoryProps) {
  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Lịch sử đơn xác minh
      </h2>
      <div className="space-y-3">
        {requests.map((r) => {
          const docLabels = [
            ...new Set(
              r.documents
                .map((d) => d.label)
                .filter((l): l is string => l !== null && l.trim() !== ""),
            ),
          ];

          return (
            <Card key={r._id} className="text-sm">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <Badge variant={statusVariant[r.status] ?? "default"}>
                  {statusLabel[r.status] ?? r.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Ngày nộp: {formatDate(r.createdAt)}
                </span>
              </div>

              {docLabels.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Giấy tờ: {docLabels.join(", ")}
                </p>
              )}

              {r.status === "rejected" && r.rejectionReason && (
                <p className="mt-1.5 text-xs text-red-600">
                  Lý do từ chối: {r.rejectionReason}
                </p>
              )}

              {r.status === "approved" && r.reviewedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Ngày duyệt: {formatDate(r.reviewedAt)}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
