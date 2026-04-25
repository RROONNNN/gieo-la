import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { adminListRequestsServer } from "@/lib/api/verification.server";
import { formatDateVN } from "@/lib/utils";
import type { VerificationRequestStatus, VerificationRequestType } from "@/types/enums";
import type { UserRef } from "@/types/user";

interface PageProps {
  searchParams: Promise<{
    type?: string;
    status?: string;
    page?: string;
  }>;
}

const TYPE_TABS = [
  { label: "Cá nhân – Chờ", type: "individual", status: "pending" },
  { label: "NGO – Chờ", type: "ngo", status: "pending" },
  { label: "Đã duyệt", type: "", status: "approved" },
  { label: "Đã từ chối", type: "", status: "rejected" },
];

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

const TYPE_LABEL: Record<string, string> = {
  individual: "Cá nhân",
  ngo: "NGO",
};

export default async function AdminVerificationsPage({ searchParams }: PageProps) {
  const { type = "individual", status = "pending", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10));

  let result;
  try {
    result = await adminListRequestsServer(
      {
        requestType: type as VerificationRequestType || undefined,
        status: status as VerificationRequestStatus || undefined,
        page: currentPage,
        limit: 20,
      },
    );
  } catch {
    result = { requests: [], total: 0, page: 1, limit: 20 };
  }

  const buildHref = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    if (params.type) sp.set("type", params.type);
    if (params.status) sp.set("status", params.status);
    if (params.page && params.page !== "1") sp.set("page", params.page);
    return `/admin/verifications${sp.size > 0 ? `?${sp}` : ""}`;
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-brand-darker">
        Quản lý xác thực
      </h1>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TYPE_TABS.map((tab) => {
          const isActive = type === tab.type && status === tab.status;
          return (
            <Link
              key={`${tab.type}-${tab.status}`}
              href={buildHref({ type: tab.type, status: tab.status, page: "1" })}
              className={[
                "rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
                isActive
                  ? "bg-brand-dark text-white border-brand-dark"
                  : "border-[var(--border-green)] text-brand-darker hover:bg-brand-light",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-3">
        {result.requests.length === 0 ? (
          <p className="rounded-[15px] border border-[var(--border-green)] bg-white px-6 py-10 text-center text-muted-foreground">
            Không có yêu cầu nào.
          </p>
        ) : (
          result.requests.map((req) => {
            const user = typeof req.userId === "string" ? null : (req.userId as UserRef);
            return (
              <Link
                key={req._id}
                href={`/admin/verifications/${req._id}`}
                className="flex items-center justify-between gap-4 rounded-[15px] border border-[var(--border-green)] bg-white px-5 py-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-brand-darker">
                    {user?.name ?? "Người dùng"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateVN(req.createdAt)} &middot; {req.documents.length} tài liệu
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">
                    {TYPE_LABEL[req.requestType] ?? req.requestType}
                  </Badge>
                  <Badge variant={(STATUS_VARIANT[req.status] as any) ?? "default"}>
                    {STATUS_LABEL[req.status] ?? req.status}
                  </Badge>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {Math.ceil(result.total / result.limit) > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from(
            { length: Math.ceil(result.total / result.limit) },
            (_, i) => i + 1,
          ).map((p) => (
            <Link
              key={p}
              href={buildHref({ type, status, page: String(p) })}
              className={[
                "flex size-8 items-center justify-center rounded-full text-sm border transition-colors",
                p === currentPage
                  ? "bg-brand-dark text-white border-brand-dark"
                  : "border-[var(--border-green)] text-brand-darker hover:bg-brand-light",
              ].join(" ")}
            >
              {p}
            </Link>
          ))}
        </div>
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {result.total} yêu cầu
      </p>
    </div>
  );
}
