---
goal: Implement Leaderboard (Gamification) + Wishlist (NGO) features
version: 1.0
date_created: 2026-04-24
last_updated: 2026-04-24 (implemented)
owner: dev
status: 'Implemented'
tags: [feature, leaderboard, gamification, wishlist, ngo]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Implement two interconnected features from the requirements document:

1. **Leaderboard** — Monthly donor ranking based on `completed` posts during the current calendar month. Displays Top 10 with decorative badges (gold/silver/bronze). Badges on `User` are visual/cosmetic only and are NOT auto-reset; they reflect the current month's live rank.
2. **Wishlist** — A dedicated `/wishlist` page where verified NGOs can post item requests. Uses a **separate `Wishlist` Mongoose model** (not Post). Fields: `title`, `images`, `description`, `category`, `quantity`, `status`. Any authenticated user can **like** a wishlist post.

---

## 1. Requirements & Constraints

- **REQ-001**: Leaderboard ranks users by number of `Post` documents where `status === 'completed'` AND `completedAt` falls within the current calendar month (UTC). Field `completedAt` does not exist yet — must be added to `Post` model and set when `adminCompletePost` runs.
- **REQ-002**: Top 1 → badge `gold` (`Đại sứ Lá Lành`), Top 2–5 → `silver` (`Lá Lành Tích Cực`), Top 6–10 → `bronze` (`Mầm Lành Năng Nổ`). Badges are cosmetic; no auto-reset cron.
- **REQ-003**: Public `GET /api/v1/leaderboard?year=YYYY&month=MM` endpoint. No auth required.
- **REQ-004**: Wishlist uses a **dedicated `Wishlist` model** (separate collection `wishlists`). Fields: `title` (String, required), `images` (Array<String>, 1–5), `description` (String, optional), `category` (same enum as Post), `quantity` (Number), `status` (enum: `open` | `fulfilled`), `author` (ref User), `isPinned` (Boolean), `likes` (Array<ObjectId ref User>), `likesCount` (Number, denormalized for sort). Timestamps.
- **REQ-004b**: Any authenticated user can like/unlike a wishlist post via `POST /api/v1/wishlist/:id/like` (toggle).
- **REQ-005**: Only users with `role === 'ngo'` AND `verificationStatus === 'ngo_verified'` can create wishlist posts.
- **REQ-006**: `GET /api/v1/wishlist` — public, returns posts where `isWishlist: true` with pagination + category filter.
- **REQ-007**: Admin can pin wishlist posts (`isPinned`), same mechanism as regular posts.
- **REQ-008**: Any authenticated user can like/unlike a regular `Post` via `POST /api/v1/posts/:id/like` (toggle). `Post` schema gains `likes: [ObjectId ref User]` and `likesCount: Number`.
- **CON-001**: `completedAt` added as nullable Date to `Post` schema — backfill existing completed posts by setting `completedAt = updatedAt`.
- **CON-002**: `badge` field already exists on `User` model (`none|bronze|silver|gold`). No schema change needed.
- **CON-003**: `Post` model is **not modified** for wishlist. The two features are fully decoupled.
- **GUD-001**: Frontend uses Next.js 15 App Router, TypeScript strict, Tailwind CSS v4, no `any` casts.
- **GUD-002**: Server components fetch with `Authorization: Bearer <token from cookie>` via `serverApiData` helper pattern.
- **PAT-001**: New API functions in `frontend/lib/api/` follow existing patterns: SSR functions use `fetch` + `BASE_URL`; client mutations use `apiClient`.

---

## 2. Implementation Steps

### Phase 1 — Backend: Data Model Changes

