/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { AdminUserActions } from "@/components/admin/AdminUserActions";
import { AdminUsersFilters } from "@/components/admin/AdminUsersFilters";
import { listAdminUsers } from "@/lib/api/adminUsers";
import type { UserRole } from "@/types/enums";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    role?: string;
    search?: string;
    verificationStatus?: string;
    accountStatus?: string;
    page?: string;
  }>;
}

const ROLE_VARIANT: Record<string, string> = {
  member: "role-member",
  ngo: "role-ngo",
  individual: "role-individual",
  admin: "default",
};

const ACCOUNT_STATUS_LABEL: Record<string, string> = {
  active: "Hoạt động",
  suspended: "Tạm khóa",
  banned: "Bị cấm",
};

const ACCOUNT_STATUS_VARIANT: Record<string, string> = {
  active: "success",
  suspended: "warning",
  banned: "error",
};

const VERIFICATION_STATUS_LABEL: Record<string, string> = {
  unverified: "Chưa xác thực",
  pending: "Đang chờ",
  verified: "Đã xác thực",
  rejected: "Bị từ chối",
  ngo_verified: "NGO",
  individual_verified: "Cá nhân",
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const limit = 20;

  let result;
  try {
    result = await listAdminUsers({
      role: params.role || undefined,
      search: params.search || undefined,
      verificationStatus: params.verificationStatus || undefined,
      accountStatus: params.accountStatus || undefined,
      page: currentPage,
      limit,
    });
  } catch {
    result = { users: [], total: 0, page: 1, limit };
  }

  const buildPageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (params.role) sp.set("role", params.role);
    if (params.search) sp.set("search", params.search);
    if (params.verificationStatus) sp.set("verificationStatus", params.verificationStatus);
    if (params.accountStatus) sp.set("accountStatus", params.accountStatus);
    if (p > 1) sp.set("page", String(p));
    return `/admin/users${sp.size > 0 ? `?${sp}` : ""}`;
  };

  const totalPages = Math.ceil(result.total / limit);

  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl font-semibold text-brand-darker">
        Quản lý người dùng
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{result.total} người dùng</p>

      {/* Filter bar + Table */}
      <div className="mt-6 overflow-hidden rounded-[15px] border border-[var(--border-green)] bg-white">
        <Suspense fallback={null}>
          <AdminUsersFilters />
        </Suspense>

        <table className="w-full text-sm">
          <thead className="border-b border-[var(--border-green)] bg-bg-cream">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-brand-darker">
                Người dùng
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-brand-darker md:table-cell">
                Vai trò
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-brand-darker lg:table-cell">
                Xác thực
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-brand-darker lg:table-cell">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-right font-medium text-brand-darker">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-green)]">
            {result.users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Không có người dùng nào.
                </td>
              </tr>
            ) : (
              result.users.map((u) => (
                <tr key={u._id} className="hover:bg-bg-cream/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={null} alt={u.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-brand-darker truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <Badge variant={(ROLE_VARIANT[u.role] as any) ?? "default"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <Badge variant="default">
                      {VERIFICATION_STATUS_LABEL[u.verificationStatus] ?? u.verificationStatus}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <Badge variant={(ACCOUNT_STATUS_VARIANT[u.accountStatus] as any) ?? "default"}>
                      {ACCOUNT_STATUS_LABEL[u.accountStatus] ?? u.accountStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <AdminUserActions
                        userId={u._id}
                        role={u.role as UserRole}
                        verificationStatus={u.verificationStatus}
                        accountStatus={u.accountStatus}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, result.total)} / {result.total}
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={buildPageHref(currentPage - 1)}
                className="rounded-lg border border-[var(--border-green)] bg-white px-3 py-1.5 hover:bg-bg-cream transition-colors"
              >
                Trước
              </Link>
            )}
            {currentPage * limit < result.total && (
              <Link
                href={buildPageHref(currentPage + 1)}
                className="rounded-lg border border-[var(--border-green)] bg-white px-3 py-1.5 hover:bg-bg-cream transition-colors"
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
