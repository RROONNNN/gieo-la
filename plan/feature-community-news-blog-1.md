---
goal: "Implement Community News / Admin Blog Feature (Bản tin cộng đồng)"
version: "1.0"
date_created: "2026-04-30"
last_updated: "2026-04-30"
owner: "Dev Team"
status: "In progress"
tags: [feature, backend, frontend, admin, blog]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Triển khai tính năng **Bản tin cộng đồng (XIII)** theo requirement: Admin soạn thảo và đăng bài Blog Post (tin tức, câu chuyện, thông báo, hướng dẫn). Tất cả người dùng — kể cả khách chưa đăng nhập — đều đọc được bài viết (Read-only). Trang `/news` và `/news/[id]` là public. Admin quản lý qua `/admin/news`.

Hiện trạng khởi đầu:
- `AdminSidebar` đã có link `/admin/news`.
- `Navbar` đã có link `/news`.
- `NewsCard` component đã tồn tại tại `frontend/components/news/NewsCard.tsx`.
- **Chưa có**: model, controller, routes backend; pages frontend; types; API helpers; admin form.

---

## 1. Requirements & Constraints

- **REQ-001**: Chỉ user có `role = admin` mới được tạo / sửa / xóa / ẩn bài bản tin. Backend kiểm tra middleware `auth` + `requireAdmin`.
- **REQ-002**: Tất cả user (kể cả Guest) được đọc bài có `status = published`. Frontend page `/news` và `/news/[id]` là public Server Components, không cần auth.
- **REQ-003**: Bài `isPinned = true` luôn hiển thị đầu trang `/news`, có badge "Ghim".
- **REQ-004**: Phân loại bài viết (category): `announcement` / `story` / `guide` / `event`.
- **REQ-005**: Status vòng đời: `draft` → `published` → `hidden`. Admin chuyển trạng thái bất kỳ lúc nào.
- **REQ-006**: `publishedAt` tự set khi Admin chọn `published` lần đầu; không overwrite nếu đã có.
- **REQ-007**: Trang chủ `/` hiển thị 3 bài bản tin mới nhất (`published`, không bao gồm `draft`/`hidden`) với nút "Xem tất cả".
- **REQ-008**: Thumbnail bắt buộc — upload qua endpoint upload hiện có (`POST /api/v1/upload/image`).
- **REQ-009**: Content là Markdown/Rich text (lưu dạng String, frontend render với `react-markdown`).
- **REQ-010**: Lọc theo category ở trang `/news`.
- **SEC-001**: Tất cả admin mutation endpoint phải dùng middleware `auth` + kiểm tra `req.user.role === 'admin'`.
- **SEC-002**: Validate input bằng Zod (backend). Không tin tưởng client data.
- **CON-001**: Không thêm comment/discussion trên bài bản tin (one-way broadcast).
- **CON-002**: Tech stack cố định: Mongoose 8, Zod (validation backend), Next.js 15 App Router, Tailwind CSS.
- **CON-003**: `react-markdown` chưa có trong project — cần cài thêm package.
- **GUD-001**: Thêm AuditLog cho mọi hành động admin: tạo, cập nhật, xóa bài.
- **GUD-002**: Cập nhật `models.md` và `list_apis.md` sau khi implement.
- **PAT-001**: Theo pattern hiện có: controller + Zod validator + route riêng, mount vào `routes/index.js`.
- **PAT-002**: Frontend: SSR Server Component cho public pages; `apiClient` cho client mutations (admin form).

---

## 2. Implementation Steps

### Implementation Phase 1 — Backend: Model + Constants + Validator