- GOAL-001: Add `completedAt` to Post schema; create dedicated `Wishlist` model.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | **`backend/src/models/Post.js`**: Add `completedAt: { type: Date, default: null }` field. Add `likes: [{ type: ObjectId, ref: 'User' }]` (default `[]`) and `likesCount: { type: Number, default: 0 }`. Add index `{ status: 1, completedAt: -1 }`. | ✅ | 2026-04-24 |
| TASK-002 | **`backend/src/controllers/postController.js`** — `adminCompletePost`: Set `post.completedAt = new Date()` before `post.save()`. | ✅ | 2026-04-24 |
| TASK-003 | **`backend/src/scripts/backfill-completedAt.js`**: One-time script: `Post.updateMany({ status: 'completed', completedAt: null }, [{ $set: { completedAt: '$updatedAt' } }])`. Run once against DB. | ✅ | 2026-04-24 |
| TASK-003b | **`backend/src/models/Wishlist.js`** (new file): New Mongoose schema with fields: `author` (ref User, required), `title` (String, required, maxlength 200), `images` ([String], 1–5), `description` (String, optional, maxlength 2000), `category` (enum POST_CATEGORY_VALUES, required), `quantity` (Number, min 1, required), `status` (enum `open`\|`fulfilled`, default `open`), `isPinned` (Boolean, default false), `likes` ([ObjectId ref User], default []), `likesCount` (Number, default 0). Indexes: `{ author: 1, createdAt: -1 }`, `{ isPinned: -1, createdAt: -1 }`, `{ category: 1, status: 1 }`. Timestamps. | ✅ | 2026-04-24 |

---

### Phase 2 — Backend: Leaderboard API

- GOAL-002: Create `GET /api/v1/leaderboard` endpoint returning monthly Top 10 donors with badge labels.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-006 | **`backend/src/controllers/leaderboardController.js`** (new file): `getLeaderboard` handler. Accepts optional `?year=YYYY&month=MM` (defaults to current UTC month). Aggregates `Post` collection: `{ $match: { status: 'completed', isWishlist: { $ne: true }, completedAt: { $gte: startOfMonth, $lte: endOfMonth } } }` → `{ $group: { _id: '$author', count: { $sum: 1 } } }` → `{ $sort: { count: -1 } }` → `{ $limit: 10 }` → `{ $lookup: users }`. Returns array of `{ rank, user: { _id, name, avatar, role }, completedThisMonth }` with badge label computed server-side. | | |
| TASK-007 | **`backend/src/validators/leaderboardValidators.js`** (new file): Zod schema validating optional `year` (1900–2100) and `month` (1–12) from query string. | | |
| TASK-008 | **`backend/src/routes/leaderboardRoutes.js`** (new file): Public `GET /` route → `leaderboardController.getLeaderboard`. No `protect` middleware. | | |
| TASK-009 | **`backend/src/routes/index.js`**: Mount `leaderboardRouter` at `/leaderboard`. | | |

---

### Phase 3 — Backend: Wishlist API

- GOAL-003: Create wishlist CRUD + like endpoints using the dedicated `Wishlist` model.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-010 | **`backend/src/validators/wishlistValidators.js`** (new file): `createWishlistSchema` — `title` (string, required), `category` (enum), `quantity` (number, min 1), `images` ([string], 1–5), `description` (string, optional). `listWishlistQuerySchema` — `category?`, `status?`, `page?`, `limit?`. | | |
| TASK-011 | **`backend/src/controllers/wishlistController.js`** (new file): <br>• `listWishlist` — public; `{ status: 1, isPinned: -1, createdAt: -1 }` sort; category + status filter; paginate; populate `author` with `name avatar role verificationStatus`.<br>• `createWishlist` — protect; role check `ngo` + `ngo_verified`; create Wishlist doc.<br>• `deleteWishlist` — protect; author or admin only.<br>• `toggleLike` — protect (any authenticated user); toggle `req.user._id` in `likes` array + update `likesCount`. | | |
| TASK-012 | **`backend/src/routes/wishlistRoutes.js`** (new file): `GET /` → `listWishlist` (public); `POST /` → `protect` + `createWishlist`; `DELETE /:id` → `protect` + `deleteWishlist`; `POST /:id/like` → `protect` + `toggleLike`. | | |
| TASK-013 | **`backend/src/routes/index.js`**: Mount `wishlistRouter` at `/wishlist`. | | |
| TASK-014 | **`backend/src/routes/adminPostRoutes.js`**: Add `PATCH /admin/wishlist/:id/pin` route → `adminToggleWishlistPin` handler in wishlistController (or reuse `adminTogglePin` logic applied to Wishlist model). | | |
| TASK-014b | **`backend/src/controllers/postController.js`**: Add `toggleLikePost` handler — `protect`; toggle `req.user._id` in `post.likes` array; set `post.likesCount = post.likes.length`; `post.save()`. Return `{ liked: bool, likesCount: number }`. | | |
| TASK-014c | **`backend/src/routes/postRoutes.js`**: Add `POST /:id/like` → `protect` + `toggleLikePost`. | | |

