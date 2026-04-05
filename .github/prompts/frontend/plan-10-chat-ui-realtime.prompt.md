# Chat UI & Real-time Messaging

## 🎯 Goal
Build the full chat experience: conversation list, message thread, real-time message delivery with Socket.IO, typing indicators, read receipts, and user profile viewing from chat.

## ⚠️ Depends On
- FE plan-01-foundation-bootstrap (layout, API client)
- FE plan-03-auth-pages-and-state (auth context)
- FE plan-08-chat-domain-types (Chat types)
- BE plan-10-chat-api-and-socket-delivery (chat endpoints, Socket.IO)

## 📋 Files to Create/Modify
- frontend/app/(dashboard)/chat/page.tsx
- frontend/app/(dashboard)/chat/[conversationId]/page.tsx
- frontend/lib/api/chat.ts
- frontend/lib/socket.ts
- frontend/hooks/useSocket.ts
- frontend/hooks/useChat.ts
- frontend/hooks/useMessages.ts
- frontend/contexts/SocketContext.tsx
- frontend/components/chat/ConversationList.tsx
- frontend/components/chat/ConversationItem.tsx
- frontend/components/chat/MessageThread.tsx
- frontend/components/chat/MessageBubble.tsx
- frontend/components/chat/MessageInput.tsx
- frontend/components/chat/ChatHeader.tsx
- frontend/components/chat/TypingIndicator.tsx
- frontend/components/chat/EmptyChat.tsx
- frontend/components/chat/UserProfileSidebar.tsx

## 📎 Shared Context
#file:requirement.txt
#file:frontend/types/chat.ts

## 📐 Implementation Details

### Chat API Layer (`lib/api/chat.ts`)
- `getConversations()`, `getConversation(id)`, `getMessages(conversationId, cursor?)`, `sendMessage(conversationId, body)`, `markConversationRead(conversationId)`, `startConversation(otherUserId)`.

### Socket Client (`lib/socket.ts`)
- Create a Socket.IO client singleton that connects with the auth token.
- Auto-reconnect on disconnect.
- Emit and listen for: `new_message`, `message_read`, `typing_start`, `typing_stop`.

### Socket Context (`contexts/SocketContext.tsx`)
- `'use client'` Provider that initializes the socket connection when user is authenticated.
- Provide socket instance and connection state to child components.
- Disconnect on logout.

### Socket Hooks
- `useSocket()` — access the socket instance from context.
- `useChat()` — manage conversation list state, listen for new messages, update last message preview and unread counts.
- `useMessages(conversationId)` — manage message list state, infinite scroll loading, real-time new message appending, optimistic send.

### Chat Page (`/chat`)
- Split-panel layout (responsive):
  - Left panel: `ConversationList` — sorted by `lastMessageAt` desc, unread badge, last message preview.
  - Right panel: Selected conversation's `MessageThread`.
- Mobile: conversation list is a separate page; selecting a conversation navigates to `/chat/[conversationId]`.

### ConversationList
- Each `ConversationItem`: other participant's avatar + name + role badge, last message preview, time ago, unread count badge.
- Real-time updates when new messages arrive.

### MessageThread
- `ChatHeader`: Other user's name, avatar, role badge, link to profile.
- Scrollable message area with `MessageBubble` components.
- Infinite scroll upward for older messages (cursor pagination).
- Auto-scroll to bottom on new messages.
- `TypingIndicator`: "Đang nhập..." animation when the other user is typing.
- `MessageInput`: Text input with send button, enter-to-send. Emit typing events on input change.

### MessageBubble
- Sent messages (right, colored) vs received messages (left, gray).
- Show timestamp on hover or click.
- Read receipt indicator (double check mark).

### UserProfileSidebar
- Slide-out panel showing the other user's profile, their post history, and their verification badge.
- Accessible from `ChatHeader` avatar or name click.

### EmptyChat
- Placeholder when no conversation is selected: "Chọn một cuộc trò chuyện để bắt đầu".

### Dependencies to Add
- `socket.io-client` for Socket.IO.

## ✅ Acceptance Criteria
- [ ] Users can view their conversation list sorted by most recent.
- [ ] Users can send and receive messages in real-time via Socket.IO.
- [ ] New messages appear instantly without page refresh.
- [ ] Unread message count updates in real-time.
- [ ] Typing indicator shows when the other user is typing.
- [ ] Message history loads with infinite scroll (older messages).
- [ ] Messages show read receipts.
- [ ] Chat layout is responsive (split-panel on desktop, stacked on mobile).
- [ ] Users can view the other participant's profile from the chat.
- [ ] Socket connection is established only when authenticated and disconnects on logout.
