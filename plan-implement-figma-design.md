---
goal: "Implement UI/UX from Figma designs — Home, Posts, Post Detail, Profile, Admin"
version: 1.0
date_created: 2026-04-22
last_updated: 2026-04-22
owner: Dev Team
status: 'Planned'
tags: [feature, design, frontend, refactor]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Triển khai toàn bộ giao diện theo thiết kế Figma cho 5 trang chính: **Trang chủ**, **Diễn đàn (Posts)**, **Chi tiết bài đăng**, **Trang cá nhân**, và **Admin Dashboard**. Kế hoạch bao gồm thiết lập design tokens chính xác, xây dựng hệ thống component dùng chung, và refactor từng trang theo đúng Figma.

---

## Figma References

| Page | Node ID | URL |
|------|---------|-----|
| Trang chủ | 1:2 | https://www.figma.com/design/ccDYMreDqRnUMAjrHGP6Tg/Untitled?node-id=1-2 |
| Diễn đàn (Posts) | 1:195 | https://www.figma.com/design/ccDYMreDqRnUMAjrHGP6Tg/Untitled?node-id=1-195 |
| Chi tiết bài đăng | 1:369 | https://www.figma.com/design/ccDYMreDqRnUMAjrHGP6Tg/Untitled?node-id=1-369 |
| Trang cá nhân | 1:598 | https://www.figma.com/design/ccDYMreDqRnUMAjrHGP6Tg/Untitled?node-id=1-598 |
| Admin Dashboard | 1:755 | https://www.figma.com/design/ccDYMreDqRnUMAjrHGP6Tg/Untitled?node-id=1-755 |

---

## 1. Requirements & Constraints

- **REQ-001**: Sử dụng chính xác bảng màu từ Figma — `#2D4F36` (primary dark), `#163821` (darker), `#FAFAF5` (bg cream), `#F9E4C8` (bg warm), `#C5D9B8` (light green), `#a9d0af` (muted green text)
- **REQ-002**: Font: `Playfair Display` (headings, Bold/SemiBold) + `Be Vietnam Pro` (body, Regular/SemiBold) — load từ Google Fonts
- **REQ-003**: Border-radius: `15px` (cards/sections), `9999px` (pills/buttons), `24px` (hero section)
- **REQ-004**: Tách component dùng chung: `Navbar`, `Footer`, `PostCard`, `Badge`, `Button`, `Avatar`, `SearchBar`, `CategoryCard`, `NewsCard`
- **REQ-005**: Tất cả trang public wrap trong `MainLayout` (Navbar + content + Footer)
- **REQ-006**: Admin layout dùng sidebar dọc (khác public layout)
- **REQ-007**: Next.js 16 App Router — Server Components cho data fetching, `'use client'` chỉ cho interactive components
- **REQ-008**: Responsive design — mobile-first, breakpoints `sm`, `lg`
- **CON-001**: Không thêm dependency mới — chỉ dùng `tailwindcss`, `lucide-react`, `clsx`, `tailwind-merge`
- **CON-002**: Không thay đổi API backend (chỉ refactor BE nếu cần endpoint mới cho news/blog)
- **GUD-001**: Dùng `cn()` helper (clsx + tailwind-merge) cho conditional classes
- **GUD-002**: Đặt component tái sử dụng trong `components/ui/`, layout trong `components/layout/`, feature components trong folder riêng

---

## 2. Implementation Steps

### Phase 0: Design Tokens & Font Setup

- **GOAL-001**: Cập nhật `globals.css` với đúng color palette và font từ Figma; tạo `cn()` utility

| Task | Description | File | Completed | Date |
|------|-------------|------|-----------|------|
| TASK-001 | Cập nhật `globals.css` — thêm CSS variables đúng Figma palette: `--color-brand-dark: #2D4F36`, `--color-brand-darker: #163821`, `--color-bg-cream: #FAFAF5`, `--color-bg-warm: #F9E4C8`, `--color-brand-light: #C5D9B8`, `--color-brand-muted: #a9d0af`, border color `rgba(22,56,33,0.1)` | `frontend/app/globals.css` | | |
| TASK-002 | Thêm Google Fonts vào `layout.tsx`: import `Playfair_Display` (weights: 600, 700) và `Be_Vietnam_Pro` (weights: 400, 600) từ `next/font/google`; gán CSS variables `--font-playfair` và `--font-be-vietnam` | `frontend/app/layout.tsx` | | |
| TASK-003 | Tạo `cn()` utility function (clsx + tailwind-merge) | `frontend/lib/utils.ts` | | |

