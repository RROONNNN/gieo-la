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
| PATCH | /api/v1/admin/users/:id/individual-status | Admin |Grant or Revoke Individual tích xanh badge |
| PATCH | /api/v1/admin/users/:id/account-status | Admin | Update account status for a user |

## 5) User Profile APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/v1/users/:id | Public | Get public profile of a user |

## 6) Upload APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/v1/upload/image | Authenticated | Upload a single image (JPG/PNG/WEBP, ≤5 MB); returns URL |

## 7) Post APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/v1/posts | Public | List posts (filter by category, search, pagination; pinned first) |
| GET | /api/v1/posts/:id | Public | Get single post detail (populates author) |
| POST | /api/v1/posts | Authenticated | Create a new post |
| PATCH | /api/v1/posts/:id | Authenticated | Update own post (only if status = available) |
| DELETE | /api/v1/posts/:id | Authenticated | Delete own post |
| PATCH | /api/v1/posts/:id/status | Authenticated | Change post status (available → in_transaction → traded) |
| POST | /api/v1/posts/:id/like | Authenticated | Toggle like on a post (returns liked, likesCount) |

## 8) Application APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/v1/applications/:postId/apply | Authenticated | Apply for a post (verified NGO/Individual only; monthly limit enforced) |
| GET | /api/v1/applications/:postId | Public | List applications for a post (sorted by role priority: NGO > Individual > Member) |
| PATCH | /api/v1/applications/:postId/select/:applicantId | Authenticated | Author selects an applicant (sets post to in_transaction; rejects others) |
| GET | /api/v1/applications/my-limit | Authenticated | Get current user's monthly application limit usage |

## 9) Admin Post Management APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/v1/admin/posts | Admin | List all posts with admin filters |
| PATCH | /api/v1/admin/posts/:id/complete | Admin | Mark post as completed (traded → completed; increments completedDonations) |
| DELETE | /api/v1/admin/posts/:id | Admin | Admin-delete a post |
| PATCH | /api/v1/admin/posts/:id/toggle-pin | Admin | Toggle pin status of a post |
| PATCH | /api/v1/admin/posts/wishlist/:id/pin | Admin | Toggle pin status of a wishlist post |

## 11) Leaderboard APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/v1/leaderboard | Public | Get top 10 donors for a month (optional ?year=&month=) |

## 12) Wishlist APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/v1/wishlist | Public | List wishlist posts (filter: category, status, pagination) |
| GET | /api/v1/wishlist/:id | Public | Get single wishlist post detail |
| POST | /api/v1/wishlist | Authenticated (NGO+ngo_verified) | Create a new wishlist post |
| DELETE | /api/v1/wishlist/:id | Authenticated (author or admin) | Delete a wishlist post |
| POST | /api/v1/wishlist/:id/like | Authenticated | Toggle like on a wishlist post (returns liked, likesCount) |

## 10) Comment APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/v1/posts/:postId/comments | Public | List comments for a post (sorted by createdAt asc) |
| POST | /api/v1/posts/:postId/comments | Authenticated | Create a comment on a post |
| DELETE | /api/v1/posts/:postId/comments/:commentId | Authenticated | Delete a comment (own comment or admin) |

## Notes

- All endpoints under `/api/v1/*` are mounted from backend router.
- Rate limiting is applied at `/api/*` (includes `/api/v1/*`).
