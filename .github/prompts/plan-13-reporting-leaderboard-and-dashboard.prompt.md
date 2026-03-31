# Reporting, Leaderboard, and Admin Dashboard

## 🎯 Goal
Implement leaderboard read models, admin reporting endpoints, and the refresh job used to keep leaderboard data current.

## ⚠️ Depends On
- plan-02-user-verification-audit-models.prompt.md
- plan-05-post-quota-notification-models.prompt.md
- plan-07-post-crud-status-apis.prompt.md

## 📋 Files to Create/Modify
- backend/src/models/LeaderboardSnapshot.js
- backend/src/controllers/reportingController.js
- backend/src/routes/reportingRoutes.js
- backend/src/jobs/leaderboardJob.js
- backend/src/routes/index.js

## 📎 Shared Context
#file:_context.prompt.md
#file:requirement.txt
#file:backend/src/models/AuditLog.js

## 📐 Implementation Details
- Create `LeaderboardSnapshot` with unique `monthKey`, ranking array, `generatedAt`, and `finalizedAt`.
- Add public endpoints for `GET /leaderboard/current` and `GET /leaderboard/history`.
- Add admin endpoints for dashboard summary, audit-log listing, and posts pending completion review.
- The dashboard summary should aggregate useful counts such as pending verification requests, active posts by status, and completion queue size.
- Create `backend/src/jobs/leaderboardJob.js` with a recompute function that can be called by cron or manually. Use UTC month boundaries.
- Keep the route file focused on reporting and admin reporting APIs only.

## ✅ Acceptance Criteria
- [ ] The backend can read the current leaderboard from `LeaderboardSnapshot`.
- [ ] The backend can return historical leaderboard snapshots.
- [ ] Admin summary endpoint returns moderation and workflow counts.
- [ ] Admin can query audit logs and pending-completion posts.
- [ ] There is a reusable leaderboard refresh function suitable for a cron job.