---

### Phase 1: Shared UI Components

- **GOAL-002**: Xây dựng primitive components tái sử dụng trong `components/ui/`

| Task | Description | File | Completed | Date |
|------|-------------|------|-----------|------|
| TASK-004 | Tạo `Button` component — variants: `primary` (bg `#2D4F36`, text white, rounded-full, px-7 py-2), `secondary` (border, transparent bg), `ghost`; sizes: `sm`, `md`, `lg` | `frontend/components/ui/Button.tsx` | | |
| TASK-005 | Tạo `Badge` component — variants: `role` (Member: gray, NGO: `#C5D9B8`/`#2D4F36`, Individual: light green), `condition` (Mới 100%/90%/80%: badge xanh), `status` (Sẵn sàng, Đang giao dịch, ...), `category`, `news-category` (Sự kiện: orange, Kinh nghiệm: teal, Câu chuyện: purple); `isPinned` badge | `frontend/components/ui/Badge.tsx` | | |
| TASK-006 | Tạo `Avatar` component — hiển thị ảnh hoặc fallback initials; sizes: `sm` (32px), `md` (40px), `lg` (56px), `xl` (80px); shape: circle; online indicator dot (optional) | `frontend/components/ui/Avatar.tsx` | | |
| TASK-007 | Tạo `SearchBar` component (`'use client'`) — input với search icon bên trái, button "Tìm kiếm" bên phải (pill shape, bg `#2D4F36`); `onChange` và `onSearch` props; dùng cho Hero section | `frontend/components/ui/SearchBar.tsx` | | |
| TASK-008 | Tạo `SectionHeading` component — tiêu đề section với border-bottom `rgba(22,56,33,0.1)`, font Playfair Display SemiBold 32px, màu `#163821` | `frontend/components/ui/SectionHeading.tsx` | | |
| TASK-009 | Tạo `StatsCard` component (dùng cho Admin) — icon + label + number, bg white, border, rounded-15 | `frontend/components/ui/StatsCard.tsx` | | |

---

### Phase 2: Layout Components

- **GOAL-003**: Tạo `Navbar`, `Footer`, `MainLayout` cho public pages và `AdminSidebar` cho admin

| Task | Description | File | Completed | Date |
|------|-------------|------|-----------|------|
| TASK-010 | Tạo `Navbar` component — logo "Lá Lành" (font Playfair, màu trắng) + nav links: `Trang chủ`, `Diễn đàn`, `Wishlist`, `Tin tức`, `Bảng xếp hạng`; active link có underline; user icon bên phải; background `#2D4F36`; active detection dùng `usePathname()` → `'use client'` | `frontend/components/layout/Navbar.tsx` | | |
| TASK-011 | Tạo `Footer` component — logo "Lá Lành" centered + NGO logo row (UNICEF, Red Cross, Oxfam, Save the Children) + links (Privacy Policy, Terms of Service, Partner NGOs, Contact Us) + copyright; background `#FAFAF5` | `frontend/components/layout/Footer.tsx` | | |
| TASK-012 | Tạo `MainLayout` component — Navbar + `<main>` (min-height, bg `#FAFAF5`) + Footer; max-width 1280px, px-[70px] | `frontend/components/layout/MainLayout.tsx` | | |
| TASK-013 | Tạo `AdminSidebar` component (`'use client'`) — logo "Lá Lành" + nav items (Quản lý User, Bài đăng, Wishlist, Leaderboard, Bản tin) với active state highlight (bg `#C5D9B8`, text `#2D4F36`); bottom: admin avatar + tên + "System Admin"; width 200px fixed | `frontend/components/layout/AdminSidebar.tsx` | | |
| TASK-014 | Update `admin/layout.tsx` — wrap children trong sidebar layout (flex row: sidebar + main content area) | `frontend/app/admin/layout.tsx` | | |

---

