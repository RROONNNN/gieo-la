import type { VerificationRequest } from "@/types/verification";
import type { UserRef } from "@/types/user";
import DocumentGallery from "./DocumentGallery";
import ApproveButton from "./ApproveButton";
import RejectForm from "./RejectForm";

interface AdminVerificationDetailProps {
  request: VerificationRequest;
}

function resolveUserRef(userId: string | UserRef): UserRef | null {
  if (typeof userId === "string") return null;
  return userId;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("vi-VN");
}

export default function AdminVerificationDetail({
  request,
}: AdminVerificationDetailProps) {
  const user = resolveUserRef(request.userId);

  return (
    <div className="space-y-8">
      {/* Thông tin người nộp */}
      <section className="rounded-lg border border-border bg-background p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Thông tin người nộp
        </h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Họ tên</dt>
            <dd className="font-medium text-foreground">{user?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium text-foreground">
              {(user as { _id: string; name: string; avatar: string | null; email?: string } | null)?.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Ngày nộp đơn</dt>
            <dd className="font-medium text-foreground">
              {formatDate(request.createdAt)}
            </dd>
          </div>
          {request.notes && (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Ghi chú</dt>
              <dd className="font-medium text-foreground">{request.notes}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Giấy tờ minh chứng */}
      <section className="rounded-lg border border-border bg-background p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Giấy tờ minh chứng
        </h2>
        <DocumentGallery documents={request.documents} />
      </section>

      {/* Thao tác */}
      <section className="rounded-lg border border-border bg-background p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">
          Quyết định
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">
              Phê duyệt đơn
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Người dùng sẽ được cấp huy hiệu &quot;Cá nhân đã xác minh&quot;.
            </p>
            <ApproveButton requestId={request._id} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">
              Từ chối đơn
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Người dùng sẽ thấy lý do và có thể nộp lại đơn mới.
            </p>
            <RejectForm requestId={request._id} />
          </div>
        </div>
      </section>
    </div>
  );
}
