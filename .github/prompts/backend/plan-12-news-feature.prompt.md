# Community News Feature

## 🎯 Goal
Implement admin-managed community news posts plus public news and homepage summary endpoints.

## ⚠️ Depends On
- plan-01-foundation-bootstrap.prompt.md
- plan-03-auth-api-core.prompt.md
- plan-06-media-upload-pipeline.prompt.md

## 📋 Files to Create/Modify
- backend/src/models/NewsPost.js
- backend/src/controllers/newsController.js
- backend/src/routes/newsRoutes.js
- backend/src/routes/index.js

## 📎 Shared Context
#file:_context.prompt.md
#file:requirement.txt

## 📐 Implementation Details
- Create `NewsPost` with title, slug, thumbnail metadata, excerpt, markdown content, sanitized HTML, category, status, published date, author, and pin state.
- Admin-only endpoints must support create, update, delete, status change, and pin or unpin.
- Public endpoints must support list, detail by slug or ID, and homepage latest-news summary.
- Public list results must include only published news.
- Pinned published items should appear first, then newest by `publishedAt`.
- Reject comments entirely for this content type.

## ✅ Acceptance Criteria
- [ ] Admin can create, edit, hide, publish, and pin news posts.
- [ ] Public clients can list only published posts.
- [ ] Public detail works by slug or ID.
- [ ] A latest-home endpoint returns the newest published items for the homepage section.