### Phase 3: Post Feature Components

- **GOAL-004**: Tạo các component đặc thù cho bài đăng: `PostCard`, `PostFilters`, `CategoryCard`, `PostGallery`, `ApplicationPanel`

| Task | Description | File | Completed | Date |
|------|-------------|------|-----------|------|
| TASK-015 | Tạo `PostCard` component — ảnh cover (aspect-ratio 4/3, rounded-15 top), condition badge (góc trên trái), title (Playfair SemiBold), description snippet, author row (Avatar + tên + role Badge + thời gian); border, rounded-15, hover shadow; link wrapping toàn card | `frontend/components/posts/PostCard.tsx` | | |
| TASK-016 | Tạo `PostFilters` component (`'use client'`) — sidebar với 3 section: Danh mục (checkboxes: Đồ Nam, Đồ Nữ, Trẻ em, Phụ kiện), Trạng thái (checkboxes: Sẵn sàng, Đang giao dịch, Đã giao dịch, Hoàn thành), Khu vực (select dropdown); update URL searchParams khi thay đổi | `frontend/components/posts/PostFilters.tsx` | | |
| TASK-017 | Tạo `CategoryCard` component — full-height card với ảnh nền (opacity 60%), gradient overlay từ dưới lên (`rgba(22,56,33,0.8)` → transparent), icon + tên category (Playfair SemiBold 24px, màu trắng); hover: scale 1.02; link đến `/posts?category=...` | `frontend/components/posts/CategoryCard.tsx` | | |
| TASK-018 | Tạo `PostGallery` component — layout grid: ảnh lớn bên trái (2/3 width) + 4 ảnh nhỏ bên phải (2x2 grid); click để mở lightbox; rounded-15 | `frontend/components/posts/PostGallery.tsx` | | |
| TASK-019 | Tạo `ApplicationPanel` component (`'use client'`) — sidebar card "Trở thành người nhận": nút CTA "Đăng ký nhận đồ" (bg `#2D4F36`), note text, danh sách đăng ký (avatar + tên + role + số lượng); chỉ hiện khi status = `available`; gọi API apply | `frontend/components/posts/ApplicationPanel.tsx` | | |
| TASK-020 | Tạo `PostStats` component — 3 boxes inline: Số lượng / Tình trạng / Loại đồ; border, icon, label, value | `frontend/components/posts/PostStats.tsx` | | |
| TASK-021 | Tạo `CommentSection` component (`'use client'`) — textarea input, danh sách bình luận với avatar + tên + thời gian + nội dung; reply indicator | `frontend/components/posts/CommentSection.tsx` | | |

---

### Phase 4: News Feature Components

- **GOAL-005**: Tạo `NewsCard` component cho trang chủ và trang tin tức

| Task | Description | File | Completed | Date |
|------|-------------|------|-----------|------|
| TASK-022 | Tạo `NewsCard` component — ảnh bìa (aspect 16/9, rounded-15), category badge (màu theo loại: Sự kiện/orange, Kinh nghiệm/teal, Câu chuyện/green), title, description snippet; link đến `/news/[id]` | `frontend/components/news/NewsCard.tsx` | | |

---

### Phase 5: Home Page (`/`)

- **GOAL-006**: Rebuild trang chủ theo đúng Figma — Hero, Categories, Latest Posts, News Section, Footer

| Task | Description | File | Completed | Date |
|------|-------------|------|-----------|------|
| TASK-023 | **Hero Section**: bg `#2D4F36`, border-radius 24px; overlay image (mix-blend-overlay, opacity 30%); title "Lá lành đùm lá rách" (Playfair Bold 48px, trắng); subtitle (Be Vietnam Pro 18px, `#a9d0af`); SearchBar bên dưới (pill shape, max-width 512px) | `frontend/app/(public)/page.tsx` | | |
| TASK-024 | **Section Danh mục chia sẻ**: heading với border-bottom; grid 4 cột dùng `CategoryCard` (height 255px) với ảnh placeholder categories | `frontend/app/(public)/page.tsx` | | |
| TASK-025 | **Section Bài đăng mới nhất**: heading + link "Xem tất cả →"; grid 3 cột `PostCard`; fetch 3 bài mới nhất từ `fetchPosts({ limit: 3 })` | `frontend/app/(public)/page.tsx` | | |
| TASK-026 | **Section Bản tin cộng đồng**: heading; grid 3 cột `NewsCard`; fetch 3 tin tức mới nhất (dùng API news khi có, fallback mock data) | `frontend/app/(public)/page.tsx` | | |
| TASK-027 | Xóa toàn bộ nội dung cũ của `page.tsx` (các section Hero cũ dùng lucide icons), thay bằng layout mới theo Figma | `frontend/app/(public)/page.tsx` | | |

