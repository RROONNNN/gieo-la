const API_BASE = "/api/v1";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER_MEMBER: `${API_BASE}/auth/register/member`,
    REGISTER_NGO: `${API_BASE}/auth/register/ngo`,
    REGISTER_INDIVIDUAL: `${API_BASE}/auth/register/individual`,
    ME: `${API_BASE}/auth/me`,
    REFRESH_TOKEN: `${API_BASE}/auth/refresh-token`,
  },
  VERIFICATION: {
    REQUEST: `${API_BASE}/verification-requests`,
    MY_REQUESTS: `${API_BASE}/verification-requests/me`,
    ADMIN_LIST: `${API_BASE}/admin/users/verification-requests`,
    ADMIN_APPROVE: (id: string) => `${API_BASE}/admin/users/verification-requests/${id}/approve`,
    ADMIN_REJECT: (id: string) => `${API_BASE}/admin/users/verification-requests/${id}/reject`,
  },
  UPLOAD: {
    IMAGE: `${API_BASE}/upload/image`,
  },
  POSTS: {
    LIST: `${API_BASE}/posts`,
    DETAIL: (id: string) => `${API_BASE}/posts/${id}`,
    CREATE: `${API_BASE}/posts`,
    UPDATE: (id: string) => `${API_BASE}/posts/${id}`,
    DELETE: (id: string) => `${API_BASE}/posts/${id}`,
    UPDATE_STATUS: (id: string) => `${API_BASE}/posts/${id}/status`,
  },
  APPLICATIONS: {
    LIST: (postId: string) => `${API_BASE}/applications/${postId}`,
    APPLY: (postId: string) => `${API_BASE}/applications/${postId}`,
    SELECT: (postId: string) => `${API_BASE}/applications/${postId}/select`,
    MY_LIMIT: `${API_BASE}/applications/my-limit`,
  },
  ADMIN_POSTS: {
    LIST: `${API_BASE}/admin/posts`,
    COMPLETE: (id: string) => `${API_BASE}/admin/posts/${id}/complete`,
    PIN: (id: string) => `${API_BASE}/admin/posts/${id}/pin`,
    DELETE: (id: string) => `${API_BASE}/admin/posts/${id}`,
  },
  HEALTH: `${API_BASE}/health`,
  USERS: {
    PROFILE: (id: string) => `${API_BASE}/users/${id}`,
  },
} as const;
export { BASE_URL };
