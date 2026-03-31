# Post, Quota, and Notification Models

## 🎯 Goal
Create the core data models that power posts, applications, proof comments, monthly quotas, and notifications.

## ⚠️ Depends On
- plan-01-foundation-bootstrap.prompt.md
- plan-02-user-verification-audit-models.prompt.md

## 📋 Files to Create/Modify
- backend/src/models/Post.js
- backend/src/models/PostApplication.js
- backend/src/models/PostComment.js
- backend/src/models/MonthlyQuota.js
- backend/src/models/Notification.js

## 📎 Shared Context
#file:_context.prompt.md
#file:requirement.txt
#file:backend/src/models/User.js

## 📐 Implementation Details
- Create `Post` with author, category, quantity, condition, description, images metadata, status, selected application and recipient refs, pin state, location, and searchable text.
- Use status values `san_sang`, `dang_giao_dich`, `da_giao_dich`, and `hoan_thanh`.
- Create `PostApplication` with `postId`, `applicantId`, applicant role snapshot, motivation, priority bucket, status, selected or rejected timestamps, withdrawn timestamp, and `monthKey`.
- Add a unique index so one user cannot create duplicate applications for the same post.
- Create `PostComment` for general comments, feedback, and proof uploads. Include `type`, body, image metadata, and proof flags.
- Create `MonthlyQuota` with `userId`, `monthKey`, counters, role snapshot, and enforced limits.
- Create `Notification` with `userId`, type, title, body, payload, `readAt`, and timestamps.
- Add indexes that match the list and moderation queries called out in the master plan.

## ✅ Acceptance Criteria
- [ ] `Post` supports the full post lifecycle fields and selected recipient references.
- [ ] `PostApplication` enforces one application per user per post.
- [ ] `PostComment` can represent both normal comments and proof feedback.
- [ ] `MonthlyQuota` stores one row per user per UTC month.
- [ ] `Notification` supports unread and read tracking.