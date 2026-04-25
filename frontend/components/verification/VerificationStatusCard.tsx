import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import type { VerificationRequest } from "@/types/verification";
import { formatDateVN } from "@/lib/utils";

interface VerificationStatusCardProps {
  latestRequest: VerificationRequest | null;
  isAlreadyVerified: boolean;
}

export function VerificationStatusCard({
  latestRequest,
  isAlreadyVerified,
}: VerificationStatusCardProps) {
  if (isAlreadyVerified) {
    return (
      <div className="mb-6 flex items-start gap-4 rounded-[15px] border border-green-200 bg-green-50 p-5">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
        <div>
          <p className="font-medium text-green-800">Tài khoản đã được xác thực</p>
          <p className="mt-1 text-sm text-green-700">
            Bạn đã được xác thực và có thể sử dụng đầy đủ các tính năng.
          </p>
        </div>
      </div>
    );
  }

  if (!latestRequest) {
    return (
      <div className="mb-6 flex items-start gap-4 rounded-[15px] border border-[var(--border-green)] bg-white p-5">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium text-brand-darker">Chưa có yêu cầu xác thực</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Gửi yêu cầu bên dưới để được xác thực tài khoản.
          </p>
        </div>
      </div>
    );
  }

  const statusMap = {
    pending: {
      icon: <Clock className="mt-0.5 size-5 shrink-0 text-amber-600" />,
      bg: "border-amber-200 bg-amber-50",
      title: "Đang chờ xét duyệt",
      titleColor: "text-amber-800",
      desc: `Yêu cầu gửi ngày ${formatDateVN(latestRequest.createdAt)} đang được xem xét.`,
      descColor: "text-amber-700",
    },
    approved: {
      icon: <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />,
      bg: "border-green-200 bg-green-50",
      title: "Yêu cầu được chấp thuận",
      titleColor: "text-green-800",
      desc: "Tài khoản của bạn đã được xác thực thành công.",
      descColor: "text-green-700",
    },
    rejected: {
      icon: <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />,
      bg: "border-red-200 bg-red-50",
      title: "Yêu cầu bị từ chối",
      titleColor: "text-red-800",
      desc: latestRequest.rejectionReason || "Yêu cầu của bạn không được chấp thuận.",
      descColor: "text-red-700",
    },
  };

  const cfg = statusMap[latestRequest.status] ?? statusMap.pending;

  return (
    <div className={`mb-6 flex items-start gap-4 rounded-[15px] border p-5 ${cfg.bg}`}>
      {cfg.icon}
      <div>
        <p className={`font-medium ${cfg.titleColor}`}>{cfg.title}</p>
        <p className={`mt-1 text-sm ${cfg.descColor}`}>{cfg.desc}</p>
      </div>
    </div>
  );
}
