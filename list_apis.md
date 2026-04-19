# API List (Grouped)

## 1) System / Health

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /health | Public | Health check service |
| GET | /api/v1/ | Public | API v1 probe |

## 2) Authentication APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/v1/auth/register/member | Public | Register member account |
| POST | /api/v1/auth/ | Public | Register NGO account |
| POST | /api/v1/auth/register/individual | Public | Register individual account |
| POST | /api/v1/auth/login | Public | User login |
| GET | /api/v1/auth/me | Authenticated | Get current user profile |
| POST | /api/v1/auth/refresh-token | Authenticated | Re-issue JWT with latest role/status from DB |
| PATCH | /api/v1/auth/me | Authenticated | Update current user profile |

## 3) Verification Request APIs (User)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/v1/verification-requests | Authenticated | Submit verification request |
| GET | /api/v1/verification-requests/me | Authenticated | Get my verification requests |

## 4) Admin User Moderation APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/v1/admin/users | Admin | List users with optional role filter and pagination (max 20/page) |
| GET | /api/v1/admin/users/:id | Admin | Get single user by ID |
| GET | /api/v1/admin/users/verification-requests | Admin | List verification request queue |
| GET | /api/v1/admin/users/verification-requests/:id | Admin | Get single verification request by ID |
| PATCH | /api/v1/admin/users/verification-requests/:id/approve | Admin | Approve verification request |
| PATCH | /api/v1/admin/users/verification-requests/:id/reject | Admin | Reject verification request |
| PATCH | /api/v1/admin/users/:id/ngo-status | Admin | Grant or revoke NGO tích xanh badge |
| PATCH | /api/v1/admin/users/:id/individual-status | Admin | Revoke Individual tích xanh badge |
| PATCH | /api/v1/admin/users/:id/account-status | Admin | Update account status for a user |

## 5) User Profile APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/v1/users/:id | Public | Get public profile of a user |

## 6) Upload APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/v1/upload/image | Authenticated | Upload a single image (JPG/PNG/WEBP, ≤5 MB); returns URL |

## Notes

- All endpoints under `/api/v1/*` are mounted from backend router.
- Rate limiting is applied at `/api/*` (includes `/api/v1/*`).
