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
    LOGOUT: `${API_BASE}/auth/logout`,
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
    FILE: `${API_BASE}/upload/file`,
    NEWS_CONTENT_IMAGE: `${API_BASE}/upload/news-content-image`,
  },
  POSTS: {
    LIST: `${API_BASE}/posts`,
    DETAIL: (id: string) => `${API_BASE}/posts/${id}`,
    CREATE: `${API_BASE}/posts`,
    UPDATE: (id: string) => `${API_BASE}/posts/${id}`,
    DELETE: (id: string) => `${API_BASE}/posts/${id}`,
    UPDATE_STATUS: (id: string) => `${API_BASE}/posts/${id}/status`,
    LIKE: (id: string) => `${API_BASE}/posts/${id}/like`,
  },
  LEADERBOARD: {
    WEEKLY: `${API_BASE}/leaderboard`,
  },
  WISHLIST: {
    LIST: `${API_BASE}/wishlist`,
    DETAIL: (id: string) => `${API_BASE}/wishlist/${id}`,
    CREATE: `${API_BASE}/wishlist`,
    DELETE: (id: string) => `${API_BASE}/wishlist/${id}`,
    LIKE: (id: string) => `${API_BASE}/wishlist/${id}/like`,
    UPDATE_STATUS: (id: string) => `${API_BASE}/wishlist/${id}/status`,
  },
  APPLICATIONS: {
    LIST: (postId: string) => `${API_BASE}/applications/${postId}`,
    APPLY: (postId: string) => `${API_BASE}/applications/${postId}`,
    UNDO: (postId: string) => `${API_BASE}/applications/${postId}/undo-select`,
    SELECT: (postId: string) => `${API_BASE}/applications/${postId}/select`,
    CONFIRM_RECEIPT: (postId: string) => `${API_BASE}/applications/${postId}/confirm-receipt`,
    MY_LIMIT: `${API_BASE}/applications/my-limit`,
  },
  ADMIN_POSTS: {
    LIST: `${API_BASE}/admin/posts`,
    STATS: `${API_BASE}/admin/posts/stats`,
    COMPLETE: (id: string) => `${API_BASE}/admin/posts/${id}/complete`,
    UPDATE_STATUS: (id: string) => `${API_BASE}/admin/posts/${id}/status`,
    PIN: (id: string) => `${API_BASE}/admin/posts/${id}/pin`,
    DELETE: (id: string) => `${API_BASE}/admin/posts/${id}`,
  },

  COMMENTS: {
    LIST: (postId: string) => `${API_BASE}/posts/${postId}/comments`,
    CREATE: (postId: string) => `${API_BASE}/posts/${postId}/comments`,
    DELETE: (postId: string, commentId: string) =>
      `${API_BASE}/posts/${postId}/comments/${commentId}`,
  },
  WISHLIST_COMMENTS: {
    LIST: (wishlistId: string) => `${API_BASE}/wishlist/${wishlistId}/comments`,
    CREATE: (wishlistId: string) => `${API_BASE}/wishlist/${wishlistId}/comments`,
    DELETE: (wishlistId: string, commentId: string) =>
      `${API_BASE}/wishlist/${wishlistId}/comments/${commentId}`,
  },
  HEALTH: `${API_BASE}/health`,
  USERS: {
    PROFILE: (id: string) => `${API_BASE}/users/${id}`,
  },
  CHAT: {
    CONVERSATIONS: `${API_BASE}/chat/conversations`,
    CONVERSATION_MESSAGES: (id: string) => `${API_BASE}/chat/conversations/${id}/messages`,
    CONVERSATION_READ: (id: string) => `${API_BASE}/chat/conversations/${id}/read`,
    UPLOAD: `${API_BASE}/chat/upload`,
  },
  NEWS: {
    LIST: `${API_BASE}/news`,
    DETAIL: (id: string) => `${API_BASE}/news/${id}`,
    ADMIN_LIST: `${API_BASE}/admin/news`,
    ADMIN_GET: (id: string) => `${API_BASE}/admin/news/${id}`,
    ADMIN_CREATE: `${API_BASE}/admin/news`,
    ADMIN_UPDATE: (id: string) => `${API_BASE}/admin/news/${id}`,
    ADMIN_DELETE: (id: string) => `${API_BASE}/admin/news/${id}`,
    ADMIN_TOGGLE_PIN: (id: string) => `${API_BASE}/admin/news/${id}/toggle-pin`,
  },
} as const;
export { BASE_URL };
