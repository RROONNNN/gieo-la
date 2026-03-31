# Backend Implementation Plan: La Lanh

I saved the backend plan to session memory and aligned it to the current code in [backend/src/app.js](backend/src/app.js#L1), [backend/src/config/db.js](backend/src/config/db.js#L1), [backend/src/models/User.js](backend/src/models/User.js#L1), [backend/src/controllers/authController.js](backend/src/controllers/authController.js#L1), [backend/src/utils/generateToken.js](backend/src/utils/generateToken.js#L1), and [backend/package.json](backend/package.json#L1). The recommended defaults locked in are Cloudinary for media, Socket.IO for realtime, UTC month boundaries for quotas, and allowing a post to reopen from Đang giao dịch back to Sẵn sàng with an audit log.

## Plan

1. Foundation phase. Refactor app bootstrap, validate env config, mount versioned routes under /api/v1, add auth and RBAC middleware, centralized error handling, request logging, Helmet, rate limiting, upload limits, graceful shutdown, and tuned MongoDB connection settings. This blocks all other work.
2. Domain phase. Replace the current minimal user shape with explicit role, verification, status, and profile state, then add the missing models for posts, applications, comments/proof, chat, notifications, wishlist, news, quotas, leaderboard snapshots, and audit logs. Indexes should be designed here before controller work begins.
3. Auth and profile phase. Wire the existing register and login logic into real routes, add current-user and profile update APIs, add verification submission for individuals and NGOs, and add admin approval, rejection, account lock, and NGO verification actions.
4. Post transaction phase. Build post CRUD, image upload, search and filtering, status transitions, donor-only applicant review, recipient selection, rejection notifications, reopen flow, proof upload, donor delivery confirmation, and admin completion approval. Recipient selection and completion transitions should use atomic updates or transactions.
5. Realtime phase. Add persisted notifications plus Socket.IO-backed chat and unread state. HTTP APIs should remain the source of truth, with sockets used for delivery only.
6. Content and leaderboard phase. Implement NGO wishlist APIs, admin news/blog APIs, public news feed, homepage latest-news endpoint, current and historical leaderboard endpoints, and admin dashboard summary and audit log queries. This can run in parallel with chat once post-selection flows are stable.
7. Hardening phase. Add API tests, authorization tests, quota tests, race-condition tests, seed data, structured logs, and explain-plan checks for the main MongoDB queries.

## Schemas
- User: name, email, passwordHash, role, accountStatus, avatar, contact and location, NGO profile, individual profile, verification flags, current badge, counters, and lastLoginAt.
- VerificationRequest: userId, type, submitted documents, status, reviewer, review time, rejection reason, and notes.
- Post: authorId, category, quantity, condition, description, images, status, selectedApplicationId, selectedRecipientId, location, searchText, pin state, timestamps, and moderation metadata.
- PostApplication: postId, applicantId, applicant role snapshot, motivation, priority bucket, status, selected and rejected timestamps, withdrawn timestamp, and monthKey.
- PostComment: postId, authorId, type, body, images, and proof-evidence flag.
- Conversation: participantIds (sorted pair of two userIds, unique), openedAt, lastMessageAt, lastMessagePreview, and status. Not bound to any post or application.
- Message: conversationId, senderId, body, attachments, sentAt, readBy, and deletedAt.
- Notification: userId, type, title, body, payload, readAt, and createdAt.
- Wishlist: ngoId, title, category, quantity, purpose, description, media, status, and pin state.
- NewsPost: title, slug, thumbnail, excerpt, contentMarkdown, sanitized HTML, category, status, publishedAt, authorId, and pin state.
- MonthlyQuota: userId, monthKey, applicationCount, completedReceiveCount, role snapshot, and enforced limits.
- LeaderboardSnapshot: monthKey, rankings array, generatedAt, and finalizedAt.
- AuditLog: actorId, action, targetType, targetId, metadata, ip, userAgent, and createdAt.

## APIs and Ops

- Auth and account: POST /api/v1/auth/register-member, POST /api/v1/auth/register-ngo, POST /api/v1/auth/register-individual, POST /api/v1/auth/login, GET /api/v1/auth/me, PATCH /api/v1/auth/me. Add refresh/logout only if the frontend truly needs long-lived sessions.
- Verification and admin user control: POST /api/v1/verification-requests, GET /api/v1/verification-requests/me, GET /api/v1/admin/verification-requests, PATCH approve or reject verification requests, PATCH NGO verification, PATCH account status.
- Posts and workflow: POST /api/v1/posts, GET /api/v1/posts, GET /api/v1/posts/:id, PATCH /api/v1/posts/:id, DELETE /api/v1/posts/:id, PATCH /api/v1/posts/:id/status, PATCH /api/v1/posts/:id/pin, GET /api/v1/posts/:id/applications, POST /api/v1/posts/:id/applications, select, reject, withdraw, reopen, comment, proof, and mark-delivered endpoints.
- Chat and notifications: GET conversations, GET conversation detail, GET messages, POST message, PATCH read state, GET notifications, PATCH single read, PATCH read-all.
- Wishlist, news, leaderboard, admin: full CRUD for NGO wishlist, public GET news and news detail, GET latest home news, admin news create/update/delete/status/pin, GET current leaderboard, GET leaderboard history, GET admin dashboard summary, GET audit logs, and GET posts pending completion.
- Performance recommendations: tune Mongoose pool settings, disable autoIndex in production, use explicit indexes, lean queries, projections, cursor pagination, normalized search fields, and Cloudinary metadata-only storage in MongoDB.
- Key indexes: unique email, post status plus category plus createdAt, unique application per post and user, unique conversation by sorted participantIds pair, message by conversation plus sentAt, notification by user plus readAt, news by status plus pin plus publishedAt, wishlist by status plus pin plus createdAt, unique monthKey per quota and leaderboard snapshot.
- Best practices: validate every request with Zod or Joi, sanitize markdown and HTML, cap upload count and size, validate ObjectIds, log admin actions, use transactions for recipient selection and completion, keep quota checks in a dedicated monthly collection, and start with node-cron for leaderboard refresh before introducing Redis-backed workers.

## Expanded Backend Plan

Build the backend as a modular Express + MongoDB service around role-based workflows, post matching, admin moderation, chat, notifications, leaderboard, wishlist, and community news. Keep the current CommonJS + Express + Mongoose stack, but formalize it with validation, RBAC, transactional workflows, upload handling, and MongoDB indexes so the API can scale beyond the current auth-only skeleton.

### Steps

1. Phase 1 — Backend foundation and cross-cutting concerns.
Add a centralized config layer for environment validation, split app bootstrap from server startup, mount versioned routes under /api/v1, add not-found and error middleware, add request logging, security headers, CORS allowlist, rate limiting, and consistent response/error envelopes. Update the Mongo connection setup with tuned pool settings, production-safe index behavior, graceful shutdown, and health/readiness checks. This phase blocks all feature work.
2. Phase 2 — Domain model expansion. Depends on 1.
Replace the minimal user schema with a role-aware account model and add the missing collections needed by the requirements: verification requests, posts, applications, feedback/comments, conversations, messages, notifications, wishlists, news posts, monthly quotas, leaderboard snapshots, and audit logs. Define indexes before controller work so APIs can rely on them.
3. Phase 3 — Authentication, authorization, and profile workflows. Depends on 2.
Wire the existing auth controller into real routes, add auth middleware, role guards, current-user endpoint, profile update endpoint, individual verification submission, NGO verification state, and admin approval/rejection actions. Keep the system stateless with JWT initially, but shorten access-token lifetime and expose refresh/logout only if the frontend needs persistent sessions.
4. Phase 4 — Post creation, discovery, and transaction lifecycle. Depends on 2 and 3.
Implement post CRUD, filters, search, upload pipeline, status transitions, pinning, and admin moderation. Enforce the agreed reopening rule so a post can move from Dang giao dich back to San sang with an audit trail when handoff fails.
5. Phase 5 — Registration, recipient selection, and proof-of-completion flow. Depends on 4.
Implement apply-to-receive, sorted applicant listing, quota enforcement, donor selection, rejection fan-out, notification creation, automatic chat provisioning, recipient proof upload, donor delivery confirmation, and admin completion approval. Use atomic updates or MongoDB transactions so only one recipient can be selected.
6. Phase 6 — Realtime chat and notification delivery. Depends on 5.
Add Socket.IO rooms for conversation delivery, typing/read receipts if desired, unread counters, persisted notifications, and message pagination. Design the HTTP APIs first and layer sockets on top so the system still works without a websocket client.
7. Phase 7 — Wishlist, news, leaderboard, and admin dashboard APIs. Depends on 2 and 3. Can run in parallel with 6 after 5 is stable.
Implement NGO-only wishlist management, admin news/blog management, public news feed, homepage news summary API, leaderboard current/history APIs, dashboard summary endpoints, and audit-log query endpoints.
8. Phase 8 — Verification, observability, and rollout hardening. Depends on all prior phases.
Add request validation tests, authorization tests, status-flow tests, quota tests, selection race-condition tests, upload validation, seed data, API docs, and operational guardrails such as structured logs and monitoring hooks.

### Schema Scope

- User.
Fields: name, email, passwordHash, role, accountStatus, profile avatar/contact/location, ngoProfile, individualProfile, verification flags, currentBadge, stats counters, lastLoginAt. Replace the current password field with passwordHash naming and split verification into explicit statuses instead of a single isVerified boolean.
- VerificationRequest.
Fields: userId, requestType (individual or ngo), submittedDocuments, note, status, reviewedBy, reviewedAt, rejectionReason. Keep document lifecycle separate from User so admin review remains auditable.
- Post.
Fields: authorId, category, quantity, conditionLabel, description, images, status, isPinned, selectedApplicationId, selectedRecipientId, location, searchText, visibility, handoff timestamps, completedAt, moderation metadata. Status enum should match the product terms: san_sang, dang_giao_dich, da_giao_dich, hoan_thanh.
- PostApplication.
Fields: postId, applicantId, applicantRoleSnapshot, motivation, priorityBucket, status, selectedAt, rejectedAt, withdrawnAt, monthKey. Enforce one active application per user per post.
- PostComment.
Fields: postId, authorId, type (comment, feedback, proof), body, images, isProofEvidence, createdAt. This handles recipient thank-you/proof content and general thread entries.
- Conversation.
Fields: participantIds (sorted pair of two userIds, unique constraint), openedAt, lastMessageAt, lastMessagePreview, status. A conversation is account-to-account only and is not bound to any post or application. The system provisions a conversation between donor and recipient when a recipient is selected, if one does not already exist between the two accounts.
- Message.
Fields: conversationId, senderId, body, attachments, sentAt, readBy, deletedAt. Keep attachment metadata only; binaries stay in Cloudinary.
- Notification.
Fields: userId, type, title, body, payload, readAt, createdAt. Persist all important workflow events so the frontend can show an inbox and unread badge.
- Wishlist.
Fields: ngoId, title, category, quantity, purpose, description, images or thumbnail, status, isPinned, createdAt, updatedAt. Keep it separate from Post because the actor intent is different.
- NewsPost.
Fields: title, slug, thumbnail, excerpt, contentMarkdown, contentHtmlSanitized, category, status, publishedAt, authorId, isPinned, hiddenAt. Store markdown source and a sanitized renderable version for read performance.
- MonthlyQuota.
Fields: userId, monthKey, applicationCount, completedReceiveCount, roleSnapshot, limits. Use this collection to enforce monthly receive limits without scanning full history on each request.
- LeaderboardSnapshot.
Fields: monthKey, rankings array, generatedAt, finalizedAt. Use for current-month quick reads and historical archives.
- AuditLog.
Fields: actorId, action, targetType, targetId, metadata, ip, userAgent, createdAt. Capture verification actions, moderation, post reopening, selection, and destructive admin changes.

### API Surface

- Auth and account.
POST /api/v1/auth/register-member
POST /api/v1/auth/register-ngo
POST /api/v1/auth/register-individual
POST /api/v1/auth/login
GET /api/v1/auth/me
PATCH /api/v1/auth/me
POST /api/v1/auth/logout if refresh tokens are introduced
POST /api/v1/auth/refresh if refresh tokens are introduced
- Verification and admin account control.
POST /api/v1/verification-requests
GET /api/v1/verification-requests/me
GET /api/v1/admin/verification-requests
PATCH /api/v1/admin/verification-requests/:id/approve
PATCH /api/v1/admin/verification-requests/:id/reject
PATCH /api/v1/admin/users/:id/ngo-verification
PATCH /api/v1/admin/users/:id/account-status
- Posts.
POST /api/v1/posts
GET /api/v1/posts
GET /api/v1/posts/:id
PATCH /api/v1/posts/:id
DELETE /api/v1/posts/:id
PATCH /api/v1/posts/:id/status
PATCH /api/v1/posts/:id/pin
GET /api/v1/posts/:id/applications
POST /api/v1/posts/:id/comments
GET /api/v1/posts/:id/comments
- Applications and selection.
POST /api/v1/posts/:id/applications
PATCH /api/v1/posts/:id/applications/:applicationId/select
PATCH /api/v1/posts/:id/applications/:applicationId/reject
PATCH /api/v1/posts/:id/applications/:applicationId/withdraw
PATCH /api/v1/posts/:id/reopen
- Feedback and completion.
POST /api/v1/posts/:id/proof
PATCH /api/v1/posts/:id/mark-delivered
PATCH /api/v1/admin/posts/:id/complete
- Chat and notifications.
GET /api/v1/conversations
POST /api/v1/conversations (start or retrieve a conversation with another user by userId)
GET /api/v1/conversations/:id
GET /api/v1/conversations/:id/messages
POST /api/v1/conversations/:id/messages
PATCH /api/v1/conversations/:id/read
GET /api/v1/notifications
PATCH /api/v1/notifications/:id/read
PATCH /api/v1/notifications/read-all
- Wishlist.
POST /api/v1/wishlists
GET /api/v1/wishlists
GET /api/v1/wishlists/:id
PATCH /api/v1/wishlists/:id
DELETE /api/v1/wishlists/:id
PATCH /api/v1/admin/wishlists/:id/pin
- News.
GET /api/v1/news
GET /api/v1/news/:slugOrId
GET /api/v1/news/latest/home
POST /api/v1/admin/news
PATCH /api/v1/admin/news/:id
DELETE /api/v1/admin/news/:id
PATCH /api/v1/admin/news/:id/status
PATCH /api/v1/admin/news/:id/pin
- Leaderboard and admin dashboard.
GET /api/v1/leaderboard/current
GET /api/v1/leaderboard/history
GET /api/v1/admin/dashboard/summary
GET /api/v1/admin/audit-logs
GET /api/v1/admin/posts/pending-completion

### Performance and Optimization

- MongoDB connection tuning.
Use maxPoolSize, minPoolSize, serverSelectionTimeoutMS, socketTimeoutMS, maxIdleTimeMS, retryWrites, and appName. Disable autoIndex in production and create indexes explicitly.
- Core indexes.
User: unique email, role plus accountStatus, verification status fields.
VerificationRequest: userId plus status plus createdAt.
Post: authorId plus createdAt, status plus createdAt, category plus status plus createdAt, isPinned plus createdAt, text or Atlas Search index on normalized search fields.
PostApplication: postId plus status plus priorityBucket, applicantId plus monthKey, unique postId plus applicantId.
PostComment: postId plus createdAt.
Conversation: unique sorted participantIds pair, lastMessageAt.
Message: conversationId plus sentAt.
Notification: userId plus readAt plus createdAt.
Wishlist: ngoId plus createdAt, status plus isPinned plus createdAt.
NewsPost: status plus isPinned plus publishedAt, slug unique.
MonthlyQuota: unique userId plus monthKey.
LeaderboardSnapshot: unique monthKey.
AuditLog: targetType plus targetId plus createdAt, actorId plus createdAt.
- Read performance.
Use lean queries and field projection on list endpoints, avoid unnecessary populate chains, precompute excerpts and counters, return cursor pagination for posts/news/messages, and keep current leaderboard in a compact snapshot document.
- Search.
If MongoDB Atlas Search is available, prefer it for Vietnamese text relevance and prefix matching. If not, start with normalized text-index fields and category filters.
- Upload pipeline.
Use Multer memory storage, MIME and size validation, image compression/resizing before upload, and Cloudinary folder separation for posts, verification docs, avatars, proofs, and news thumbnails. Only store metadata and transformed URLs in MongoDB.
- Concurrency control.
Use MongoDB transactions or atomic findOneAndUpdate conditions when selecting a recipient, reopening a post, marking delivered, or approving completion. Add idempotency protection to admin completion and selection endpoints.
- Background work.
Use node-cron for leaderboard refresh and stale-notification cleanup initially. If traffic grows or multiple instances are added, move jobs and websocket fan-out to Redis-backed workers.
- Security and resilience.
Add Helmet, request size limits, upload size limits, rate limiting for auth and messaging, ObjectId validation, input validation, HTML/Markdown sanitization, and structured logs. Keep secrets and Cloudinary credentials in validated env config.

### Recommended Package Additions

- Validation: zod or joi.
- Security and middleware: helmet, express-rate-limit, morgan or pino-http, http-status-codes.
- Uploads: multer, sharp, cloudinary.
- Realtime: socket.io.
- Jobs: node-cron initially.
- Testing: jest or vitest plus supertest.
- Optional if scaling later: redis, bullmq, @socket.io/redis-adapter.

### Relevant files

- /Users/mac/thuan_enosta/nodejs/gieo-la/backend/package.json — add runtime and test dependencies plus production scripts.
- /Users/mac/thuan_enosta/nodejs/gieo-la/backend/src/app.js — split bootstrap from server start, mount routes, middleware, and socket integration entry points.
- /Users/mac/thuan_enosta/nodejs/gieo-la/backend/src/config/db.js — add connection tuning, graceful shutdown, and production-safe index strategy.
- /Users/mac/thuan_enosta/nodejs/gieo-la/backend/src/models/User.js — replace the current minimal user shape with full role and verification state.
- /Users/mac/thuan_enosta/nodejs/gieo-la/backend/src/controllers/authController.js — keep register/login logic as a seed, but refactor into validated service-backed handlers.
- /Users/mac/thuan_enosta/nodejs/gieo-la/backend/src/utils/generateToken.js — shorten token lifetime and align payload strategy with role-based auth.
- New files under backend/src/models, backend/src/controllers, backend/src/routes, backend/src/middlewares, backend/src/services, backend/src/validators, backend/src/jobs, backend/src/sockets, and backend/src/utils — add all missing domain modules.

### Verification

1. Add API contract tests for auth, verification, post CRUD, application selection, status transitions, wishlist, news, leaderboard, and admin authorization.
2. Add race-condition coverage proving only one application can be selected for a post even under concurrent requests.
3. Add quota tests proving verified individuals are capped at 3 receives per month and NGOs at 10 per month using UTC month boundaries.
4. Add upload validation tests for max image counts, invalid MIME types, oversized files, and missing verification documents.
5. Add chat and notification tests proving conversations open only after selection and that notifications persist for selected and rejected applicants.
6. Validate Mongo indexes with explain plans for posts list, applications list, leaderboard read, conversation message pagination, and news feed.
7. Add a seed script for admin, member, NGO, verified individual, demo posts, applications, wishlists, and news posts so frontend work can start immediately.

### Decisions

- Media storage: Cloudinary.
- Realtime transport: Socket.IO.
- Failed handoff policy: allow reopening a post from Dang giao dich back to San sang, but require an audit-log entry and status-guard checks.
- Monthly quota reset boundary: UTC month boundary.
- Keep Wishlist as its own collection instead of overloading Post.
- Keep NewsPost as an admin-only content model with no comments.
- Prefer a separate MonthlyQuota collection instead of recalculating quotas from applications on every request.
- Start with node-cron and single-instance Socket.IO; treat Redis-backed scaling as a phase-two concern, not a phase-one blocker.

### Scope Boundaries

- Included: backend APIs, persistence design, upload strategy, realtime transport design, admin workflows, and operational recommendations.
- Excluded from this plan: frontend UI implementation, CI/CD pipeline authoring, payment or donation logistics outside the app, SMS integration, and multi-region deployment.

### Further Considerations

1. If the project will run on MongoDB Atlas, Atlas Search is worth enabling early because Vietnamese search quality will be noticeably better than the baseline text index.
2. If long-lived browser sessions are required, add refresh tokens with rotation and revocation storage; otherwise keep the first milestone on short-lived access JWTs only.
3. If admin moderation is expected to be heavy, add a dashboard queue model or saved filters later, but it is not required for the first backend milestone.