---

### Phase 6: Posts Page (`/posts` — Diễn đàn)

- **GOAL-007**: Rebuild trang diễn đàn theo Figma — sidebar filter + grid bài đăng + sort + load more

| Task | Description | File | Completed | Date |
|------|-------------|------|-----------|------|
| TASK-028 | Layout 2 cột: sidebar `PostFilters` (220px fixed, bên trái) + main content (flex-1 bên phải); title "Cộng đồng cho tặng" (Playfair Bold); sort dropdown "Mới nhất" bên phải | `frontend/app/(public)/posts/page.tsx` | | |
| TASK-029 | Main grid: 3 cột `PostCard`; dùng Server Component fetch; hiển thị total count | `frontend/app/(public)/posts/page.tsx` | | |
| TASK-030 | "Tải thêm bài đăng" button (outlined, centered, rounded-full) — client-side pagination hoặc link to next page | `frontend/app/(public)/posts/page.tsx` | | |

---

### Phase 7: Post Detail Page (`/posts/[id]`)

- **GOAL-008**: Rebuild trang chi tiết bài đăng theo Figma — gallery, stats, description, sidebar panel, comments

| Task | Description | File | Completed | Date |
|------|-------------|------|-----------|------|
| TASK-031 | Tạo/Rebuild `page.tsx` — fetch post by ID (Server Component); breadcrumb "Đồ dùng học tập › TP. Hồ Chí Minh"; title (Playfair Bold); author row (Avatar + tên + online dot + "Đăng X ngày trước") + share/bookmark icons | `frontend/app/(public)/posts/[id]/page.tsx` | | |
| TASK-032 | Tích hợp `PostGallery` (ảnh thực tế từ post.images); `PostStats` (số lượng, tình trạng, loại đồ) | `frontend/app/(public)/posts/[id]/page.tsx` | | |
| TASK-033 | Section "Câu chuyện chia sẻ" — body text từ post.description | `frontend/app/(public)/posts/[id]/page.tsx` | | |
| TASK-034 | Right sidebar (sticky): `ApplicationPanel` — "Trở thành người nhận" card (chỉ hiện với NGO/Individual đã verify); phần "Danh sách đăng ký" (N) với icon + tên + role + badge | `frontend/app/(public)/posts/[id]/page.tsx` | | |
| TASK-035 | Section "Bình luận (N)": `CommentSection` — textarea, submit button, danh sách comment | `frontend/app/(public)/posts/[id]/page.tsx` | | |
| TASK-036 | Layout: 2 cột — main content (2/3) + sidebar (1/3, sticky top-4); responsive collapse sidebar xuống dưới trên mobile | `frontend/app/(public)/posts/[id]/page.tsx` | | |

---

### Phase 8: Profile Page (`/profile/[id]`)

- **GOAL-009**: Rebuild trang profile theo Figma — header info, stats, received history, feedback gallery

| Task | Description | File | Completed | Date |
|------|-------------|------|-----------|------|
| TASK-037 | Tạo/Rebuild `page.tsx` — fetch user by ID (Server Component); Avatar (xl, 80px); tên + badge (verified individual badge "Hoàn cảnh khó khăn — Đã xác thực" màu xanh nhạt, hoặc tích xanh NGO); location với pin icon | `frontend/app/(public)/profile/[id]/page.tsx` | | |
| TASK-038 | Bio/quote box — bordered card với quote text | `frontend/app/(public)/profile/[id]/page.tsx` | | |
| TASK-039 | Stats row: 2 box — "Lá đã nhận" (số + leaf icon), "Món đồ đã nhận" (số + box icon) | `frontend/app/(public)/profile/[id]/page.tsx` | | |
| TASK-040 | Section "Lịch sử nhận đồ" — list items: thumbnail + tên đồ + người tặng + "Đã nhận thành công" badge | `frontend/app/(public)/profile/[id]/page.tsx` | | |
| TASK-041 | Section "Ảnh cảm ơn (Feedback)" — subtitle, 3-column photo grid | `frontend/app/(public)/profile/[id]/page.tsx` | | |
| TASK-042 | Tạo `ProfileHeader` component tái sử dụng (nếu cần dùng ở nhiều nơi) | `frontend/components/profile/ProfileHeader.tsx` | | |

