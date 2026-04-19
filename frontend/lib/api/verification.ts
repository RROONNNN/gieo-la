import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import {
  VerificationRequestStatus,
  VerificationRequestType,
} from "@/types/enums";
import type { VerificationDocument, VerificationRequest } from "@/types/verification";

export interface SubmitVerificationPayload {
  requestType: "individual" | "ngo";
  documents: VerificationDocument[];
  notes?: string;
}

export interface AdminListParams {
  requestType?: VerificationRequestType;
  status?: VerificationRequestStatus;
  page?: number;
  limit?: number;
}

export interface AdminListResponse {
  requests: VerificationRequest[];
  total: number;
  page: number;
  limit: number;
}

export async function getMyRequests(
  options?: RequestInit,
): Promise<VerificationRequest[]> {
  const res = await apiClient.get<{ requests: VerificationRequest[] }>(
    ENDPOINTS.VERIFICATION.MY_REQUESTS,
    options,
  );
  return res.data.requests;
}

export async function submitVerificationRequest(
  payload: SubmitVerificationPayload,
): Promise<VerificationRequest> {
  const res = await apiClient.post<{ request: VerificationRequest }>(
    ENDPOINTS.VERIFICATION.REQUEST,
    payload,
  );
  return res.data.request;
}

export async function adminListRequests(
  params: AdminListParams = {},
  options?: RequestInit,
): Promise<AdminListResponse> {
  const {
    requestType = VerificationRequestType.INDIVIDUAL,
    status = VerificationRequestStatus.PENDING,
    page = 1,
    limit = 20,
  } = params;
  const query = new URLSearchParams({
    requestType,
    status,
    page: String(page),
    limit: String(limit),
  });
  const res = await apiClient.get<AdminListResponse>(
    `${ENDPOINTS.VERIFICATION.ADMIN_LIST}?${query}`,
    options,
  );
  return res.data;
}

export async function adminGetRequest(
  requestId: string,
  options?: RequestInit,
): Promise<VerificationRequest> {
  const res = await apiClient.get<{ request: VerificationRequest }>(
    `${ENDPOINTS.VERIFICATION.ADMIN_LIST}/${requestId}`,
    options,
  );
  return res.data.request;
}

export async function adminApprove(requestId: string): Promise<VerificationRequest> {
  const res = await apiClient.patch<{ request: VerificationRequest }>(
    ENDPOINTS.VERIFICATION.ADMIN_APPROVE(requestId),
  );
  return res.data.request;
}

export async function adminReject(
  requestId: string,
  rejectionReason: string,
): Promise<VerificationRequest> {
  const res = await apiClient.patch<{ request: VerificationRequest }>(
    ENDPOINTS.VERIFICATION.ADMIN_REJECT(requestId),
    { rejectionReason },
  );
  return res.data.request;
}
