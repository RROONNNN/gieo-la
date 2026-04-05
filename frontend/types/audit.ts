import type { AuditTargetType } from "./enums";

export type AuditAction =
  | "user.ban"
  | "user.unban"
  | "user.suspend"
  | "user.unsuspend"
  | "user.role_change"
  | "verification.approve"
  | "verification.reject"
  | "ngo.badge_grant"
  | "ngo.badge_revoke"
  | "post.delete"
  | "post.pin"
  | "post.unpin"
  | "post.status_change"
  | string; // allow future actions without breaking types

export interface AuditLog {
  _id: string;
  actorId: string | null;
  targetType: AuditTargetType;
  targetId: string | null;
  action: AuditAction;
  metadata: Record<string, unknown>;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}