---

### Phase 9: Admin Dashboard (`/admin`)

- **GOAL-010**: Rebuild Admin UI theo Figma — sidebar, stats, tabbed user management, NGO approval

| Task | Description | File | Completed | Date |
|------|-------------|------|-----------|------|
| TASK-043 | Tạo admin home page `page.tsx` — title "Quản lý User" + bell icon; 3 `StatsCard`: Chờ duyệt / NGO Mới / Bài viết mới | `frontend/app/admin/page.tsx` | | |
| TASK-044 | 3 tabs (`'use client'`): "Duyệt tài khoản cá nhân khó khăn", "Duyệt NGO", "Danh sách User"; active tab có underline `#2D4F36` | `frontend/app/admin/page.tsx` | | |
| TASK-045 | Tab "Duyệt tài khoản cá nhân khó khăn" — list approval cards: avatar + tên + ngày tạo + địa chỉ + badge "Đang chờ", box "Hoàn cảnh:", 2 document images, buttons "Phê duyệt" (filled) + "Từ chối" (outlined) | `frontend/components/admin/VerificationCard.tsx` | | |
| TASK-046 | Tab "Duyệt NGO" — tương tự tab trên nhưng dùng API NGO verification | `frontend/components/admin/NgoApprovalCard.tsx` | | |
| TASK-047 | Tab "Danh sách User" — table view: columns (Avatar + Tên, Email, Role badge, Status, Actions); pagination | `frontend/components/admin/UserTable.tsx` | | |
| TASK-048 | Connect tất cả admin actions với API (`/api/v1/admin/users/verification-requests/:id/approve`, `/reject`, `/ngo-status`) | `frontend/app/admin/page.tsx` | | |

---

### Phase 10: Backend Additions (nếu cần)

- **GOAL-011**: Thêm News/Blog API vào backend nếu frontend cần hiển thị bản tin cộng đồng

| Task | Description | File | Completed | Date |
|------|-------------|------|-----------|------|
| TASK-049 | Tạo `NewsPost` Mongoose model — fields: `title`, `thumbnail` (URL), `content` (markdown), `category` (enum: announcement/story/guide/event), `status` (draft/published/hidden), `publishedAt`, `author` (ref User), `isPinned` | `backend/src/models/NewsPost.js` | | |
| TASK-050 | Tạo `newsRoutes.js` — GET `/api/v1/news` (public, filter published + pinned first), GET `/api/v1/news/:id` (public) | `backend/src/routes/newsRoutes.js` | | |
| TASK-051 | Tạo admin news routes — POST/PATCH/DELETE `/api/v1/admin/news`, PATCH `/api/v1/admin/news/:id/toggle-pin` | `backend/src/routes/adminNewsRoutes.js` | | |
| TASK-052 | Tạo `newsController.js` — listNews, getNews, createNews, updateNews, deleteNews, togglePin | `backend/src/controllers/newsController.js` | | |
| TASK-053 | Cập nhật `models.md` và `list_apis.md` với News model + endpoints mới | `models.md`, `list_apis.md` | | |
| TASK-054 | Tạo `frontend/lib/api/news.ts` — fetchNews(), fetchNewsById() | `frontend/lib/api/news.ts` | | |

---

## 3. Alternatives

- **ALT-001**: Dùng shadcn/ui cho primitive components — không chọn vì muốn giữ dependency tối thiểu, custom theo Figma
- **ALT-002**: Tách riêng Admin vào Next.js app khác — không chọn vì monorepo đơn giản hơn với scale hiện tại

---

## 4. Dependencies