---

### Phase 4 — Frontend: Types & API Layer

- GOAL-004: Extend TypeScript types and API helpers.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-015 | **`frontend/types/wishlist.ts`** (new file): `interface WishlistPost { _id: string; author: UserRef; title: string; category: PostCategory; quantity: number; images: string[]; description: string \| null; status: 'open' \| 'fulfilled'; isPinned: boolean; likes: string[]; likesCount: number; createdAt: string; updatedAt: string; }` and `interface WishlistListResponse { items: WishlistPost[]; total: number; page: number; limit: number; }`. | | |
| TASK-016 | **`frontend/types/leaderboard.ts`** (new file): `interface LeaderboardEntry { rank: number; user: UserRef; completedThisMonth: number; badgeLabel: string; }` and `interface LeaderboardResponse { year: number; month: number; entries: LeaderboardEntry[]; }`. | | |
| TASK-017 | **`frontend/lib/api/endpoints.ts`**: Add `LEADERBOARD: { MONTHLY: \`${API_BASE}/leaderboard\`` }`, `WISHLIST: { LIST, CREATE, DELETE: (id), LIKE: (id) → \`…/wishlist/${id}/like\`` }`, and `POSTS.LIKE: (id: string) => \`${API_BASE}/posts/${id}/like\`` to the existing `POSTS` object. | | |
| TASK-018 | **`frontend/lib/api/leaderboard.ts`** (new file): `fetchLeaderboard(year?: number, month?: number): Promise<LeaderboardResponse>` — plain `fetch` with `cache: 'no-store'`. | | |
| TASK-019 | **`frontend/lib/api/wishlist.ts`** (new file): `fetchWishlist(params?)` (SSR, plain fetch), `createWishlist(payload)` (client, `apiClient.post`), `deleteWishlist(id)` (client, `apiClient.delete`), `toggleLikeWishlist(id)` (client, `apiClient.post`). | | |
| TASK-019b | **`frontend/lib/api/posts.ts`**: Add `toggleLikePost(id: string): Promise<{ liked: boolean; likesCount: number }>` using `apiClient.post(ENDPOINTS.POSTS.LIKE(id))`. | | |
| TASK-019c | **`frontend/types/post.ts`**: Add `likes: string[]` and `likesCount: number` to the existing `Post` interface. | | |

---

### Phase 5 — Frontend: Leaderboard Page

