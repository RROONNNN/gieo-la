import { apiClient } from "./client";
import { ENDPOINTS, BASE_URL } from "./endpoints";
import type { Application, MonthlyLimitInfo } from "@/types/application";

export async function fetchApplications(
  postId: string,
  options: RequestInit = {},
): Promise<Application[]> {
  const url = `${BASE_URL}${ENDPOINTS.APPLICATIONS.LIST(postId)}`;
  const res = await fetch(url, { ...options, cache: "no-store" });
  const json = await res.json();

  if (!res.ok) throw new Error(json.message || "Không tải được danh sách đăng ký");

  return json.data.applications as Application[];
}

export function applyForPost(postId: string, message: string) {
  return apiClient.post<{ application: Application }>(
    ENDPOINTS.APPLICATIONS.APPLY(postId),
    { message },
  );
}

export function selectApplicant(postId: string, applicantId: string) {
  return apiClient.post<{ post: unknown; selectedApplication: Application }>(
    ENDPOINTS.APPLICATIONS.SELECT(postId),
    { applicantId },
  );
}

export function getMyLimit() {
  return apiClient.get<MonthlyLimitInfo>(ENDPOINTS.APPLICATIONS.MY_LIMIT);
}
