import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { VerificationActions } from "@/components/admin/VerificationActions";
import { adminGetRequestServer } from "@/lib/api/verification.server";
import { formatDateTimeVN } from "@/lib/utils";
import type { UserRef } from "@/types/user";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_VARIANT: Record<string, string> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export default async function AdminVerificationDetailPage({ params }: PageProps) {
  const { id } = await params;

  let req;
  try {
    req = await adminGetRequestServer(id);
  } catch {
    notFound();
  }

  const user = typeof req.userId === "string" ? null : (req.userId as UserRef);

  return (
    <div className="p-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/verifications" className="hover:text-brand-dark">
          Xác thực
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-brand-darker">Chi tiết yêu cầu</span>
      </nav>

      <h1 className="mb-6 font-heading text-2xl font-semibold text-brand-darker">
        Yêu cầu xác thực
      </h1>

      {/* User info */}
      <div className="mb-6 rounded-[15px] border border-[var(--border-green)] bg-white p-5 space-y-2">
        <h2 className="font-medium text-brand-darker mb-3">Thông tin người dùng</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Tên:</span>{" "}
            <span className="font-medium text-brand-darker">
              {user?.name ?? "N/A"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Vai trò:</span>{" "}
            <span className="font-medium text-brand-darker">
              {user?.role ?? "N/A"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Loại yêu cầu:</span>{" "}
            <Badge variant="default">
              {req.requestType === "individual" ? "Cá nhân" : "NGO"}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Trạng thái:</span>{" "}
            <Badge variant={(STATUS_VARIANT[req.status] as any) ?? "default"}>
              {STATUS_LABEL[req.status] ?? req.status}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Ngày gửi:</span>{" "}
            <span>{formatDateTimeVN(req.createdAt)}</span>
          </div>
          {req.reviewedAt && (
            <div>
              <span className="text-muted-foreground">Ngày xử lý:</span>{" "}
              <span>{formatDateTimeVN(req.reviewedAt)}</span>
            </div>
          )}
        </div>

        {req.notes && (
          <div className="mt-3 border-t border-[var(--border-green)] pt-3">
            <p className="text-sm text-muted-foreground">Ghi chú của người dùng:</p>
            <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
              {req.notes}
            </p>
          </div>
        )}

        {req.rejectionReason && (
          <div className="mt-3 border-t border-[var(--border-green)] pt-3">
            <p className="text-sm text-red-600">Lý do từ chối:</p>
            <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
              {req.rejectionReason}
            </p>
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="mb-6 rounded-[15px] border border-[var(--border-green)] bg-white p-5">
        <h2 className="mb-3 font-medium text-brand-darker">
          Tài liệu ({req.documents.length})
        </h2>
        {req.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có tài liệu</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {req.documents.map((doc, i) => (
              <a
                key={i}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-lg border border-[var(--border-green)] hover:border-brand-dark transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={doc.url}
                  alt={doc.label ?? `Tài liệu ${i + 1}`}
                  className="h-32 w-full object-cover group-hover:opacity-90 transition-opacity"
                />
                {doc.label && (
                  <p className="px-2 py-1 text-xs text-muted-foreground truncate">
                    {doc.label}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="rounded-[15px] border border-[var(--border-green)] bg-white p-5">
        <h2 className="mb-3 font-medium text-brand-darker">Hành động</h2>
        <VerificationActions requestId={req._id} currentStatus={req.status} />
      </div>
    </div>
  );
}
