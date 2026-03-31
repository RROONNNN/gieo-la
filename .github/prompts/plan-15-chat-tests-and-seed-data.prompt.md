# Chat Tests and Seed Data

## 🎯 Goal
Add targeted chat and notification tests plus a seed script that gives frontend work a realistic backend dataset.

## ⚠️ Depends On
- plan-09-application-selection-and-completion.prompt.md
- plan-10-chat-api-and-socket-delivery.prompt.md
- plan-11-wishlist-feature.prompt.md
- plan-12-news-feature.prompt.md
- plan-13-reporting-leaderboard-and-dashboard.prompt.md

## 📋 Files to Create/Modify
- backend/package.json
- backend/tests/chat-and-notifications.test.js
- backend/tests/quota-and-race.test.js
- backend/scripts/seed.js

## 📎 Shared Context
#file:_context.prompt.md
#file:requirement.txt
#file:backend/package.json

## 📐 Implementation Details
- Add `chat-and-notifications.test.js` for conversation creation rules, participant-only access, message persistence, and notification side effects after selection.
- Add `quota-and-race.test.js` to prove only one application can win a selection race and quotas enforce the UTC monthly limits.
- Add `backend/scripts/seed.js` to create at least one admin, one member donor, one verified NGO, one verified individual, demo posts, applications, wishlists, conversations, notifications, and news posts.
- Expose the seed command from `backend/package.json`.
- Keep seed data deterministic enough that frontend work can rely on it.

## ✅ Acceptance Criteria
- [ ] Chat tests prove conversations are keyed by participant pair, not by post.
- [ ] Chat tests prove non-participants cannot access a conversation.
- [ ] Race-condition tests prove only one recipient can be selected.
- [ ] Seed script creates usable demo records for auth, posts, chat, wishlist, news, and admin views.
- [ ] `backend/package.json` exposes a runnable seed command.