- **GOAL-001**: Tạo Mongoose model `NewsPost`, constants enum, và Zod validators.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Tạo file `backend/src/constants/newsEnums.js` với các enum: `NEWS_CATEGORIES = ['announcement', 'story', 'guide', 'event']`, `NEWS_STATUSES = { DRAFT: 'draft', PUBLISHED: 'published', HIDDEN: 'hidden' }`, `NEWS_CATEGORY_VALUES = [...]`, `NEWS_STATUS_VALUES = [...]` | | |
| TASK-002 | Tạo file `backend/src/models/NewsPost.js` — schema Mongoose với đầy đủ fields: `title (String, required, trim, 5-200)`, `thumbnail (String, required)`, `content (String, required)`, `category (enum NEWS_CATEGORY_VALUES, required)`, `status (enum NEWS_STATUS_VALUES, default: draft)`, `publishedAt (Date, default: null)`, `author (ObjectId, ref: User, required)`, `isPinned (Boolean, default: false)`. Thêm indexes: `{ status: 1, isPinned: -1, publishedAt: -1 }`, `{ category: 1, status: 1 }`. Thêm `timestamps: true`. | | |
| TASK-003 | Tạo file `backend/src/validators/newsValidators.js` với các Zod schemas: `createNewsSchema` (title, thumbnail, content, category, status optional default 'draft'), `updateNewsSchema` (partial, status enum NEWS_STATUS_VALUES), `listNewsQuerySchema` (category optional, status optional cho admin, page, limit). | | |

### Implementation Phase 2 — Backend: Controller + Routes

- **GOAL-002**: Implement CRUD API cho News Posts — public read + admin write.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-004 | Tạo file `backend/src/controllers/newsController.js`. Implement các hàm sau: | | |
| | `listNews` — GET public: lọc `status: 'published'`, sort `isPinned: -1, publishedAt: -1`, paginate (page/limit), populate `author` (`name`). | | |
| | `getNews` — GET public: tìm theo `_id`, chỉ trả kết quả nếu `status = 'published'` (hoặc user là admin). | | |
| | `createNews` — POST admin-only: validate `createNewsSchema`, set `author = req.user._id`, nếu `status = 'published'` tự set `publishedAt = new Date()`. Lưu AuditLog `news.create`. | | |
| | `updateNews` — PATCH admin-only: validate `updateNewsSchema`, nếu chuyển sang `published` và `publishedAt` chưa có thì set `publishedAt = new Date()`. Lưu AuditLog `news.update`. | | |
| | `deleteNews` — DELETE admin-only: xóa bài, lưu AuditLog `news.delete`. | | |
| | `adminListNews` — GET admin-only: list tất cả status (draft/published/hidden) với filter status/category, sort `createdAt: -1`. | | |
| | `togglePin` — PATCH admin-only: toggle `isPinned`, lưu AuditLog `news.pin_toggle`. | | |
| TASK-005 | Tạo file `backend/src/routes/newsRoutes.js` với public routes: `GET /` → `listNews`, `GET /:id` → `getNews`. | | |
| TASK-006 | Tạo file `backend/src/routes/adminNewsRoutes.js` với admin-only routes (tất cả dùng `auth` middleware + kiểm tra admin): `GET /` → `adminListNews`, `POST /` → `createNews`, `PATCH /:id` → `updateNews`, `DELETE /:id` → `deleteNews`, `PATCH /:id/toggle-pin` → `togglePin`. | | |
| TASK-007 | Mount routes trong `backend/src/routes/index.js`: thêm `router.use('/news', newsRouter)` và `router.use('/admin/news', adminNewsRouter)`. Import 2 routers mới. | | |

### Implementation Phase 3 — Frontend: Types + API Helpers

