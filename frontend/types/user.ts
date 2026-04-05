import type {
  UserRole,
  AccountStatus,
  VerificationStatus,
  BadgeType,
} from "./enums";

export interface UserContact {
  phone: string | null;
}

export interface UserLocation {
  city: string | null;
  district: string | null;
}

export interface NgoProfile {
  organizationName: string | null;
  description: string | null;
  website: string | null;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  verificationStatus: VerificationStatus;
  avatar: string | null;
  contact: UserContact;
  location: UserLocation;
  ngoProfile: NgoProfile | null;
  badge: BadgeType;
  completedDonations: number;
  receivedItemsThisMonth: number;
  receivedItemsResetAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Public-facing user shape — no sensitive fields */
export type SafeUser = Omit<User, "receivedItemsThisMonth" | "receivedItemsResetAt">;

/** Minimal user reference used in populated fields */
export interface UserRef {
  _id: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  badge: BadgeType;
}
