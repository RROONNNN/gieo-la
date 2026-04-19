import { apiClient } from "./client";
import type { UserRole, VerificationStatus } from "@/types/enums";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUserSummary {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  accountStatus: string;
  ngoProfile: { organizationName: string | null } | null;
}

interface BadgeActionResponse {
  user: {
    _id: string;
    name: string;
    role: string;
    verificationStatus: string;
  };
}

// ─── NGO badge ────────────────────────────────────────────────────────────────

export function grantNgoBadge(userId: string, reason?: string) {
  return apiClient.patch<BadgeActionResponse>(
    `/api/v1/admin/users/${userId}/ngo-status`,
    { action: "grant", reason },
  );
}

export function revokeNgoBadge(userId: string, reason?: string) {
  return apiClient.patch<BadgeActionResponse>(
    `/api/v1/admin/users/${userId}/ngo-status`,
    { action: "revoke", reason },
  );
}

// ─── Individual badge ────────────────────────────────────────────────────────

export function revokeIndividualBadge(userId: string, reason?: string) {
  return apiClient.patch<BadgeActionResponse>(
    `/api/v1/admin/users/${userId}/individual-status`,
    { action: "revoke", reason },
  );
}
