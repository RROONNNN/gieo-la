# Test Setup & Core Component Tests

## 🎯 Goal
Set up the frontend testing infrastructure and write core tests for UI components, pages, auth flows, and API integration.

## ⚠️ Depends On
- FE plan-01 through plan-13 (all feature implementations)
- BE plan-14-test-harness-and-core-tests (backend test data)

## 📋 Files to Create/Modify
- frontend/package.json
- frontend/jest.config.ts (or vitest.config.ts)
- frontend/tests/setup.ts
- frontend/tests/mocks/handlers.ts
- frontend/tests/mocks/server.ts
- frontend/tests/mocks/data.ts
- frontend/tests/components/Button.test.tsx
- frontend/tests/components/PostCard.test.tsx
- frontend/tests/components/PostForm.test.tsx
- frontend/tests/pages/login.test.tsx
- frontend/tests/pages/posts.test.tsx
- frontend/tests/hooks/useAuth.test.ts
- frontend/tests/lib/api-client.test.ts
- frontend/tests/integration/auth-flow.test.tsx
- frontend/tests/integration/post-crud.test.tsx

## 📎 Shared Context
#file:frontend/package.json
#file:frontend/tsconfig.json

## 📐 Implementation Details

### Test Infrastructure
- Install and configure Vitest (or Jest) with React Testing Library and jsdom.
- Set up `tests/setup.ts` with global test utilities, custom render wrapper with providers (AuthContext, SocketContext).
- Configure path aliases to match `@/*` in tsconfig.

### API Mocking
- Use MSW (Mock Service Worker) for API mocking in tests.
- `tests/mocks/handlers.ts`: Define mock handlers for all major API endpoints.
- `tests/mocks/server.ts`: Set up MSW server.
- `tests/mocks/data.ts`: Fixture data for users, posts, applications, conversations, etc.

### Component Tests
- `Button.test.tsx`: Renders correctly, handles click, shows loading state, disabled state.
- `PostCard.test.tsx`: Renders post info, category badge, status badge, author info. Handles click navigation.
- `PostForm.test.tsx`: Validates required fields, shows error messages, submits correct data.

### Page Tests
- `login.test.tsx`: Renders login form, validates input, calls login API, redirects on success, shows error on failure.
- `posts.test.tsx`: Renders post list, applies filters, paginates.

### Hook Tests
- `useAuth.test.ts`: Initializes auth state, handles login/logout, refreshes user, handles 401.

### API Client Tests
- `api-client.test.ts`: Adds auth headers, handles JSON envelope, handles errors, redirects on 401.

### Integration Tests
- `auth-flow.test.tsx`: Full register → login → access protected route → logout flow.
- `post-crud.test.tsx`: Create post → view in list → edit → delete flow.

### Dependencies to Add
- `vitest` (or `jest`) + `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event`.
- `msw` for API mocking.
- `@vitejs/plugin-react` if using Vitest.

## ✅ Acceptance Criteria
- [ ] Test suite runs with a single command (`npm test` or `npm run test`).
- [ ] MSW mock server intercepts all API calls in tests.
- [ ] Core UI component tests pass (Button, PostCard, PostForm).
- [ ] Login page test covers success and failure flows.
- [ ] `useAuth` hook test covers the full auth lifecycle.
- [ ] API client test verifies auth headers, error handling, and 401 redirect.
- [ ] Integration tests cover end-to-end auth and post CRUD flows.
- [ ] Test coverage is configured and reportable.
