const API_BASE = "/api/v1";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER_MEMBER: `${API_BASE}/auth/register/member`,
    REGISTER_NGO: `${API_BASE}/auth/register/ngo`,
    REGISTER_INDIVIDUAL: `${API_BASE}/auth/register/individual`,
    ME: `${API_BASE}/auth/me`,
  },
  VERIFICATION: {
    REQUEST: `${API_BASE}/verification-requests`,
    LIST: `${API_BASE}/verification-requests`,
  },
  HEALTH: `${API_BASE}/health`,
  USERS: {
    PROFILE: (id: string) => `${API_BASE}/users/${id}`,
  },
} as const;
export { BASE_URL };