- **GOAL-003**: Định nghĩa TypeScript types và các hàm fetch/mutate cho News.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-008 | Tạo file `frontend/types/news.ts` với interfaces: `NewsPost { _id, title, thumbnail, content, category, status, publishedAt, author: UserRef, isPinned, createdAt, updatedAt }`, `NewsListResponse { items, total, page, limit }`, `CreateNewsPayload`, `UpdateNewsPayload`. Thêm type `NewsCategory = 'announcement' \| 'story' \| 'guide' \| 'event'` và `NewsStatus = 'draft' \| 'published' \| 'hidden'`. | | |
| TASK-009 | Cập nhật `frontend/lib/api/endpoints.ts`: thêm `NEWS: { LIST: '/api/v1/news', DETAIL: (id) => '/api/v1/news/:id', ADMIN_LIST: '/api/v1/admin/news', ADMIN_CREATE: '/api/v1/admin/news', ADMIN_UPDATE: (id) => '/api/v1/admin/news/:id', ADMIN_DELETE: (id) => '/api/v1/admin/news/:id', ADMIN_TOGGLE_PIN: (id) => '/api/v1/admin/news/:id/toggle-pin' }`. | | |
| TASK-010 | Tạo file `frontend/lib/api/news.ts`: export `fetchNewsList(params, options)` (SSR-compatible dùng `fetch`), `fetchNewsDetail(id, options)` (SSR), `adminFetchNewsList(params)` (client, dùng `apiClient`), `adminCreateNews(payload)`, `adminUpdateNews(id, payload)`, `adminDeleteNews(id)`, `adminTogglePinNews(id)`. | | |
| TASK-011 | Cài package `react-markdown`: chạy `npm install react-markdown` trong `frontend/`. | | |

### Implementation Phase 4 — Frontend: Public Pages

- **GOAL-004**: Xây dựng trang public `/news` và `/news/[id]`.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-012 | Tạo `frontend/app/(public)/news/page.tsx` — Server Component. Fetch `fetchNewsList` với `status=published`. Render danh sách `NewsCard`. Thêm `NewsFilters` component (lọc theo category). Render bài `isPinned` với badge "Ghim" ở đầu. Hỗ trợ `searchParams.category` và `searchParams.page`. | | |
| TASK-013 | Tạo `frontend/components/news/NewsFilters.tsx` — Client Component (`'use client'`). Filter bar cho category (Tất cả / Thông báo / Câu chuyện / Hướng dẫn / Hoạt động), dùng `useRouter` + `useSearchParams` để update query params. | | |
| TASK-014 | Tạo `frontend/app/(public)/news/[id]/page.tsx` — Server Component. Fetch `fetchNewsDetail(id)`. Render full content: thumbnail (next/image), tiêu đề (Playfair Display), category badge, publishedAt, tác giả "Ban quản trị Lá Lành", content Markdown (`react-markdown`). Thêm `generateMetadata` cho SEO (title, description từ content excerpt). | | |
| TASK-015 | Cập nhật `NewsCard` component nếu cần để hiển thị badge "Ghim" khi `isPinned = true`. | | |

### Implementation Phase 5 — Frontend: Admin Pages

- **GOAL-005**: Xây dựng trang quản lý bản tin trong Admin Dashboard.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-016 | Tạo `frontend/app/admin/news/page.tsx` — Server Component. Fetch `adminFetchNewsList` (tất cả status). Render bảng danh sách bài: tiêu đề, category badge, status badge, isPinned, publishedAt, actions (Sửa / Ẩn / Xóa / Ghim). | | |
| TASK-017 | Tạo `frontend/app/admin/news/new/page.tsx` — Server Component wrapper cho `NewsForm` (Client Component). | | |
| TASK-018 | Tạo `frontend/app/admin/news/[id]/edit/page.tsx` — Server Component: fetch detail bài, render `NewsForm` với data hiện tại. | | |
| TASK-019 | Tạo `frontend/components/admin/NewsForm.tsx` — Client Component (`'use client'`). Form với các field: `title (input)`, `category (select)`, `thumbnail (upload image, dùng /api/v1/upload/image)`, `content (textarea markdown)`, `status (select: draft/published/hidden)`, `isPinned (checkbox)`. Submit gọi `adminCreateNews` hoặc `adminUpdateNews`. Redirect về `/admin/news` sau khi thành công. | | |
| TASK-020 | Tạo `frontend/components/admin/NewsAdminActions.tsx` — Client Component. Nút Xóa (confirm dialog) gọi `adminDeleteNews`, nút Toggle Pin gọi `adminTogglePinNews`, nút Ẩn/Đăng gọi `adminUpdateNews({ status })`. Dùng `useRouter().refresh()` để refresh sau action. | | |

