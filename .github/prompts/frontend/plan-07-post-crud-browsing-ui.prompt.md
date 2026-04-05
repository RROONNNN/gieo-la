# Post CRUD, Browsing & Status UI

## 🎯 Goal
Build the post creation form, post listing/feed, post detail page, post editing, status management, and admin post moderation UI.

## ⚠️ Depends On
- FE plan-01-foundation-bootstrap (layout, API client, UI primitives)
- FE plan-03-auth-pages-and-state (auth context, protected routes)
- FE plan-05-post-notification-domain-types (Post types)
- FE plan-06-media-upload-components (ImageUploader)
- BE plan-07-post-crud-status-apis (post endpoints)

## 📋 Files to Create/Modify
- frontend/app/(public)/page.tsx
- frontend/app/(public)/posts/page.tsx
- frontend/app/(public)/posts/[id]/page.tsx
- frontend/app/(dashboard)/posts/new/page.tsx
- frontend/app/(dashboard)/posts/[id]/edit/page.tsx
- frontend/app/(dashboard)/my-posts/page.tsx
- frontend/lib/api/posts.ts
- frontend/hooks/usePosts.ts
- frontend/components/post/PostCard.tsx
- frontend/components/post/PostGrid.tsx
- frontend/components/post/PostDetail.tsx
- frontend/components/post/PostForm.tsx
- frontend/components/post/PostStatusBadge.tsx
- frontend/components/post/PostFilters.tsx
- frontend/components/post/CategoryTabs.tsx
- frontend/components/post/SearchBar.tsx
- frontend/components/post/PinnedPostBanner.tsx

## 📎 Shared Context
#file:requirement.txt
#file:frontend/types/post.ts

## 📐 Implementation Details

### Post API Layer (`lib/api/posts.ts`)
- `createPost(formData)`, `getPosts(filters)`, `getPostById(id)`, `updatePost(id, formData)`, `deletePost(id)`, `updatePostStatus(id, status)`, `pinPost(id)`, `unpinPost(id)`.
- Use `FormData` for create/update to support image uploads.

### Homepage (`/`)
- Hero section with tagline "Lá Lành Đùm Lá Rách" and search bar.
- 4 category quick-filter tabs: Đồ Nam, Đồ Nữ, Đồ Trẻ em, Phụ kiện.
- Latest posts grid (newest first, pinned posts at top).
- Section: "Bản tin mới nhất" (placeholder, filled by plan-12).
- Footer with NGO logos slider.

### Post Listing (`/posts`)
- Server Component page that fetches posts with filters.
- `PostFilters` bar: category tabs, keyword search, status filter (for admin).
- `SearchBar` with debounced full-text search.
- `PostGrid` displaying `PostCard` components.
- Pagination (cursor or page-based).
- `PinnedPostBanner` for pinned posts at the top.

### PostCard Component
- Thumbnail image, title/description snippet, category badge, condition, quantity, status badge, author avatar + name + role badge.
- Verified NGO shows tích xanh, verified individual shows "Hoàn cảnh khó khăn — Đã xác thực" badge.
- Click navigates to `/posts/[id]`.

### Post Detail Page (`/posts/[id]`)
- Server Component for SEO with client interactive elements.
- Image gallery with carousel/lightbox.
- Full post info: category, quantity, condition, description, location, author profile link.
- Status badge and status timeline visualization.
- "Đăng ký nhận đồ" button (visible only for verified NGO and verified individual users when post is `san_sang`).
- Application list panel (public, all can see who registered).
- Comment/feedback thread section (for plan-09).

### Post Creation (`/posts/new`)
- Protected route (authenticated members only).
- `PostForm` with: category select, quantity input, condition dropdown/input, description textarea, image upload (max 5), location.
- Client-side validation with zod.
- Submit creates post via API with multipart FormData.
- Redirect to the new post detail page on success.

### Post Editing (`/posts/[id]/edit`)
- Same `PostForm` pre-filled with existing data.
- Only accessible by the post author.
- Support adding/removing images.

### My Posts (`/my-posts`)
- Authenticated user's own posts with status filters.
- Quick actions: edit, delete, change status.

### Category Tabs
- 4 tabs matching the requirement categories with icons.
- Clicking a tab filters the post list.

### PostStatusBadge
- Color-coded: Sẵn sàng (green), Đang giao dịch (yellow), Đã giao dịch (blue), Hoàn thành (purple).
- Vietnamese labels.

## ✅ Acceptance Criteria
- [ ] Homepage displays hero, search, category tabs, and latest posts.
- [ ] Post listing supports filtering by category, keyword search, and pagination.
- [ ] Post detail page shows full post information with image gallery.
- [ ] Authenticated users can create new posts with images.
- [ ] Post authors can edit and delete their own posts.
- [ ] Post status is displayed with color-coded Vietnamese badges.
- [ ] Pinned posts appear at the top of listings.
- [ ] "Đăng ký nhận đồ" button only appears for eligible users on `san_sang` posts.
- [ ] My posts page shows the current user's posts with management actions.
