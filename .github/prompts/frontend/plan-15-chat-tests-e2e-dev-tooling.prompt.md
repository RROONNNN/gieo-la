# Chat Tests, E2E Tests & Dev Tooling

## 🎯 Goal
Add chat-specific tests, end-to-end tests for critical user journeys, and developer tooling for local development with the backend seed data.

## ⚠️ Depends On
- FE plan-10-chat-ui-realtime (chat implementation)
- FE plan-14-test-setup-and-core-tests (test infrastructure)
- BE plan-15-chat-tests-and-seed-data (seed data, backend test coverage)

## 📋 Files to Create/Modify
- frontend/tests/components/ConversationList.test.tsx
- frontend/tests/components/MessageThread.test.tsx
- frontend/tests/hooks/useChat.test.ts
- frontend/tests/hooks/useSocket.test.ts
- frontend/tests/integration/chat-flow.test.tsx
- frontend/tests/integration/application-flow.test.tsx
- frontend/tests/integration/notification-flow.test.tsx
- frontend/e2e/auth.spec.ts
- frontend/e2e/posts.spec.ts
- frontend/e2e/chat.spec.ts
- frontend/e2e/admin.spec.ts
- frontend/playwright.config.ts
- frontend/.env.test
- frontend/scripts/dev-setup.sh

## 📎 Shared Context
#file:frontend/package.json

## 📐 Implementation Details

### Chat Component Tests
- `ConversationList.test.tsx`: Renders conversations sorted by recent, shows unread badges, clicking selects conversation.
- `MessageThread.test.tsx`: Renders messages with correct sender alignment, loads older messages on scroll, auto-scrolls on new message.

### Chat Hook Tests
- `useChat.test.ts`: Manages conversation list, updates on new message events, tracks unread counts.
- `useSocket.test.ts`: Connects on auth, disconnects on logout, handles reconnection, emits and receives events.

### Integration Tests
- `chat-flow.test.tsx`: Open conversations → send message → message appears → mark as read.
- `application-flow.test.tsx`: View post → apply → owner selects → notifications received → chat opens.
- `notification-flow.test.tsx`: Notification bell count updates → click notification → mark read → navigates correctly.

### E2E Tests (Playwright)
- Configure Playwright for Next.js app with `playwright.config.ts`.
- Set up `.env.test` with test backend URL (local backend with seed data).

- `auth.spec.ts`:
  - Register new member account → login → see user menu.
  - Login with invalid credentials → see error.
  - Access protected page without auth → redirected to login.

- `posts.spec.ts`:
  - Browse posts as guest → filter by category → view post detail.
  - Login as member → create post → see it in "My posts" → edit → delete.
  - Login as verified individual → apply to receive → see confirmation.

- `chat.spec.ts`:
  - Login as donor → select recipient → conversation opens → send message.
  - Login as recipient → see conversation → reply.

- `admin.spec.ts`:
  - Login as admin → view dashboard stats → review verification request → approve.
  - Pin a post → verify it appears first in listing.
  - Create news post → publish → verify on public /news page.

### Developer Tooling
- `scripts/dev-setup.sh`: Script that:
  1. Checks if backend is running.
  2. Runs backend seed script (`cd backend && npm run seed`).
  3. Copies `.env.example` to `.env.local` if not exists.
  4. Starts frontend dev server.
- `.env.test` with `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1` for local dev.

### Dependencies to Add
- `@playwright/test` for E2E tests.
- Update `package.json` scripts: `test`, `test:e2e`, `test:coverage`, `dev:setup`.

## ✅ Acceptance Criteria
- [ ] Chat component tests verify conversation list and message thread rendering.
- [ ] Chat hook tests verify socket connection lifecycle and event handling.
- [ ] Integration tests cover the full application-to-chat flow.
- [ ] E2E tests pass against the backend with seed data.
- [ ] E2E covers: auth, post CRUD, application flow, chat, and admin operations.
- [ ] Playwright is configured and can run all E2E specs.
- [ ] Dev setup script bootstraps the frontend for local development.
- [ ] `package.json` has scripts for unit tests, E2E tests, and coverage.