### Implementation Phase 6 — Frontend: Trang chủ Integration

- **GOAL-006**: Thêm section "Bản tin mới nhất" vào trang chủ `/`.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-021 | Cập nhật `frontend/app/(public)/page.tsx` (hoặc homepage component): fetch 3 bài news mới nhất `status=published` bằng `fetchNewsList({ limit: 3 })`. Render section "Bản tin mới nhất" với 3 `NewsCard` và nút "Xem tất cả" → `/news`. | | |

### Implementation Phase 7 — Documentation Updates

- **GOAL-007**: Cập nhật `models.md` và `list_apis.md` theo quy định dự án.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-022 | Cập nhật `models.md`: thêm section `NewsPost (newsposts)` với đầy đủ fields, indexes, relations. | | |
| TASK-023 | Cập nhật `list_apis.md`: thêm section "14) News APIs" (public) và "15) Admin News APIs" (admin). | | |

---

## 3. Alternatives

- **ALT-001**: Dùng thư viện rich-text editor (TipTap, Quill) thay vì textarea Markdown thuần. **Không chọn** vì tăng bundle size, setup phức tạp, trong khi yêu cầu chỉ cần Markdown cơ bản.
- **ALT-002**: Lưu content dưới dạng HTML thay vì Markdown. **Không chọn** vì Markdown an toàn hơn (tránh XSS), dễ edit hơn với admin, và `react-markdown` có sanitization built-in.
- **ALT-003**: Dùng Next.js Route Handler (`app/api/`) thay vì Express backend riêng. **Không chọn** vì toàn bộ API hiện tại dùng Express backend riêng — giữ nhất quán kiến trúc.

---

## 4. Dependencies

- **DEP-001**: `react-markdown` (npm) — render Markdown content ở frontend `/news/[id]`. Cài vào `frontend/`.
- **DEP-002**: Middleware `auth` hiện có tại `backend/src/middlewares/auth.js` — dùng để bảo vệ admin routes.
- **DEP-003**: Upload endpoint `POST /api/v1/upload/image` (hiện có) — dùng để upload thumbnail bài bản tin.
- **DEP-004**: `AuditLog` model hiện có — dùng để log action admin.
- **DEP-005**: `NewsCard` component đã có tại `frontend/components/news/NewsCard.tsx` — tái dùng, bổ sung prop `isPinned`.

---

## 5. Files

### Backend — Tạo mới

- **FILE-001**: `backend/src/constants/newsEnums.js` — enum categories và statuses
- **FILE-002**: `backend/src/models/NewsPost.js` — Mongoose model
- **FILE-003**: `backend/src/validators/newsValidators.js` — Zod schemas
- **FILE-004**: `backend/src/controllers/newsController.js` — CRUD + admin functions
- **FILE-005**: `backend/src/routes/newsRoutes.js` — public routes
- **FILE-006**: `backend/src/routes/adminNewsRoutes.js` — admin-only routes

### Backend — Sửa đổi

- **FILE-007**: `backend/src/routes/index.js` — mount 2 news routers mới

### Frontend — Tạo mới

- **FILE-008**: `frontend/types/news.ts` — TypeScript interfaces
- **FILE-009**: `frontend/lib/api/news.ts` — fetch & mutate helpers
- **FILE-010**: `frontend/app/(public)/news/page.tsx` — public list page
- **FILE-011**: `frontend/app/(public)/news/[id]/page.tsx` — public detail page
- **FILE-012**: `frontend/components/news/NewsFilters.tsx` — category filter bar
- **FILE-013**: `frontend/app/admin/news/page.tsx` — admin news list
- **FILE-014**: `frontend/app/admin/news/new/page.tsx` — admin create page
- **FILE-015**: `frontend/app/admin/news/[id]/edit/page.tsx` — admin edit page
- **FILE-016**: `frontend/components/admin/NewsForm.tsx` — admin create/edit form
- **FILE-017**: `frontend/components/admin/NewsAdminActions.tsx` — delete/pin/status actions

