"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { AdminBadgeGrantRevoke } from "@/components/verification/AdminBadgeGrantRevoke";
import { UserRole, VerificationStatus } from "@/types/enums";
import type { AdminUserSummary } from "@/lib/api/admin";

interface Props {
  initialUser: AdminUserSummary;
}

const ROLE_LABEL: Record<string, string> = {
  [UserRole.MEMBER]: "Member",
  [UserRole.NGO]: "NGO",
  [UserRole.INDIVIDUAL]: "Individual",
  [UserRole.ADMIN]: "Admin",
};

const VERIFICATION_LABEL: Record<string, string> = {
  [VerificationStatus.UNVERIFIED]: "Chưa xác minh",
  [VerificationStatus.PENDING]: "Đang chờ duyệt",
  [VerificationStatus.VERIFIED]: "Đã xác minh",
  [VerificationStatus.REJECTED]: "Bị từ chối",
};

export function AdminUserDetailClient({ initialUser }: Props) {
  const [user, setUser] = useState(initialUser);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <Link
          href="/admin/users"
          className="text-sm text-primary-600 hover:underline"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.ngoProfile?.organizationName && (
            <p className="text-sm text-muted-foreground mt-1">
              Tổ chức: {user.ngoProfile.organizationName}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge>{ROLE_LABEL[user.role] ?? user.role}</Badge>
          <Badge variant={user.verificationStatus === VerificationStatus.VERIFIED ? "success" : "default"}>
            {VERIFICATION_LABEL[user.verificationStatus] ?? user.verificationStatus}
          </Badge>
        </div>

        <hr className="border-border" />

        {user.role === UserRole.ADMIN ? (
          <p className="text-sm text-muted-foreground">
            Không thể thay đổi quyền của tài khoản Admin.
          </p>
        ) : user.role === UserRole.MEMBER ? null : (
          <AdminBadgeGrantRevoke
            user={user}
            onSuccess={(updated) => setUser((prev) => ({ ...prev, ...updated } as AdminUserSummary))}
          />
        )}
      </div>
    </div>
  );
}