- GOAL-005: Build `/leaderboard` page — public, server-rendered, monthly view with month/year navigation.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-020 | **`frontend/app/(public)/leaderboard/page.tsx`** (new file): Server component. Reads `year` and `month` from `searchParams`. Calls `fetchLeaderboard(year, month)`. Renders podium for Top 3 and ranked list for 4–10. Includes prev/next month navigation links (plain `<Link>`). | | |
| TASK-021 | **`frontend/components/leaderboard/LeaderboardPodium.tsx`** (new file): Client-or-server component. Displays rank 1 (center, larger), rank 2 (left), rank 3 (right). Shows `Avatar`, name, `completedThisMonth`, badge crown/medal icon. Tokens: `--brand-dark`, `--bg-cream`, `rounded-[15px]`. | | |
| TASK-022 | **`frontend/components/leaderboard/LeaderboardRow.tsx`** (new file): Renders a single ranked row (rank 4–10) with rank number, Avatar, name, badge label chip, donation count. | | |
| TASK-023 | **`frontend/components/leaderboard/BadgeIcon.tsx`** (new file): Renders visual badge based on `BadgeType`. `gold` → 👑 crown (amber), `silver` → 🥈 medal (slate), `bronze` → 🥉 medal (orange). Uses Lucide `Crown`, `Medal` or emoji span. | | |

---

### Phase 6 — Frontend: Wishlist Page

- GOAL-006: Build `/wishlist` page and create-wishlist flow for NGO users.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-024 | **`frontend/app/(public)/wishlist/page.tsx`** (new file): Server component. Reads `category`, `status`, `page` from `searchParams`. Calls `fetchWishlist(params)`. Renders pinned posts first (badge "Ghim"), then card grid. Category filter tabs + status filter. Includes `<Link href="/wishlist/create">` button shown only when `viewer.role === 'ngo' && viewer.verificationStatus === 'ngo_verified'`. | | |
| TASK-025 | **`frontend/components/wishlist/WishlistCard.tsx`** (new file): Card showing: first image thumbnail, title, NGO name + avatar, category badge, quantity, status chip (open/fulfilled), `likesCount` with heart icon. Links to `/wishlist/[id]`. | | |
| TASK-026 | **`frontend/components/wishlist/CreateWishlistForm.tsx`** (new file): Client component. Fields: title, category (select), quantity, condition (select), images (multi-upload via `uploadImage`), description. Calls `createWishlist(payload)`. On success `router.push('/wishlist')`. | | |
| TASK-027 | **`frontend/app/(public)/wishlist/create/page.tsx`** (new file): Server component redirects if not ngo+ngo_verified (check via `getCurrentUserFromCookie`). Renders `<CreateWishlistForm>`. | | |
| TASK-028 | **`frontend/app/(public)/wishlist/[id]/page.tsx`** (new file): Server component fetches wishlist by ID. Renders image gallery, title, description, NGO author card, category + quantity info. Shows `<LikeButton wishlistId={id} initialLikes={likesCount} initialLiked={isLiked}>` + `<WishlistOwnerActions>` if `isOwn`. | | |
| TASK-029 | **`frontend/components/wishlist/WishlistOwnerActions.tsx`** (new file): Client component. Props: `wishlistId`. Delete button with confirm dialog. Calls `deleteWishlist(wishlistId)` then `router.push('/wishlist')`. | | |
| TASK-029b | **`frontend/components/wishlist/LikeButton.tsx`** (new file): Client component. Props: `wishlistId`, `initialLikes: number`, `initialLiked: boolean`. Heart icon + count. Calls `toggleLikeWishlist(wishlistId)` on click. Optimistic UI update. Requires auth — shows login redirect if unauthenticated. | | |
| TASK-029c | **`frontend/components/posts/PostLikeButton.tsx`** (new file): Client component, same pattern as `LikeButton`. Props: `postId`, `initialLikes: number`, `initialLiked: boolean`. Calls `toggleLikePost(postId)`. Optimistic UI. Shown on post detail page `(public)/posts/[id]/page.tsx` and optionally on `PostCard`. | | |

---

### Phase 7 — Frontend: Badge Display Integration

- GOAL-007: Show badges on Avatar/Profile wherever user is displayed.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-030 | **`frontend/components/ui/BadgeIcon.tsx`** (new file, or combine with TASK-023): Standalone reusable badge chip component that accepts `BadgeType` and renders label + icon. | | |
| TASK-031 | **`frontend/app/(public)/profile/[id]/page.tsx`**: Import `BadgeIcon`. Show badge below name when `profileUser.badge !== 'none'`. | | |
| TASK-032 | **`frontend/components/posts/PostCard.tsx`** (if it exists): Show badge icon next to author avatar inside post cards. Verify file path and add if missing. | | |