### Frontend — Sửa đổi

- **FILE-018**: `frontend/lib/api/endpoints.ts` — thêm NEWS endpoints
- **FILE-019**: `frontend/components/news/NewsCard.tsx` — thêm prop `isPinned` + Ghim badge
- **FILE-020**: `frontend/app/(public)/page.tsx` — thêm section bản tin mới nhất

### Docs — Sửa đổi

- **FILE-021**: `models.md` — thêm NewsPost schema
- **FILE-022**: `list_apis.md` — thêm News & Admin News API groups

---

## 6. Testing

- **TEST-001**: `GET /api/v1/news` — trả về chỉ bài `published`, sort isPinned desc rồi publishedAt desc.
- **TEST-002**: `GET /api/v1/news/:id` — trả 200 nếu `published`, trả 404 nếu `draft`/`hidden` với non-admin request.
- **TEST-003**: `POST /api/v1/admin/news` với `status: 'published'` — tự set `publishedAt`, trả 201.
- **TEST-004**: `POST /api/v1/admin/news` không có `thumbnail` — trả 400 validation error.
- **TEST-005**: `PATCH /api/v1/admin/news/:id` chuyển `status: 'published'` khi `publishedAt` đã có — không overwrite `publishedAt`.
- **TEST-006**: `DELETE /api/v1/admin/news/:id` từ non-admin user — trả 403.
- **TEST-007**: `PATCH /api/v1/admin/news/:id/toggle-pin` — toggle `isPinned` và trả bài mới nhất.
- **TEST-008**: Frontend `/news` — hiển thị đúng bài pinned đầu tiên, category filter hoạt động.
- **TEST-009**: Frontend `/news/[id]` — render Markdown content, hiển thị thumbnail, publishedAt.
- **TEST-010**: Admin form tạo bài mới → submit → redirect `/admin/news` → bài xuất hiện trong danh sách.

---

## 7. Risks & Assumptions

- **RISK-001**: `react-markdown` v9+ có thể cần `rehype-sanitize` để ngăn XSS nếu content chứa HTML. Nên install cả `rehype-sanitize` kèm theo.
- **RISK-002**: Upload thumbnail qua endpoint hiện có chỉ hỗ trợ ≤5MB. Admin cần được thông báo giới hạn này trong form UI.
- **RISK-003**: Trang chủ gọi thêm 1 API (fetchNewsList) — có thể tăng thời gian load trang chủ nhẹ. Dùng `Promise.all` để fetch song song với các API khác.
- **ASSUMPTION-001**: Middleware admin check: dùng pattern `if (req.user.role !== 'admin') return res.status(403).json(...)` — consistent với pattern hiện có trong `adminPostRoutes.js`.
- **ASSUMPTION-002**: `author` của bài bản tin luôn hiển thị là "Ban quản trị Lá Lành" trên frontend, không hiển thị tên cụ thể của admin.
- **ASSUMPTION-003**: Không cần pagination trên admin list lần đầu — hiển thị 50 bài/page là đủ cho MVP.

---

## 8. Related Specifications / Further Reading

- [requirement.txt](../requirement.txt) — Section XIII: Chức năng Bản tin cộng đồng (Admin Blog)
- [models.md](../models.md) — Danh sách Mongoose models hiện có
- [list_apis.md](../list_apis.md) — Danh sách API endpoints hiện có
- [backend/src/controllers/wishlistController.js](../backend/src/controllers/wishlistController.js) — Pattern tham chiếu cho controller mới
- [backend/src/models/Wishlist.js](../backend/src/models/Wishlist.js) — Pattern tham chiếu cho model mới
- [frontend/app/(public)/wishlist/page.tsx](../frontend/app/(public)/wishlist/page.tsx) — Pattern tham chiếu cho public page
- [frontend/components/news/NewsCard.tsx](../frontend/components/news/NewsCard.tsx) — Component đã có, tái dùng
