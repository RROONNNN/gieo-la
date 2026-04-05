import type { VerificationRequestStatus, VerificationRequestType } from "./enums";
import type { UserRef } from "./user";

export interface VerificationDocument {
  url: string;
  label: string | null;
}

export interface VerificationRequest {
  _id: string;
  userId: string | UserRef;
  requestType: VerificationRequestType;
  documents: VerificationDocument[];
  notes: string | null;
  status: VerificationRequestStatus;
  reviewedBy: string | UserRef | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}