---

### Phase 8 — Documentation Updates

- GOAL-008: Keep project docs in sync.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-033 | **`models.md`**: Add `Post.completedAt` and `Post.isWishlist` fields. | | |
| TASK-034 | **`list_apis.md`**: Add `GET /api/v1/leaderboard`, `GET /api/v1/wishlist`, `POST /api/v1/wishlist`, `DELETE /api/v1/wishlist/:id`. | | |

---

## 3. Alternatives

- **ALT-001**: Add a dedicated `Leaderboard` MongoDB collection that stores monthly snapshots. Rejected — adds complexity and an extra write on every `adminCompletePost`. Aggregating from `Post` at query time is simpler; cache at HTTP layer if needed.
- **ALT-002**: Reuse `Post` model with `isWishlist: Boolean` flag. Rejected — pollutes the Post collection, requires filtering in every post query, and prevents wishlist-specific fields (likes, likesCount) without further schema bloat.
- **ALT-003**: Use a cron job (`node-cron`) to reset `badge` every month. Rejected by user — badges are cosmetic/thẩm mỹ, live rank displayed at query time is sufficient.
- **ALT-004**: Store `likes` as a separate `WishlistLike` collection (like/unlike with separate documents). Rejected — embedding `likes: [ObjectId]` in the Wishlist document is sufficient at current scale and avoids an extra collection join.

---

## 4. Dependencies

- **DEP-001**: `completedAt` backfill script (TASK-003) must be run on the database **before** deploying TASK-006 so historical leaderboard queries don't return zero.
- **DEP-002**: `Wishlist` model (TASK-003b) must exist before wishlistController (TASK-011) and frontend API layer (TASK-019).
- **DEP-003**: Phase 4 (types + API) must complete before Phases 5 & 6 (UI pages).

---

## 5. Files

| ID | File | Action |
|----|------|--------|
| FILE-001 | `backend/src/models/Post.js` | Modify — add `completedAt`, `likes`, `likesCount` |
| FILE-001b | `backend/src/models/Wishlist.js` | **Create** — new dedicated model |
| FILE-002 | `backend/src/controllers/postController.js` | Modify — set `completedAt` in `adminCompletePost`; add `toggleLikePost` handler |
| FILE-002b | `backend/src/routes/postRoutes.js` | Modify — add `POST /:id/like` route |
| FILE-003 | `backend/src/scripts/backfill-completedAt.js` | Create |
| FILE-004 | `backend/src/controllers/leaderboardController.js` | Create |
| FILE-005 | `backend/src/validators/leaderboardValidators.js` | Create |
| FILE-006 | `backend/src/routes/leaderboardRoutes.js` | Create |
| FILE-007 | `backend/src/controllers/wishlistController.js` | Create |
| FILE-008 | `backend/src/routes/wishlistRoutes.js` | Create |
| FILE-009 | `backend/src/routes/index.js` | Modify — mount leaderboard + wishlist routers |
| FILE-010 | `backend/src/validators/wishlistValidators.js` | **Create** (replaces postValidators change) |
| FILE-011 | `frontend/types/wishlist.ts` | **Create** — new type file |
| FILE-011b | `frontend/types/post.ts` | Modify — add `likes: string[]`, `likesCount: number` to `Post` interface |
| FILE-012 | `frontend/types/leaderboard.ts` | Create |
| FILE-013 | `frontend/lib/api/endpoints.ts` | Modify — add LEADERBOARD + WISHLIST endpoints |
| FILE-014 | `frontend/lib/api/leaderboard.ts` | Create |
| FILE-015 | `frontend/lib/api/wishlist.ts` | Create — includes `toggleLikeWishlist` |
| FILE-016 | `frontend/app/(public)/leaderboard/page.tsx` | Create |
| FILE-017 | `frontend/components/leaderboard/LeaderboardPodium.tsx` | Create |
| FILE-018 | `frontend/components/leaderboard/LeaderboardRow.tsx` | Create |
| FILE-019 | `frontend/components/leaderboard/BadgeIcon.tsx` | Create |
| FILE-020 | `frontend/app/(public)/wishlist/page.tsx` | Create |
| FILE-021 | `frontend/app/(public)/wishlist/create/page.tsx` | Create |
| FILE-022 | `frontend/app/(public)/wishlist/[id]/page.tsx` | Create |
| FILE-023 | `frontend/components/wishlist/WishlistCard.tsx` | Create |
| FILE-024 | `frontend/components/wishlist/CreateWishlistForm.tsx` | Create |
| FILE-025 | `frontend/components/wishlist/WishlistOwnerActions.tsx` | Create |
| FILE-025b | `frontend/components/wishlist/LikeButton.tsx` | **Create** |
| FILE-025c | `frontend/components/posts/PostLikeButton.tsx` | **Create** |
| FILE-026 | `frontend/app/(public)/profile/[id]/page.tsx` | Modify — show badge |
| FILE-027 | `models.md` | Modify — add Wishlist model doc |
| FILE-028 | `list_apis.md` | Modify |

