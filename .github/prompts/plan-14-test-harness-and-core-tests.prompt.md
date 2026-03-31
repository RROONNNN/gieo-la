# Test Harness and Core API Tests

## 🎯 Goal
Set up automated API testing and cover the core auth, post, application, and admin content workflows.

## ⚠️ Depends On
- plan-03-auth-api-core.prompt.md
- plan-04-verification-admin-user-apis.prompt.md
- plan-07-post-crud-status-apis.prompt.md
- plan-09-application-selection-and-completion.prompt.md
- plan-11-wishlist-feature.prompt.md
- plan-12-news-feature.prompt.md
- plan-13-reporting-leaderboard-and-dashboard.prompt.md

## 📋 Files to Create/Modify
- backend/package.json
- backend/tests/setup.js
- backend/tests/auth-and-profile.test.js
- backend/tests/posts-and-applications.test.js
- backend/tests/content-and-admin.test.js

## 📎 Shared Context
#file:_context.prompt.md
#file:backend/package.json

## 📐 Implementation Details
- Add the test runner and HTTP test dependencies needed for integration-style API tests.
- Create a shared `backend/tests/setup.js` that boots the app against a test database or in-memory MongoDB instance.
- Add `auth-and-profile.test.js` for register, login, auth guard, and current-user flows.
- Add `posts-and-applications.test.js` for post CRUD, status transitions, application creation, selection, quota enforcement, reopen behavior, and completion flow.
- Add `content-and-admin.test.js` for verification approvals, wishlist, news, leaderboard reads, and admin dashboard endpoints.
- Keep tests focused on API contracts and authorization boundaries, not UI behavior.

## ✅ Acceptance Criteria
- [ ] `backend/package.json` can run the automated test suite with one command.
- [ ] Test setup can boot the backend in isolation.
- [ ] Auth tests cover both success and failure cases.
- [ ] Post and application tests cover quota and single-recipient selection rules.
- [ ] Content and admin tests cover verification, wishlist, news, and reporting routes.