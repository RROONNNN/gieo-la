import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { SafeUser } from "@/types/user";
import type { ApiResponse } from "@/types/api";

export interface AuthResponseData {
  user: SafeUser;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterMemberPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterNgoPayload {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  website?: string;
  description?: string;
}

export interface RegisterIndividualPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  avatar?: string | null;
  contact?: { phone?: string | null };
  location?: { city?: string | null; district?: string | null };
}

export function loginApi(
  payload: LoginPayload,
): Promise<ApiResponse<AuthResponseData>> {
  return apiClient.post<AuthResponseData>(ENDPOINTS.AUTH.LOGIN, payload);
}

export function registerMemberApi(
  payload: RegisterMemberPayload,
): Promise<ApiResponse<AuthResponseData>> {
  return apiClient.post<AuthResponseData>(
    ENDPOINTS.AUTH.REGISTER_MEMBER,
    payload,
  );
}

export function registerNgoApi(
  payload: RegisterNgoPayload,
): Promise<ApiResponse<AuthResponseData>> {
  return apiClient.post<AuthResponseData>(
    ENDPOINTS.AUTH.REGISTER_NGO,
    payload,
  );
}

export function registerIndividualApi(
  payload: RegisterIndividualPayload,
): Promise<ApiResponse<AuthResponseData>> {
  return apiClient.post<AuthResponseData>(
    ENDPOINTS.AUTH.REGISTER_INDIVIDUAL,
    payload,
  );
}

export function getMeApi(): Promise<ApiResponse<{ user: SafeUser }>> {
  return apiClient.get<{ user: SafeUser }>(ENDPOINTS.AUTH.ME);
}

export function refreshTokenApi(): Promise<ApiResponse<AuthResponseData>> {
  return apiClient.post<AuthResponseData>(ENDPOINTS.AUTH.REFRESH_TOKEN);
}

export function updateProfileApi(
  payload: UpdateProfilePayload,
): Promise<ApiResponse<{ user: SafeUser }>> {
  return apiClient.patch<{ user: SafeUser }>(ENDPOINTS.AUTH.ME, payload);
}

export function logoutApi(): Promise<ApiResponse<void>> {
  return apiClient.post<void>(ENDPOINTS.AUTH.LOGOUT);
}
