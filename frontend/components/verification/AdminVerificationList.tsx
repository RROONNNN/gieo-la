import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { VerificationRequest } from "@/types/verification";
import type { UserRef } from "@/types/user";

interface AdminVerificationListProps {
  requests: VerificationRequest[];
  total: number;
  page: number;
  limit: number;
  currentType?: string;
}

function getUserName(userId: string | UserRef): string {
  if (typeof userId === "string") return "—";
  return userId.name;
}

function getUserEmail(userId: string | UserRef): string {
  if (typeof userId === "string") return "—";
  return (userId as { _id: string; name: string; avatar: string | null; email?: string }).email ?? "—";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export default function AdminVerificationList({
  requests,
  total,
  page,
  limit,
  currentType = "individual",
}: AdminVerificationListProps) {
  const totalPages = Math.ceil(total / limit);

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background p-8 text-center text-muted-foreground">
        Không có đơn nào đang chờ duyệt.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Tên người nộp</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Loại</th>
              <th className="px-4 py-3 text-left font-medium">Ngày nộp</th>
              <th className="px-4 py-3 text-left font-medium">Số loại giấy tờ</th>
              <th className="px-4 py-3 text-left font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.map((r) => {
              const uniqueLabels = new Set(r.documents.map((d) => d.label)).size;
              return (
                <tr key={r._id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">{getUserName(r.userId)}</td>
                  <td className="px-4 py-3">{getUserEmail(r.userId)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.requestType === "ngo" ? "info" : "warning"}>
                      {r.requestType === "ngo" ? "NGO" : "Cá nhân"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">{uniqueLabels}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/verifications/${r._id}?from=${currentType}`}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {page} / {totalPages} — Tổng {total} đơn
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`?page=${page - 1}&type=${currentType}`}
                className="rounded-md border border-border px-3 py-1 text-sm hover:bg-muted"
              >
                Trước
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`?page=${page + 1}&type=${currentType}`}
                className="rounded-md border border-border px-3 py-1 text-sm hover:bg-muted"
              >
                Sau
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
