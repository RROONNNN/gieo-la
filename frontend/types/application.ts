import type { ApplicationStatus } from "./enums";
import type { UserRef } from "./user";

export interface Application {
  _id: string;
  post: string;
  applicant: UserRef;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyLimitInfo {
  canApply: boolean;
  used: number;
  limit: number;
  message?: string;
}
