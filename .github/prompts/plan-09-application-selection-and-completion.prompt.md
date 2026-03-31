# Application Selection and Completion Flow

## 🎯 Goal
Implement applying to receive, recipient selection, quota enforcement, reopen handling, and completion proof flow.

## ⚠️ Depends On
- plan-02-user-verification-audit-models.prompt.md
- plan-05-post-quota-notification-models.prompt.md
- plan-07-post-crud-status-apis.prompt.md
- plan-08-chat-domain-models.prompt.md

## 📋 Files to Create/Modify
- backend/src/controllers/postApplicationController.js
- backend/src/services/applicationService.js
- backend/src/services/quotaService.js
- backend/src/routes/postApplicationRoutes.js
- backend/src/routes/index.js

## 📎 Shared Context
#file:_context.prompt.md
#file:requirement.txt
#file:backend/src/models/PostApplication.js
#file:backend/src/models/MonthlyQuota.js
#file:backend/src/models/Conversation.js

## 📐 Implementation Details
- Implement apply, applicant list, select, reject, withdraw, reopen, proof submission, donor mark-delivered, and admin complete endpoints.
- Enforce UTC month quota with `MonthlyQuota`.
- Use the stricter permission rule from the requirements table: regular `member` accounts do not apply to receive items unless product requirements are clarified later.
- Applicant ordering should prioritize verified NGO first and verified individuals next.
- Recipient selection must be atomic so only one application can be selected per post.
- On selection, update the post to `dang_giao_dich`, mark the chosen application, reject the rest, create notifications, and create or retrieve a `Conversation` using the sorted donor and recipient participant IDs.
- On reopen, move the post back to `san_sang`, clear selection fields, and create an `AuditLog` entry.
- On donor mark-delivered, move the post to `da_giao_dich`.
- On admin complete, move the post to `hoan_thanh` and update user counters needed for leaderboard and quotas.

## ✅ Acceptance Criteria
- [ ] Verified individuals are capped at `3` completed receives per UTC month.
- [ ] Verified NGOs are capped at `10` completed receives per UTC month.
- [ ] Only one application can be selected for a post.
- [ ] Selection creates or reuses a conversation by participant pair, not by post.
- [ ] Reopen action clears the current selection and records an audit trail.