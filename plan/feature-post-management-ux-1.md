---
goal: Post management UX improvements — edit page, status transitions, author filters, admin status control, verification view guard
version: 1.0
date_created: 2026-04-25
last_updated: 2026-04-25
owner: dev
status: 'Implemented'
tags: [feature, posts, ux, admin, verification]
---

# Introduction

![Status: Implemented](https://img.shields.io/badge/status-Implemented-green)

Implement five interconnected UX improvements to the post management flow:

1. **Verification guard** — `/verify` hides the submission form and shows a read-only view when the user already has a pending or approved request (prevent duplicate submissions).
2. **Edit post page** — `/posts/[id]/edit` — a full edit form pre-filled with existing data; only accessible to the post author when `status === 'available'`.
3. **"My posts" filter** — adds a `mine=true` query param toggle on the `/posts` page so a logged-in user can see only their own posts regardless of status.
4. **Author status transitions + recipient selection** — on the post detail page, the post author can (a) select a recipient from the applicants list (sets `status → in_transaction`, records `selectedApplicant`), and (b) advance status: `in_transaction → traded` or revert `in_transaction → available`. `completed` remains admin-only.
5. **Admin post status editor** — in the admin post management UI, admin can change a post's status to any value (including `completed`), replacing the current single "Hoàn thành" button with a full dropdown.

---

## 1. Requirements & Constraints

- **REQ-001**: `/verify` page must NOT show the submission form (`SubmitVerificationForm`) when `hasPendingRequest === true` OR `isAlreadyVerified === true`. Currently pending state already hides the form; approved state shows `VerificationStatusCard` but also renders the form — fix this.
- **REQ-002**: `GET /api/v1/posts?mine=true` returns only the requesting user's posts (all statuses). Requires `protect` middleware; `mine` param is silently ignored for unauthenticated callers.
- **REQ-003**: `/posts/[id]/edit` is a client page, pre-filled with the current post data. Redirects to `/posts/[id]` if `status !== 'available'` or viewer is not the author.
- **REQ-004**: `PostOwnerActions` component expands to include a **status transition panel** with:
  - When `status === 'in_transaction'`: buttons "Xác nhận giao" (→ `traded`) and "Hoàn tác" (→ `available`).
  - When `status === 'traded'`: no further author transitions (waiting for admin `completed`).
  - When `status === 'available'`: no transition buttons (author changes status via recipient selection only).
- **REQ-005**: Recipient selection: the `ApplicationPanel` already shows a list of applicants. When the author clicks "Chọn người nhận" next to an applicant, it calls `PATCH /api/v1/applications/:postId/select` (already exists), which sets `post.status = 'in_transaction'` and `post.selectedApplicant`. The detail page must refresh after selection.
- **REQ-006**: In the admin post management table, each row's status cell becomes a `<select>` dropdown with all four statuses. On change, it calls `PATCH /api/v1/admin/posts/:id/status` (new backend endpoint). Setting `completed` from admin also sets `completedAt` and increments `completedDonations` (same logic as current `adminCompletePost`).
- **CON-001**: `updatePostStatus` backend handler already enforces author-only transitions (`available → in_transaction`, `in_transaction → traded`). No change needed to the existing handler for author transitions.
- **CON-002**: `adminCompletePost` already exists. A new `adminUpdatePostStatus` handler is added that accepts any status; when `status === 'completed'` it reuses the `completedAt` + `completedDonations` logic.
- **CON-003**: The `mine=true` filter is applied only in `listPosts`. It does NOT affect `adminListPosts`.
- **CON-004**: The edit page (`/posts/[id]/edit`) must prefetch the post server-side and pass initial values as props to a `"use client"` form component — same pattern as `CreatePostPage`.
- **GUD-001**: No new npm packages. Use existing patterns: `apiClient` for client mutations, `serverApiData` / direct `fetch` for SSR.
- **GUD-002**: TypeScript strict; no `any` casts in new code.
- **PAT-001**: New admin endpoint follows existing `adminPostRoutes.js` pattern: `protect + restrictTo(USER_ROLES.ADMIN)` applied via `router.use(...)`.

---

## 2. Implementation Steps

### Phase 1 — Backend: mine filter + admin status endpoint

- GOAL-001: Add `mine` query param to `listPosts`; add `adminUpdatePostStatus` handler + route.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | **`backend/src/validators/postValidators.js`**: Add `mine: z.coerce.boolean().optional().default(false)` to `listPostsQuerySchema`. | | |
| TASK-002 | **`backend/src/controllers/postController.js`** — `listPosts`: Extract `mine` from `parsed.data`. When `mine === true` AND `req.user` exists (attach via optional protect), add `filter.author = req.user._id` and remove the `status: POST_STATUSES.AVAILABLE` default. | | |
| TASK-003 | **`backend/src/routes/postRoutes.js`**: Change `router.get('/', listPosts)` to `router.get('/', optionalProtect, listPosts)` where `optionalProtect` is a new inline middleware: if `Authorization` header exists, run `protect` logic; otherwise `next()`. **Alternative**: add a named `optionalProtect` export to `middlewares/auth.js`. | | |
| TASK-004 | **`backend/src/middlewares/auth.js`**: Add `optionalProtect` middleware — same logic as `protect` but calls `next()` instead of returning 401 when no token is present. | | |
| TASK-005 | **`backend/src/controllers/postController.js`**: Add `adminUpdatePostStatus` handler. Accepts `{ status }` from body. When `status === 'completed'`: mirrors `adminCompletePost` logic (set `completedAt`, increment `completedDonations`, log audit). For other statuses: just set `post.status` and save. Returns `{ post }`. Export the function. | | |
| TASK-006 | **`backend/src/routes/adminPostRoutes.js`**: Import `adminUpdatePostStatus`. Add `router.patch('/:id/status', adminUpdatePostStatus)`. | | |

---

### Phase 2 — Frontend: API + types

- GOAL-002: Extend types and API helpers for the new backend capabilities.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-007 | **`frontend/lib/api/endpoints.ts`**: Add `ADMIN_POSTS.UPDATE_STATUS: (id: string) => \`${API_BASE}/admin/posts/${id}/status\`` to the existing `ADMIN_POSTS` object. | | |
| TASK-008 | **`frontend/lib/api/posts.ts`**: Add `mine?: boolean` to `ListPostsParams`. In `fetchPosts`, when `params.mine === true`, append `query.set("mine", "true")`. Also add `fetchMyPosts(token: string, params?)` — an SSR fetch that passes `Authorization: Bearer <token>` so the backend recognises the user. | | |
| TASK-009 | **`frontend/lib/api/admin.ts`**: Add `adminUpdatePostStatus(postId: string, status: string)` → `apiClient.patch(\`/api/v1/admin/posts/${postId}/status\`, { status })`. Return type `{ post: AdminPost }`. | | |

---

### Phase 3 — Verification guard fix

- GOAL-003: Prevent duplicate submissions on `/verify`.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-010 | **`frontend/app/(dashboard)/verify/page.tsx`**: Ensure `SubmitVerificationForm` is only rendered when `!hasPendingRequest && !isAlreadyVerified`. Current code already does this for pending; confirm the `isAlreadyVerified` branch also suppresses the form. If not, wrap the form render with `{!hasPendingRequest && !isAlreadyVerified && ( ... )}`. | | |

---

### Phase 4 — Edit post page

- GOAL-004: Implement `/posts/[id]/edit` — server wrapper + client form.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-011 | **`frontend/app/(public)/posts/[id]/edit/page.tsx`** (new file): Server component. Fetches post via `fetchPost(id)`. Gets viewer via `getCurrentUserFromCookie()`. Redirects to `/posts/${id}` if: viewer is null, post author `_id !== viewer._id`, or `post.status !== 'available'`. Passes post data as props to `<EditPostForm post={post} />`. | | |
| TASK-012 | **`frontend/components/posts/EditPostForm.tsx`** (new file): `"use client"` component. Pre-fills all form fields from `post` prop (title, category, quantity, condition, conditionNote, images, description, location). On submit calls `updatePost(post._id, payload)`. On success `router.push(\`/posts/${post._id}\`)`. Identical layout to `CreatePostPage` (same fields, same image upload logic). | | |

---

### Phase 5 — "My posts" filter on /posts page

- GOAL-005: Let a logged-in user filter to see only their own posts.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | **`frontend/app/(public)/posts/page.tsx`**: Add `mine?: string` to `PageProps.searchParams`. Read `const mine = params.mine === "true"`. Call `fetchPosts({ ..., mine })` (no token needed for public filter; server fetches with no auth — backend attaches user when token present but for SSR we won't pass a token here). **Note**: for SSR with token, use `fetchMyPostsServer` from TASK-008 when `mine === true` to get all statuses. | | |
| TASK-014 | **`frontend/components/posts/PostFilters.tsx`**: Add a "Bài đăng của tôi" toggle button at the top of the sidebar. When clicked: if `mine` is active, remove `mine` param; otherwise, set `mine=true`. Only render this button when user is authenticated — pass `isAuthenticated: boolean` as prop to `PostFilters` (server component reads auth, passes down). | | |

---

### Phase 6 — Author status transitions on post detail page

- GOAL-006: Let the post author advance status and revert `in_transaction → available`.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-015 | **`frontend/components/posts/PostOwnerActions.tsx`**: Add `postStatus` prop is already present. Expand the component to show a **StatusTransitionPanel** when `isAuthor`: <br>• `status === 'in_transaction'` → show button "Xác nhận đã giao" (`→ traded`) and button "Hoàn tác" (`→ available`). <br>• `status === 'traded'` → show read-only chip "Đang chờ Admin xác nhận hoàn thành". <br>• Other statuses → no extra buttons. <br>Each button calls `updatePostStatus(postId, newStatus)` then `router.refresh()`. | | |
| TASK-016 | **`frontend/components/posts/ApplicationPanel.tsx`**: When `isAuthor === true` AND `postStatus === 'available'`, show a "Chọn người này" button next to each applicant that has `status === 'pending'`. Button calls `selectApplicant(postId, applicantId)` (new helper, see TASK-017) then `router.refresh()`. | | |
| TASK-017 | **`frontend/lib/api/applications.ts`**: Add `selectApplicant(postId: string, applicantId: string)` → `apiClient.patch(ENDPOINTS.APPLICATIONS.SELECT(postId), { applicantId })`. | | |

---

### Phase 7 — Admin post status dropdown

- GOAL-007: Admin can set any post status from the admin post table.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-018 | **`frontend/components/admin/AdminPostStatusSelect.tsx`** (new file): `"use client"` component. Props: `postId: string`, `currentStatus: string`. Renders a `<select>` with all four statuses. On change calls `adminUpdatePostStatus(postId, newStatus)` then `router.refresh()`. Shows loading state during request. Disabled when `currentStatus === 'completed'` (already final). | | |
| TASK-019 | **`frontend/app/admin/posts/page.tsx`**: In the status column, replace the current status badge + "Hoàn thành" button with `<AdminPostStatusSelect postId={post._id} currentStatus={post.status} />`. Remove the standalone "Hoàn thành" button from the row actions (or keep the complete button only for non-completed statuses as a shortcut — team preference). | | |

---

## 3. Alternatives

- **ALT-001**: For the `mine` filter, use a dedicated endpoint `GET /api/v1/posts/mine`. Rejected — adds an extra route; the existing `listPosts` with a `mine` flag is simpler and avoids duplicating pagination logic.
- **ALT-002**: For the edit page, reuse `CreatePostPage` via a shared component. Accepted — `EditPostForm` shares layout with `CreatePostPage`; they are separate client components to avoid over-complicating the create flow.
- **ALT-003**: Author sets `completed` directly. Rejected — `completed` is admin-only per project requirements; it triggers `completedAt` and leaderboard data.
- **ALT-004**: Use a modal dialog for admin status change instead of inline dropdown. Rejected — inline `<select>` is simpler and consistent with the existing inline action buttons in admin tables.

---

## 4. Dependencies

- **DEP-001**: TASK-003/TASK-004 (`optionalProtect` middleware) must complete before TASK-002 (`mine` filter in listPosts) can be tested end-to-end.
- **DEP-002**: TASK-005/TASK-006 (admin status endpoint) must complete before TASK-018/TASK-019 (admin status UI).
- **DEP-003**: TASK-008 (`fetchMyPosts`) must complete before TASK-013 (posts page mine filter).
- **DEP-004**: TASK-017 (`selectApplicant`) must complete before TASK-016 (select button in ApplicationPanel).

---

## 5. Files

| ID | File | Action |
|----|------|--------|
| FILE-001 | `backend/src/validators/postValidators.js` | Modify — add `mine` to `listPostsQuerySchema` |
| FILE-002 | `backend/src/controllers/postController.js` | Modify — `listPosts` handles `mine`; add `adminUpdatePostStatus` |
| FILE-003 | `backend/src/routes/postRoutes.js` | Modify — wrap `GET /` with `optionalProtect` |
| FILE-004 | `backend/src/middlewares/auth.js` | Modify — add `optionalProtect` export |
| FILE-005 | `backend/src/routes/adminPostRoutes.js` | Modify — add `PATCH /:id/status` |
| FILE-006 | `frontend/lib/api/endpoints.ts` | Modify — add `ADMIN_POSTS.UPDATE_STATUS` |
| FILE-007 | `frontend/lib/api/posts.ts` | Modify — `mine` param in `fetchPosts`, add `fetchMyPostsServer` |
| FILE-008 | `frontend/lib/api/admin.ts` | Modify — add `adminUpdatePostStatus` |
| FILE-009 | `frontend/lib/api/applications.ts` | Modify — add `selectApplicant` |
| FILE-010 | `frontend/app/(dashboard)/verify/page.tsx` | Modify — guard form render |
| FILE-011 | `frontend/app/(public)/posts/[id]/edit/page.tsx` | **Create** — server wrapper |
| FILE-012 | `frontend/components/posts/EditPostForm.tsx` | **Create** — client form |
| FILE-013 | `frontend/app/(public)/posts/page.tsx` | Modify — add `mine` param |
| FILE-014 | `frontend/components/posts/PostFilters.tsx` | Modify — add "Bài đăng của tôi" toggle |
| FILE-015 | `frontend/components/posts/PostOwnerActions.tsx` | Modify — add status transition panel |
| FILE-016 | `frontend/components/posts/ApplicationPanel.tsx` | Modify — add "Chọn người này" button |
| FILE-017 | `frontend/components/admin/AdminPostStatusSelect.tsx` | **Create** — inline status dropdown |
| FILE-018 | `frontend/app/admin/posts/page.tsx` | Modify — use `AdminPostStatusSelect` |

---

## 6. Testing

- **TEST-001**: `GET /api/v1/posts?mine=true` without a token returns the same result as without `mine` (no filtering, no 401).
- **TEST-002**: `GET /api/v1/posts?mine=true` with a valid token returns only posts where `author === req.user._id`, regardless of status.
- **TEST-003**: `PATCH /api/v1/admin/posts/:id/status` with `{ status: 'completed' }` sets `completedAt`, increments author's `completedDonations`, and creates an audit log entry.
- **TEST-004**: `PATCH /api/v1/admin/posts/:id/status` with `{ status: 'available' }` changes status without touching `completedAt` or `completedDonations`.
- **TEST-005**: Navigating to `/posts/[id]/edit` as a non-author redirects to `/posts/[id]`.
- **TEST-006**: Navigating to `/posts/[id]/edit` when `post.status !== 'available'` redirects to `/posts/[id]`.
- **TEST-007**: Author clicking "Chọn người này" triggers `PATCH /api/v1/applications/:postId/select`, and the post detail refreshes with `status === 'in_transaction'`.
- **TEST-008**: Author clicking "Xác nhận đã giao" changes status to `traded`; "Hoàn tác" changes it back to `available`.
- **TEST-009**: `/verify` page shows `VerificationStatusCard` only and hides `SubmitVerificationForm` when `hasPendingRequest === true`.
- **TEST-010**: `/verify` page shows `VerificationStatusCard` only and hides `SubmitVerificationForm` when `isAlreadyVerified === true`.

---

## 7. Risks & Assumptions

- **RISK-001**: `optionalProtect` middleware must not break existing public `GET /api/v1/posts` calls that do not send any `Authorization` header. Mitigation: `optionalProtect` calls `next()` with no error when the header is absent.
- **RISK-002**: `adminUpdatePostStatus` with `status === 'completed'` must be idempotent-safe: if a post is already `completed`, re-setting it should not double-increment `completedDonations`. Mitigation: only increment when `post.status !== POST_STATUSES.COMPLETED` before the update.
- **RISK-003**: The `ApplicationPanel` currently reads `applications` from server-side props. After the author selects a recipient, `router.refresh()` may not immediately reflect the new `post.status` in `PostOwnerActions` if they share different data sources. Mitigation: both components call `router.refresh()` after mutation, which re-runs the server component.
- **ASSUMPTION-001**: `PATCH /api/v1/applications/:postId/select` already accepts `{ applicantId }` and sets `post.selectedApplicant` + `post.status = 'in_transaction'`. Verify this in `applicationController.js` before implementing TASK-016.
- **ASSUMPTION-002**: The admin post table (`frontend/app/admin/posts/page.tsx`) already has a `post._id` and `post.status` available per row for `AdminPostStatusSelect`.
- **ASSUMPTION-003**: The `/posts` page's `PostFilters` is rendered inside a `<Suspense>` boundary (it uses `useSearchParams`), so passing the `isAuthenticated` prop from the server page is straightforward.

---

## 8. Related Specifications / Further Reading

- [list_apis.md](../list_apis.md) — Current API list
- [models.md](../models.md) — Post model (status enum, selectedApplicant)
- [backend/src/controllers/postController.js](../backend/src/controllers/postController.js) — `updatePostStatus`, `adminCompletePost`
- [backend/src/controllers/applicationController.js](../backend/src/controllers/applicationController.js) — `selectApplicant` (verify before TASK-016)