- **DEP-001**: `tailwindcss` v4 — styling chính
- **DEP-002**: `lucide-react` — icons (Search, MapPin, Clock, Share, Bookmark, Bell, ChevronDown...)
- **DEP-003**: `clsx` + `tailwind-merge` — conditional class utility (`cn()`)
- **DEP-004**: Google Fonts: `Playfair Display` + `Be Vietnam Pro` — load qua `next/font/google`
- **DEP-005**: Backend API — tất cả data fetch qua các endpoints đã có + news endpoints mới

---

## 5. Files

### Frontend — New Files

- **FILE-001**: `frontend/components/ui/Button.tsx`
- **FILE-002**: `frontend/components/ui/Badge.tsx`
- **FILE-003**: `frontend/components/ui/Avatar.tsx`
- **FILE-004**: `frontend/components/ui/SearchBar.tsx`
- **FILE-005**: `frontend/components/ui/SectionHeading.tsx`
- **FILE-006**: `frontend/components/ui/StatsCard.tsx`
- **FILE-007**: `frontend/components/layout/Navbar.tsx`
- **FILE-008**: `frontend/components/layout/Footer.tsx`
- **FILE-009**: `frontend/components/layout/MainLayout.tsx`
- **FILE-010**: `frontend/components/layout/AdminSidebar.tsx`
- **FILE-011**: `frontend/components/posts/PostCard.tsx`
- **FILE-012**: `frontend/components/posts/PostFilters.tsx`
- **FILE-013**: `frontend/components/posts/CategoryCard.tsx`
- **FILE-014**: `frontend/components/posts/PostGallery.tsx`
- **FILE-015**: `frontend/components/posts/ApplicationPanel.tsx`
- **FILE-016**: `frontend/components/posts/PostStats.tsx`
- **FILE-017**: `frontend/components/posts/CommentSection.tsx`
- **FILE-018**: `frontend/components/news/NewsCard.tsx`
- **FILE-019**: `frontend/components/profile/ProfileHeader.tsx`
- **FILE-020**: `frontend/components/admin/VerificationCard.tsx`
- **FILE-021**: `frontend/components/admin/NgoApprovalCard.tsx`
- **FILE-022**: `frontend/components/admin/UserTable.tsx`
- **FILE-023**: `frontend/lib/api/news.ts`

### Frontend — Modified Files

- **FILE-024**: `frontend/app/globals.css` — update design tokens
- **FILE-025**: `frontend/app/layout.tsx` — add Playfair Display + Be Vietnam Pro fonts
- **FILE-026**: `frontend/lib/utils.ts` — add `cn()` utility
- **FILE-027**: `frontend/app/(public)/page.tsx` — rebuild home page
- **FILE-028**: `frontend/app/(public)/posts/page.tsx` — rebuild posts page
- **FILE-029**: `frontend/app/(public)/posts/[id]/page.tsx` — rebuild post detail
- **FILE-030**: `frontend/app/(public)/profile/[id]/page.tsx` — rebuild profile page
- **FILE-031**: `frontend/app/admin/layout.tsx` — add sidebar layout
- **FILE-032**: `frontend/app/admin/page.tsx` — rebuild admin dashboard

### Backend — New Files (Phase 10)

- **FILE-033**: `backend/src/models/NewsPost.js`
- **FILE-034**: `backend/src/routes/newsRoutes.js`
- **FILE-035**: `backend/src/routes/adminNewsRoutes.js`
- **FILE-036**: `backend/src/controllers/newsController.js`

---

## 6. Design Tokens Reference

```css
/* Exact values extracted from Figma */
--brand-dark:     #2D4F36;   /* Primary — nav bg, CTA buttons, headings */
--brand-darker:   #163821;   /* Section headings, hover states */
--brand-light:    #C5D9B8;   /* Category card bg, light badges */
--brand-muted:    #a9d0af;   /* Subtitle text on dark bg */
--bg-cream:       #FAFAF5;   /* Page background */
--bg-warm:        #F9E4C8;   /* Warm accent sections */
--border-green:   rgba(22,56,33,0.1);  /* Card/section borders */
--text-muted:     #727971;   /* Placeholder, secondary text */

/* Typography */
font-heading: 'Playfair Display', serif;   /* 24px–48px, weights 600–700 */
font-body: 'Be Vietnam Pro', sans-serif;   /* 14px–18px, weights 400–600 */

/* Border radius */
--radius-card:    15px;    /* Post cards, category cards */
--radius-hero:    24px;    /* Hero section */
--radius-pill:    9999px;  /* Buttons, badges */
```

