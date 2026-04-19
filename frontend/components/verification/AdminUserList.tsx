"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UserRole, VerificationStatus } from "@/types/enums";
import type { AdminUserSummary } from "@/lib/api/admin";

interface Props {
  users: AdminUserSummary[];
  total: number;
  page: number;
  limit: number;
  currentRole: string;
}

const ROLE_TABS: Array<{ label: string; value: string }> = [
  { label: "Tất cả", value: "" },
  { label: "Member", value: UserRole.MEMBER },
  { label: "Individual", value: UserRole.INDIVIDUAL },
  { label: "NGO", value: UserRole.NGO },
  { label: "Admin", value: UserRole.ADMIN },
];

const VERIFICATION_LABEL: Record<string, string> = {
  [VerificationStatus.UNVERIFIED]: "Chưa xác minh",
  [VerificationStatus.PENDING]: "Đang chờ",
  [VerificationStatus.VERIFIED]: "Đã xác minh",
  [VerificationStatus.REJECTED]: "Từ chối",
};

const ROLE_LABEL: Record<string, string> = {
  [UserRole.MEMBER]: "Member",
  [UserRole.NGO]: "NGO",
  [UserRole.INDIVIDUAL]: "Individual",
  [UserRole.ADMIN]: "Admin",
};

export function AdminUserList({ users, total, page, limit, currentRole }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  function navigate(params: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Role filter tabs */}
      <div className="flex flex-wrap gap-2">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => navigate({ role: tab.value, page: "1" })}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              currentRole === tab.value
                ? "bg-primary-600 text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* User table */}
      {users.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Không có người dùng phù hợp.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-foreground">Tên</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Xác minh</th>
                <th className="px-4 py-3 text-left font-medium text-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user._id} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {user.name}
                    {user.ngoProfile?.organizationName && (
                      <div className="text-xs text-muted-foreground">{user.ngoProfile.organizationName}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge>{ROLE_LABEL[user.role] ?? user.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        user.verificationStatus === VerificationStatus.VERIFIED
                          ? "success"
                          : user.verificationStatus === VerificationStatus.PENDING
                          ? "warning"
                          : "default"
                      }
                    >
                      {VERIFICATION_LABEL[user.verificationStatus] ?? user.verificationStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/users/${user._id}`}>
                      <Button size="sm" variant="outline">
                        Xem
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total} người dùng
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => navigate({ page: String(page - 1) })}
            >
              Trước
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => navigate({ page: String(page + 1) })}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
