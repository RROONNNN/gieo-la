# Post CRUD and Status APIs

## 🎯 Goal
Implement post creation, browsing, editing, moderation, and status transitions for the donor workflow.

## ⚠️ Depends On
- plan-01-foundation-bootstrap.prompt.md
- plan-03-auth-api-core.prompt.md
- plan-05-post-quota-notification-models.prompt.md
- plan-06-media-upload-pipeline.prompt.md

## 📋 Files to Create/Modify
- backend/src/controllers/postController.js
- backend/src/services/postService.js
- backend/src/routes/postRoutes.js
- backend/src/validators/postValidators.js
- backend/src/routes/index.js

## 📎 Shared Context
#file:_context.prompt.md
#file:requirement.txt
#file:backend/src/models/Post.js
#file:backend/src/models/User.js

## 📐 Implementation Details
- Add endpoints for create, list, detail, update, delete, status change, and pin or unpin.
- Create list filtering for keyword, category, status, author, and pinned state. Support pagination or cursor-style parameters if practical.
- Restrict create, update, and delete to the post owner. Restrict pinning to admin.
- Restrict `hoan_thanh` transitions to admin only.
- Keep status transitions explicit and validated. Do not allow arbitrary jumps.
- Use `backend/src/services/postService.js` for query composition, normalized search text, and transition logic.
- Use upload helpers for image metadata when images are included.
- Mount the router from `backend/src/routes/index.js`.

## ✅ Acceptance Criteria
- [ ] Authenticated donors can create, update, and delete their own posts.
- [ ] Public clients can list and view posts with filters.
- [ ] Invalid status jumps are rejected.
- [ ] Only admin can pin posts or move a post to `hoan_thanh`.
- [ ] Search and filter parameters are validated before querying MongoDB.