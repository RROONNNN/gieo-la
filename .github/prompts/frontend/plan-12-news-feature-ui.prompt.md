# Community News Feature UI

## 🎯 Goal
Build the public news/blog pages for community announcements and the admin news management interface for creating, editing, and publishing blog posts.

## ⚠️ Depends On
- FE plan-01-foundation-bootstrap (layout, UI primitives)
- FE plan-03-auth-pages-and-state (auth context, role guards)
- FE plan-06-media-upload-components (thumbnail upload)
- BE plan-12-news-feature (news endpoints)

## 📋 Files to Create/Modify
- frontend/app/(public)/news/page.tsx
- frontend/app/(public)/news/[slugOrId]/page.tsx
- frontend/app/(admin)/admin/news/page.tsx
- frontend/app/(admin)/admin/news/new/page.tsx
- frontend/app/(admin)/admin/news/[id]/edit/page.tsx
- frontend/lib/api/news.ts
- frontend/types/news.ts
- frontend/components/news/NewsCard.tsx
- frontend/components/news/NewsGrid.tsx
- frontend/components/news/NewsDetail.tsx
- frontend/components/news/NewsCategoryBadge.tsx
- frontend/components/news/NewsForm.tsx
- frontend/components/news/LatestNewsSection.tsx
- frontend/components/news/MarkdownRenderer.tsx

## 📎 Shared Context
#file:requirement.txt

## 📐 Implementation Details

### News Types (`types/news.ts`)
- Define `NewsCategory`: `announcement` (Thông báo), `story` (Câu chuyện cảm hứng), `guide` (Hướng dẫn sử dụng), `event` (Hoạt động cộng đồng).
- Define `NewsStatus`: `draft`, `published`, `hidden`.
- Define `NewsPost` interface with: `_id`, `title`, `slug`, `thumbnail` (ImageMeta), `excerpt`, `contentMarkdown`, `contentHtml`, `category`, `status`, `publishedAt`, `authorId`, `author?`, `isPinned`, `createdAt`, `updatedAt`.
- Define `CreateNewsInput` and `UpdateNewsInput`.

### API Layer (`lib/api/news.ts`)
- Public: `getNews(filters?)`, `getNewsDetail(slugOrId)`, `getLatestNewsForHome()`.
- Admin: `createNews(data)`, `updateNews(id, data)`, `deleteNews(id)`, `changeNewsStatus(id, status)`, `pinNews(id)`, `unpinNews(id)`.

### Public News Page (`/news`)
- Server Component for SEO and performance.
- List of published news posts, newest first. Pinned posts at top with "Ghim" badge.
- Category filter tabs: Thông báo, Câu chuyện, Hướng dẫn, Hoạt động.
- `NewsCard`: Thumbnail, title, category badge, publish date, excerpt.
- Pagination.

### News Detail (`/news/[slugOrId]`)
- Server Component with dynamic metadata for SEO (title, description, OG image from thumbnail).
- Full article view: thumbnail hero, title, category badge, publish date, "Ban quản trị Lá Lành" author line.
- Rendered markdown content (sanitized HTML).
- No comment section (per requirements).

### MarkdownRenderer
- Render sanitized markdown/HTML content with proper typography styling.
- Support images, headings, lists, links, blockquotes within content.
- Use Tailwind Typography plugin or custom styled prose.

### Latest News Section (Homepage)
- `LatestNewsSection`: Display 3 most recent published news posts as cards.
- "Xem tất cả" button linking to `/news`.
- Used in the homepage (plan-07).

### Admin News Management (`/admin/news`)
- List of all news posts (drafts, published, hidden) with status filters.
- Actions: create, edit, delete, publish/hide, pin/unpin.
- `NewsForm`: title, thumbnail upload, excerpt, markdown content editor, category select, save as draft or publish.
- Markdown editor component with preview toggle.

### Dependencies to Add
- `react-markdown` or `@tailwindcss/typography` for content rendering.
- A lightweight markdown editor component (e.g., `@uiw/react-md-editor` or a simple textarea with preview).

## ✅ Acceptance Criteria
- [ ] Public users (including guests) can browse and read news posts.
- [ ] News detail page renders markdown content with proper formatting.
- [ ] News detail page has SEO metadata (title, description, OG image).
- [ ] Pinned news posts appear at the top with a "Ghim" badge.
- [ ] Category filter tabs work correctly.
- [ ] Admin can create, edit, publish, hide, and delete news posts.
- [ ] Admin can save news as draft before publishing.
- [ ] Admin can pin/unpin news posts.
- [ ] Homepage "Bản tin mới nhất" section displays 3 latest published articles.
- [ ] No comment functionality exists on news posts.
