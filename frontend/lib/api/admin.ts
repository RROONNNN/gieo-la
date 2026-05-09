import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { UserRole, VerificationStatus } from "@/types/enums";
import type { Post } from "@/types/post";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUserSummary {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  accountStatus: string;
  ngoProfile: { website: string | null; description: string | null } | null;
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

// ─── Account status ───────────────────────────────────────────────────────────

export function updateAccountStatus(userId: string, status: string) {
  return apiClient.patch<{ user: AdminUserSummary }>(
    `/api/v1/admin/users/${userId}/account-status`,
    { status },
  );
}
export function grantIndividualBadge(userId: string, reason?: string) {
  return apiClient.patch<BadgeActionResponse>(
    `/api/v1/admin/users/${userId}/individual-status`,
    { action: "grant", reason },
  );
}

// ─── Admin post status ────────────────────────────────────────────────────────

export function adminUpdatePostStatus(postId: string, status: string) {
  return apiClient.patch<{ post: Post }>(
    ENDPOINTS.ADMIN_POSTS.UPDATE_STATUS(postId),
    { status },
  );
}
