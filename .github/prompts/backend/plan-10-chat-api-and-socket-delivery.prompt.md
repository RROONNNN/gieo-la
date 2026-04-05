# Chat API and Socket Delivery

## 🎯 Goal
Expose the conversation and message APIs and layer Socket.IO delivery on top of the persisted chat model.

## ⚠️ Depends On
- plan-01-foundation-bootstrap.prompt.md
- plan-03-auth-api-core.prompt.md
- plan-08-chat-domain-models.prompt.md
- plan-09-application-selection-and-completion.prompt.md

## 📋 Files to Create/Modify
- backend/src/controllers/conversationController.js
- backend/src/routes/conversationRoutes.js
- backend/src/sockets/chatSocket.js
- backend/src/app.js
- backend/src/routes/index.js

## 📎 Shared Context
#file:_context.prompt.md
#file:requirement.txt
#file:backend/src/models/Conversation.js
#file:backend/src/models/Message.js

## 📐 Implementation Details
- Add `GET /conversations`, `POST /conversations`, `GET /conversations/:id`, `GET /conversations/:id/messages`, `POST /conversations/:id/messages`, and `PATCH /conversations/:id/read`.
- `POST /conversations` must start or retrieve a conversation by `otherUserId`, but it may only succeed if the two users already have an approved donor-recipient relationship or an existing conversation.
- Ensure only participants can read or send messages in a conversation.
- Persist messages before emitting realtime events.
- Add `backend/src/sockets/chatSocket.js` to register Socket.IO rooms by user ID and conversation ID.
- Update `backend/src/app.js` only as much as needed to wire Socket.IO without moving HTTP logic out of Express.
- Keep HTTP APIs as the source of truth and use sockets for delivery only.

## ✅ Acceptance Criteria
- [ ] Non-participants cannot read or write a conversation.
- [ ] Manual conversation creation is blocked unless the relationship rule is satisfied.
- [ ] New messages are stored in MongoDB before Socket.IO emits them.
- [ ] `PATCH /conversations/:id/read` updates message or conversation read state.
- [ ] Socket handlers do not require a post-bound conversation model.