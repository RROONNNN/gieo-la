# Chat Domain Types

## 🎯 Goal
Define TypeScript types for Conversation and Message domains to enable type-safe chat development.

## ⚠️ Depends On
- FE plan-02-user-verification-domain-types (User types)
- BE plan-08-chat-domain-models (schema definitions)

## 📋 Files to Create/Modify
- frontend/types/chat.ts
- frontend/types/index.ts

## 📎 Shared Context
#file:requirement.txt
#file:backend/src/models/Conversation.js
#file:backend/src/models/Message.js

## 📐 Implementation Details

### Chat Types (`types/chat.ts`)
- Define `ConversationStatus`: `active`, `archived`.
- Define `Conversation` interface with: `_id`, `participantIds`, `participants?` (populated SafeUser[]), `openedAt`, `lastMessageAt`, `lastMessagePreview`, `status`, `unreadCount?`.
- Define `Message` interface with: `_id`, `conversationId`, `senderId`, `sender?` (populated SafeUser), `body`, `attachments?` (AttachmentMeta[]), `sentAt`, `readBy`, `deletedAt?`.
- Define `AttachmentMeta` with: `url`, `publicId`, `type`, `name?`.
- Define `SendMessageInput` with: `body`, `attachments?`.
- Define `SocketEvent` union type for chat socket events: `new_message`, `message_read`, `typing_start`, `typing_stop`, `user_online`, `user_offline`.
- Define `TypingIndicator` with: `conversationId`, `userId`, `isTyping`.

### Update Barrel
- Re-export chat types from `types/index.ts`.

## ✅ Acceptance Criteria
- [ ] `Conversation` type models the account-to-account chat with no post reference.
- [ ] `Message` type supports body text, attachments, and read tracking.
- [ ] Socket event types are defined for real-time chat features.
- [ ] All types exported via barrel file.