---

## 7. Shared Components Summary

| Component | Location | Used In | Type |
|-----------|----------|---------|------|
| `Navbar` | `components/layout/` | All public pages | Client |
| `Footer` | `components/layout/` | All public pages | Server |
| `MainLayout` | `components/layout/` | All public pages | Server |
| `AdminSidebar` | `components/layout/` | Admin pages | Client |
| `Button` | `components/ui/` | All pages | Server |
| `Badge` | `components/ui/` | PostCard, Profile, Admin | Server |
| `Avatar` | `components/ui/` | PostCard, PostDetail, Profile, Admin | Server |
| `SearchBar` | `components/ui/` | Home, Posts | Client |
| `SectionHeading` | `components/ui/` | Home, Posts | Server |
| `StatsCard` | `components/ui/` | Admin Dashboard | Server |
| `PostCard` | `components/posts/` | Home, Posts | Server |
| `PostFilters` | `components/posts/` | Posts page sidebar | Client |
| `CategoryCard` | `components/posts/` | Home categories | Server |
| `PostGallery` | `components/posts/` | Post Detail | Client |
| `ApplicationPanel` | `components/posts/` | Post Detail sidebar | Client |
| `PostStats` | `components/posts/` | Post Detail | Server |
| `CommentSection` | `components/posts/` | Post Detail | Client |
| `NewsCard` | `components/news/` | Home, News page | Server |
| `ProfileHeader` | `components/profile/` | Profile page | Server |
| `VerificationCard` | `components/admin/` | Admin > Verifications | Client |
| `NgoApprovalCard` | `components/admin/` | Admin > NGO | Client |
| `UserTable` | `components/admin/` | Admin > Users | Client |

---

## 8. Testing

- **TEST-001**: Build pass — `npm run build` trong `frontend/` không có lỗi TypeScript
- **TEST-002**: Lint pass — `npm run lint` trong `frontend/` không có warnings
- **TEST-003**: Visual check Home — Hero section đúng màu `#2D4F36`, font Playfair Display hiển thị đúng
- **TEST-004**: Visual check Posts — Sidebar filter hoạt động, cards hiển thị đúng condition badge
- **TEST-005**: Visual check Post Detail — Gallery, ApplicationPanel, Comments hiển thị đúng
- **TEST-006**: Visual check Profile — Badge verified individual/NGO hiển thị đúng
- **TEST-007**: Visual check Admin — Sidebar navigation, tabs, approval cards hoạt động
- **TEST-008**: Responsive — All pages kiểm tra trên mobile (375px), tablet (768px), desktop (1280px)

---

## 9. Risks & Assumptions

- **RISK-001**: Google Fonts (Playfair Display, Be Vietnam Pro) có thể chậm — dùng `next/font/google` với `display: 'swap'` để mitigate
- **RISK-002**: Trang admin hiện có `users/` và `verifications/` folders riêng — cần kiểm tra trước khi gộp vào admin page chính
- **ASSUMPTION-001**: Backend API đã stable, không cần thay đổi ngoài news endpoints
- **ASSUMPTION-002**: Ảnh trong Figma (danh mục, hero) sẽ dùng ảnh thật từ database hoặc placeholder tạm thời
- **ASSUMPTION-003**: Tính năng Chat (real-time) nằm ngoài scope plan này
- **ASSUMPTION-004**: Wishlist page (`/wishlist`), Leaderboard page (`/leaderboard`), News page (`/news`) sẽ được implement ở plan tiếp theo

---

## 10. Related Specifications / Further Reading

- [requirement.txt](requirement.txt) — Tài liệu yêu cầu đầy đủ
- [list_apis.md](list_apis.md) — Danh sách tất cả API endpoints
- [models.md](models.md) — Mongoose models schema
- [Figma Design File](https://www.figma.com/design/ccDYMreDqRnUMAjrHGP6Tg/Untitled)
