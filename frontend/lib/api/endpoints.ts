export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  VERIFICATION: {
    REQUEST: "/api/verification/request",
    LIST: "/api/verification",
  },
  HEALTH: "/api/health",
} as const;
