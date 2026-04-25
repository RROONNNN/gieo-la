import { formatDateVN } from "@/lib/utils";
import type { VerificationRequest } from "@/types/verification";

interface VerificationHistoryProps {
  requests: VerificationRequest[];
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export function VerificationHistory({ requests }: VerificationHistoryProps) {
  if (requests.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-4 font-heading text-lg font-semibold text-brand-darker">
        Lịch sử yêu cầu
      </h2>
      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req._id}
            className="flex items-center justify-between rounded-[15px] border border-[var(--border-green)] bg-white px-5 py-4"
          >
            <div>
              <p className="text-sm font-medium text-brand-darker">
                {req.requestType === "ngo" ? "Tổ chức NGO" : "Cá nhân hoàn cảnh"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDateVN(req.createdAt)}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                STATUS_COLOR[req.status] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {STATUS_LABEL[req.status] ?? req.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
