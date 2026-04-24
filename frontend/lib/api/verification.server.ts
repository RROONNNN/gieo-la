import "server-only";

import { ENDPOINTS } from "./endpoints";
import { serverApiData } from "./serverRequest";
import type { VerificationRequest } from "@/types/verification";
import type { AdminListParams, AdminListResponse } from "./verification";

export async function getMyRequestsServer(
  options: RequestInit = {},
): Promise<VerificationRequest[]> {
  const data = await serverApiData<{ requests: VerificationRequest[] }>(
    ENDPOINTS.VERIFICATION.MY_REQUESTS,
    options,
  );
  return data.requests;
}

export async function adminListRequestsServer(
  params: AdminListParams = {},
  options: RequestInit = {},
): Promise<AdminListResponse> {
  const {
    requestType,
    status,
    page = 1,
    limit = 20,
  } = params;

  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (requestType) query.set("requestType", requestType);
  if (status) query.set("status", status);

  return serverApiData<AdminListResponse>(
    `${ENDPOINTS.VERIFICATION.ADMIN_LIST}?${query}`,
    options,
  );
}

export async function adminGetRequestServer(
  requestId: string,
  options: RequestInit = {},
): Promise<VerificationRequest> {
  const data = await serverApiData<{ request: VerificationRequest }>(
    `${ENDPOINTS.VERIFICATION.ADMIN_LIST}/${requestId}`,
    options,
  );
  return data.request;
}