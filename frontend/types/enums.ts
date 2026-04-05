// --- User domain enums ---

export const UserRole = {
  MEMBER: "member",
  NGO: "ngo",
  INDIVIDUAL: "individual",
  ADMIN: "admin",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AccountStatus = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BANNED: "banned",
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const VerificationStatus = {
  UNVERIFIED: "unverified",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;
export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const BadgeType = {
  NONE: "none",
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
} as const;
export type BadgeType = (typeof BadgeType)[keyof typeof BadgeType];

// --- Verification domain enums ---

export const VerificationRequestStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;
export type VerificationRequestStatus =
  (typeof VerificationRequestStatus)[keyof typeof VerificationRequestStatus];

export const VerificationRequestType = {
  NGO: "ngo",
  INDIVIDUAL: "individual",
} as const;
export type VerificationRequestType =
  (typeof VerificationRequestType)[keyof typeof VerificationRequestType];

// --- Post / item domain enums ---

export const PostCategory = {
  DO_NAM: "do_nam",
  DO_NU: "do_nu",
  DO_TRE_EM: "do_tre_em",
  PHU_KIEN: "phu_kien",
} as const;
export type PostCategory = (typeof PostCategory)[keyof typeof PostCategory];

// --- Audit domain enums ---

export const AuditTargetType = {
  USER: "User",
  POST: "Post",
  VERIFICATION_REQUEST: "VerificationRequest",
  AUDIT_LOG: "AuditLog",
  SYSTEM: "System",
} as const;
export type AuditTargetType =
  (typeof AuditTargetType)[keyof typeof AuditTargetType];
