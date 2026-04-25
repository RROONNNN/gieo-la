/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  updateAccountStatus,
  grantNgoBadge,
  revokeNgoBadge,
  revokeIndividualBadge,
  grantIndividualBadge,
} from "@/lib/api/admin";
import type { UserRole } from "@/types/enums";

interface AdminUserActionsProps {
  userId: string;
  role: UserRole;
  verificationStatus: string;
  accountStatus: string;
}

export function AdminUserActions({
  userId,
  role,
  verificationStatus,
  accountStatus,
}: AdminUserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setLoading(key);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(null);
    }
  };

  const isActive = accountStatus === "active";
  const isSuspended = accountStatus === "suspended";
  const isBanned = accountStatus === "banned";

  return (
    <div className="flex flex-wrap gap-1">
      {/* Account status */}
      {isActive && (
        <Button
          size="sm"
          variant="outline"
          className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          disabled={loading === "suspend"}
          onClick={() => run("suspend", () => updateAccountStatus(userId, "suspended"))}
        >
          {loading === "suspend" ? "..." : "Tạm khóa"}
        </Button>
      )}
      {isActive && (
        <Button
          size="sm"
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
          disabled={loading === "ban"}
          onClick={() => run("ban", () => updateAccountStatus(userId, "banned"))}
        >
          {loading === "ban" ? "..." : "Cấm"}
        </Button>
      )}
      {(isSuspended || isBanned) && (
        <Button
          size="sm"
          variant="outline"
          className="border-green-300 text-green-700 hover:bg-green-50"
          disabled={loading === "activate"}
          onClick={() => run("activate", () => updateAccountStatus(userId, "active"))}
        >
          {loading === "activate" ? "..." : "Kích hoạt"}
        </Button>
      )}

      {/* NGO badge */}
      {role === "ngo" && verificationStatus !== "ngo_verified" && (
        <Button
          size="sm"
          variant="outline"
          disabled={loading === "grant_ngo"}
          onClick={() => run("grant_ngo", () => grantNgoBadge(userId))}
        >
          {loading === "grant_ngo" ? "..." : "Cấp NGO"}
        </Button>
      )}
      {(role === "ngo" && verificationStatus === "ngo_verified") && (
        <Button
          size="sm"
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
          disabled={loading === "revoke_ngo"}
          onClick={() => run("revoke_ngo", () => revokeNgoBadge(userId))}
        >
          {loading === "revoke_ngo" ? "..." : "Thu hồi NGO"}
        </Button>
      )}

      {/* Individual badge */}
      {role === "individual" && verificationStatus === "individual_verified" && (
        <Button
          size="sm"
          variant="outline"
          className="border-orange-300 text-orange-700 hover:bg-orange-50"
          disabled={loading === "revoke_ind"}
          onClick={() => run("revoke_ind", () => revokeIndividualBadge(userId))}
        >
          {loading === "revoke_ind" ? "..." : "Thu hồi Individual"}
        </Button>
      )}
      
        {role === "individual" && verificationStatus !== "individual_verified" && (
          <Button
            size="sm"
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
            disabled={loading === "grant_ind"}
            onClick={() => run("grant_ind", () => grantIndividualBadge(userId))}
          >
            {loading === "grant_ind" ? "..." : "Cấp Individual"}
          </Button>
        )}
    

      {error && <span className="text-xs text-red-600 self-center">{error}</span>}
    </div>
  );
}
