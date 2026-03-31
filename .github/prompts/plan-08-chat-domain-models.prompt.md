# Chat Domain Models

## 🎯 Goal
Introduce the post-independent chat data model so later workflow and realtime plans can build on it.

## ⚠️ Depends On
- plan-01-foundation-bootstrap.prompt.md
- plan-02-user-verification-audit-models.prompt.md

## 📋 Files to Create/Modify
- backend/src/models/Conversation.js
- backend/src/models/Message.js

## 📎 Shared Context
#file:_context.prompt.md
#file:requirement.txt

## 📐 Implementation Details
- Create `Conversation` as a pure account-to-account model.
- Store only the sorted pair of participant IDs, plus status, timestamps, last message preview, and unread-friendly metadata if useful.
- Do not store `postId` or `applicationId` anywhere in the conversation schema.
- Add a unique index on the sorted participant pair so only one conversation exists per account pair.
- Create `Message` with `conversationId`, `senderId`, body, optional attachments metadata, sent timestamp, `readBy`, and soft-delete support if desired.
- Add indexes for conversation listing and message pagination.

## ✅ Acceptance Criteria
- [ ] `Conversation` has no `postId` field.
- [ ] `Conversation` has no `applicationId` field.
- [ ] There is a unique index preventing duplicate conversations for the same participant pair.
- [ ] `Message` supports read tracking and pagination-friendly sorting.