---

## 6. Testing

- **TEST-001**: `GET /api/v1/leaderboard` returns 200 with empty array when no completed posts exist for the queried month.
- **TEST-002**: After running `adminCompletePost`, the completed post's author appears in that month's leaderboard.
- **TEST-003**: Leaderboard `?year=2026&month=1` returns data for January 2026 only (not current month).
- **TEST-004**: `GET /api/v1/posts` returns zero documents from the `wishlists` collection (completely decoupled).
- **TEST-005**: `POST /api/v1/wishlist` with a `member` role token returns 403.
- **TEST-006**: `POST /api/v1/wishlist` with an NGO token where `verificationStatus !== 'ngo_verified'` returns 403.
- **TEST-007**: `POST /api/v1/wishlist` with valid NGO+verified token creates a `Wishlist` document (not a `Post`).
- **TEST-008**: `GET /api/v1/wishlist` returns only `Wishlist` documents.
- **TEST-009**: `POST /api/v1/wishlist/:id/like` from an authenticated user toggles `likes` array and increments/decrements `likesCount`.
- **TEST-010**: Calling `POST /api/v1/wishlist/:id/like` twice from the same user results in unlike (idempotent toggle).

---

## 7. Risks & Assumptions

- **RISK-001**: Existing `Post` documents have `completedAt: null`. If backfill (TASK-003) is not run before deploy, leaderboard queries for past months will return empty results. **Mitigation**: Run backfill script in the same deployment pipeline as the schema change.
- **RISK-002**: NGO `verificationStatus` uses value `'ngo_verified'` per the User model enum. Confirm this value is set correctly when Admin grants NGO badge (`verificationController.js → grantNgoBadge`).
- **RISK-003**: `likes` array embedded in Wishlist document can grow large if many users like. At expected community scale (hundreds of users) this is fine; if scale increases, migrate to a separate `WishlistLike` collection.
- **ASSUMPTION-001**: `completedAt` is set once and never updated. Re-completing a post is not possible.
- **ASSUMPTION-002**: Wishlist and Post are fully independent collections. No shared admin management page is required initially.
- **ASSUMPTION-003**: `condition` field is NOT required on Wishlist (NGOs are requesting items, not describing condition of existing goods). `condition` field is omitted from `createWishlistSchema`.

---

## 8. Related Specifications / Further Reading

- [requirement.txt](../requirement.txt) — Sections VI (Leaderboard), VII (Wishlist)
- [models.md](../models.md) — Current model documentation
- [list_apis.md](../list_apis.md) — Current API list
