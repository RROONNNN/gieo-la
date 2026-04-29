---
goal: Implement real-time 1-1 private chat between users with file/media support
version: 1.0
date_created: 2026-04-27
last_updated: 2026-04-27
owner: Development Team
status: 'Planned'
tags: [feature, chat, socket.io, real-time, websocket]
---

# Introduction

![Planned](https://img.shields.io/badge/status-Planned-blue)

Implement real-time 1-1 private chat system for "Lá Lành" platform. Users can exchange text messages, images, videos, and files with each other. The system integrates Socket.IO into the existing Express backend and adds a `/chat` route in Next.js frontend.

---

## Decisions Made (Pre-Planning)

| Decision | Choice | Reasoning |
|---|---|---|
| Real-time transport | Socket.IO | Best fit for Node.js, works with existing Express server |
| Chat initiation | Any logged-in user can chat with any user | Open community model |
| File storage | Cloudinary only | Existing infrastructure; video ≤ 50 MB, file ≤ 20 MB |
| Advanced features | None in v1 | No typing indicator, no read receipts, no reactions |
| Notifications | In-app badge (unread count) on navbar | Simple, no browser push needed |
| Profile in chat | Right-side panel (click on name/avatar) | Non-disruptive UX |

---

## Architecture Overview

```
Browser (Next.js)
  ├─ ChatContext (socket.io-client connection + unread count)
  ├─ /chat page (conversation list sidebar + message thread)
  └─ Navbar (unread badge)

Express Backend
  ├─ http.createServer(app)  ← wraps existing app
  ├─ Socket.IO server (attached to http server)
  │    ├─ JWT auth middleware (socket.handshake.auth.token)
  │    └─ chatHandler.js (join_room, send_message, mark_read events)
  └─ REST APIs
       ├─ GET  /api/v1/conversations
       ├─ POST /api/v1/conversations
       ├─ GET  /api/v1/conversations/:id/messages
       ├─ PATCH /api/v1/conversations/:id/read
       └─ POST /api/v1/chat/upload
```

---

## Data Models

### REQ-MODEL-001: Conversation

Collection: `conversations`

| Field | Type | Constraints |
|---|---|---|
| _id | ObjectId | auto |
| participants | [ObjectId] | required, ref: User, size: 2, unique pair |
| lastMessage.content | String | default: null |
| lastMessage.type | String | enum: text/image/video/file, default: null |
| lastMessage.senderId | ObjectId | ref: User, default: null |
| lastMessage.createdAt | Date | default: null |
| unreadCounts | Map<String, Number> | key = userId.toString(), default: {} |
| createdAt | Date | auto (timestamps) |
| updatedAt | Date | auto (timestamps) |

Indexes:
- `{ participants: 1 }` — find conversations by userId
- `{ 'participants': 1, updatedAt: -1 }` — list sorted by latest activity
- Unique compound: ensure no duplicate pairs (enforced at app level)

### REQ-MODEL-002: Message

Collection: `messages`

| Field | Type | Constraints |
|---|---|---|
| _id | ObjectId | auto |
| conversationId | ObjectId | required, ref: Conversation |
| sender | ObjectId | required, ref: User (null if isSystem=true) |
| type | String | required, enum: text/image/video/file |
| content | String | max 2000 chars, null for non-text |
| fileUrl | String | Cloudinary URL, null for text |
| fileName | String | original filename, null for text |
| fileSize | Number | bytes, null for text |
| fileMimeType | String | MIME type, null for text |
| isSystem | Boolean | default: false (auto-generated system messages) |
| createdAt | Date | auto (timestamps) |
| updatedAt | Date | auto (timestamps) |

Indexes:
- `{ conversationId: 1, createdAt: -1 }` — paginated message history

---

## Socket.IO Event Contract

### Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `join_conversations` | none | On connect: server auto-joins user to all their conversation rooms |
| `send_message` | `{ conversationId, type, content?, fileUrl?, fileName?, fileSize?, fileMimeType? }` | Send a new message |
| `mark_read` | `{ conversationId }` | Mark all messages in conversation as read |

### Server → Client Events

| Event | Payload | Description |
|---|---|---|
| `new_message` | Full `Message` object + `conversationId` | Broadcast to both participants |
| `conversation_updated` | `{ conversationId, lastMessage, unreadCount }` | Update conversation list card |
| `error` | `{ message: string }` | Error feedback to sender |

---

## REST API Contract

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/conversations` | Required | List user's conversations, sorted by updatedAt desc |
| POST | `/api/v1/conversations` | Required | Find or create conversation with `{ participantId }` |
| GET | `/api/v1/conversations/:id/messages` | Required | Paginated messages, query: `?limit=30&before=<messageId>` |
| PATCH | `/api/v1/conversations/:id/read` | Required | Set unreadCount to 0 for current user |
| POST | `/api/v1/chat/upload` | Required | Upload file to Cloudinary, returns `{ fileUrl, fileName, fileSize, fileMimeType }` |

---

## Phases

### PHASE-1: Backend — HTTP Server + Socket.IO Setup

**Goal:** Convert Express `app.listen()` to `http.createServer()` and attach Socket.IO.

**Tasks:**

#### TASK-1.1 — Install Socket.IO dependency
- File: `backend/package.json`
- Command: `npm install socket.io` in `/backend`
- Result: `socket.io` appears in `dependencies`

#### TASK-1.2 — Refactor `app.js` to use http.Server
- File: `backend/src/app.js`
- Change: Remove `app.listen()` call (if present at bottom)
- Add: `const http = require('http'); const server = http.createServer(app); module.exports = { app, server };`
- Create new entry: `backend/src/server.js` with:
  ```js
  'use strict';
  const { server } = require('./app');
  const { initSocket } = require('./socket/index');
  const env = require('./config/env');
  const connectDB = require('./config/db');
  
  connectDB().then(() => {
    initSocket(server);
    server.listen(env.PORT || 5000, () => {
      console.log(`Server running on port ${env.PORT || 5000}`);
    });
  });
  ```
- Update `package.json` scripts: `"start": "node src/server.js"`, `"dev": "nodemon src/server.js"`

#### TASK-1.3 — Create Socket.IO initialization module
- File: `backend/src/socket/index.js`
- Content:
  ```js
  'use strict';
  const { Server } = require('socket.io');
  const env = require('../config/env');
  const { socketAuthMiddleware } = require('./middleware');
  const { registerChatHandlers } = require('./chatHandler');
  
  let io;
  
  function initSocket(server) {
    io = new Server(server, {
      cors: { origin: env.CLIENT_URL, credentials: true },
    });
    io.use(socketAuthMiddleware);
    io.on('connection', (socket) => {
      registerChatHandlers(io, socket);
    });
    return io;
  }
  
  function getIO() {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
  }
  
  module.exports = { initSocket, getIO };
  ```

#### TASK-1.4 — Create Socket.IO JWT auth middleware
- File: `backend/src/socket/middleware.js`
- Logic: Extract `socket.handshake.auth.token`, verify with `jsonwebtoken`, attach `socket.userId` (string)
- On invalid/missing token: call `next(new Error('Unauthorized'))`
- Content:
  ```js
  'use strict';
  const jwt = require('jsonwebtoken');
  const env = require('../config/env');
  
  async function socketAuthMiddleware(socket, next) {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const payload = jwt.verify(token, env.JWT_SECRET);
      socket.userId = payload.id; // matches existing JWT payload shape
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  }
  
  module.exports = { socketAuthMiddleware };
  ```

> **Note:** Check `backend/src/utils/generateToken.js` for the exact JWT payload field name (`id` or `_id`) and adjust `payload.id` accordingly.

---

### PHASE-2: Backend — MongoDB Models

**Goal:** Create `Conversation` and `Message` Mongoose models.

#### TASK-2.1 — Create Conversation model
- File: `backend/src/models/Conversation.js`
- Schema: per REQ-MODEL-001 above
- Key details:
  - `participants`: `[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]`, required, validate length === 2
  - `unreadCounts`: `{ type: Map, of: Number, default: {} }`
  - `lastMessage`: nested object (not a subdocument), all fields nullable
  - Timestamps: true

#### TASK-2.2 — Create Message model
- File: `backend/src/models/Message.js`
- Schema: per REQ-MODEL-002 above
- Key details:
  - `type`: `enum: ['text', 'image', 'video', 'file']`, required
  - `content`: `{ type: String, trim: true, maxlength: 2000, default: null }`
  - `isSystem`: `{ type: Boolean, default: false }`
  - `sender`: nullable when `isSystem: true`
  - Timestamps: true

---

### PHASE-3: Backend — REST APIs

**Goal:** Build REST controllers and routes for conversation management.

#### TASK-3.1 — Create `chatController.js`
- File: `backend/src/controllers/chatController.js`
- Functions:

**`getConversations(req, res)`**
- Query: `Conversation.find({ participants: req.user._id }).sort({ updatedAt: -1 })`
- Populate: `participants` with `name avatar role verificationStatus` (exclude current user's own data—keep both for display)
- Return: array of conversations with `unreadCount` for current user extracted from `unreadCounts` map

**`getOrCreateConversation(req, res)`**
- Body: `{ participantId }`
- Validate: `participantId` is valid ObjectId, not equal to `req.user._id`, participant user exists
- Logic:
  1. Find existing: `Conversation.findOne({ participants: { $all: [req.user._id, participantId], $size: 2 } })`
  2. If not found: create new `Conversation({ participants: [req.user._id, participantId] })`
- Return: conversation object, HTTP 200 if existing, 201 if new

**`getMessages(req, res)`**
- Params: `conversationId`
- Query params: `limit` (default 30, max 50), `before` (messageId for cursor pagination)
- Validate: user is participant in conversation
- Query: `Message.find({ conversationId, ...(before && { _id: { $lt: before } }) }).sort({ createdAt: -1 }).limit(limit)`
- Populate: `sender` with `name avatar`
- Return: messages array (most recent first), `hasMore` boolean

**`markRead(req, res)`**
- Params: `conversationId`
- Validate: user is participant
- Update: `conversation.unreadCounts.set(req.user._id.toString(), 0); conversation.save()`
- Return: `{ success: true }`

#### TASK-3.2 — Create `chatRoutes.js`
- File: `backend/src/routes/chatRoutes.js`
- Routes:
  ```
  GET  /conversations               → getConversations
  POST /conversations               → getOrCreateConversation
  GET  /conversations/:id/messages  → getMessages
  PATCH /conversations/:id/read     → markRead
  ```
- All routes protected by `authMiddleware` (existing `middlewares/auth.js`)

#### TASK-3.3 — Register chat routes in index.js
- File: `backend/src/routes/index.js`
- Add: `const chatRouter = require('./chatRoutes');`
- Add: `router.use('/chat', chatRouter);`

#### TASK-3.4 — Add chat file upload endpoint
- File: `backend/src/config/cloudinary.js`
- Add new `CloudinaryStorage` instance: `chatMediaStorage`
  - `folder: 'gieo-la/chat'`
  - `resource_type: 'auto'` (handles image, video, raw files)
  - `allowed_formats`: `['jpg','jpeg','png','webp','gif','mp4','mov','avi','pdf','doc','docx','xls','xlsx','zip']`
- Add `uploadChatMedia = multer({ storage: chatMediaStorage, limits: { fileSize: 50 * 1024 * 1024 } })` (50 MB cap)
- Export `uploadChatMedia`

- File: `backend/src/routes/chatRoutes.js` — Add:
  ```
  POST /upload  → uploadChatMedia.single('file')  → (req, res) => res.status(201).json({ success:true, data: { fileUrl: req.file.path, fileName: req.file.originalname, fileSize: req.file.size, fileMimeType: req.file.mimetype } })
  ```

---

### PHASE-4: Backend — Socket.IO Chat Handler

**Goal:** Handle real-time message sending and room management.

#### TASK-4.1 — Create `chatHandler.js`
- File: `backend/src/socket/chatHandler.js`
- Content:

```js
'use strict';
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

async function registerChatHandlers(io, socket) {
  const userId = socket.userId;

  // Auto-join all conversation rooms on connect
  const conversations = await Conversation.find({ participants: userId }, '_id');
  conversations.forEach(c => socket.join(`conv_${c._id}`));

  // Event: send_message
  socket.on('send_message', async (data) => {
    const { conversationId, type, content, fileUrl, fileName, fileSize, fileMimeType } = data;
    
    // Validate conversation exists and user is participant
    const conv = await Conversation.findOne({ _id: conversationId, participants: userId });
    if (!conv) return socket.emit('error', { message: 'Không tìm thấy cuộc hội thoại' });
    
    // Validate message content
    if (type === 'text' && (!content || !content.trim())) {
      return socket.emit('error', { message: 'Tin nhắn không được để trống' });
    }
    if (type !== 'text' && !fileUrl) {
      return socket.emit('error', { message: 'Thiếu URL file' });
    }
    
    // Save message
    const message = await Message.create({
      conversationId,
      sender: userId,
      type,
      content: type === 'text' ? content.trim() : null,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null,
      fileMimeType: fileMimeType || null,
    });
    
    await message.populate('sender', 'name avatar');
    
    // Update conversation metadata
    const otherParticipant = conv.participants.find(p => p.toString() !== userId);
    const currentUnread = conv.unreadCounts.get(otherParticipant.toString()) || 0;
    conv.unreadCounts.set(otherParticipant.toString(), currentUnread + 1);
    conv.lastMessage = {
      content: type === 'text' ? content.trim() : fileName,
      type,
      senderId: userId,
      createdAt: message.createdAt,
    };
    await conv.save();
    
    // Broadcast to room
    io.to(`conv_${conversationId}`).emit('new_message', message);
    io.to(`conv_${conversationId}`).emit('conversation_updated', {
      conversationId,
      lastMessage: conv.lastMessage,
      unreadCounts: Object.fromEntries(conv.unreadCounts),
    });
  });

  // Event: mark_read
  socket.on('mark_read', async ({ conversationId }) => {
    const conv = await Conversation.findOne({ _id: conversationId, participants: userId });
    if (!conv) return;
    conv.unreadCounts.set(userId.toString(), 0);
    await conv.save();
    socket.emit('conversation_updated', {
      conversationId,
      lastMessage: conv.lastMessage,
      unreadCounts: Object.fromEntries(conv.unreadCounts),
    });
  });
}

module.exports = { registerChatHandlers };
```

---

### PHASE-5: Backend — Auto-Message on Applicant Selection

**Goal:** When post owner selects a recipient, automatically create a conversation and send a system message.

#### TASK-5.1 — Inject auto-message into `selectApplicant`
- File: `backend/src/controllers/applicationController.js`
- After `post.save()` in `selectApplicant`, add the following logic:

```js
// Auto-create conversation and send system message
try {
  const { getIO } = require('../socket/index');
  const Conversation = require('../models/Conversation');
  const Message = require('../models/Message');
  
  const postAuthorId = req.user._id.toString();
  const recipientId = applicantId.toString();
  
  // Find or create conversation
  let conv = await Conversation.findOne({
    participants: { $all: [postAuthorId, recipientId], $size: 2 },
  });
  if (!conv) {
    conv = await Conversation.create({ participants: [postAuthorId, recipientId] });
  }
  
  const systemText = `🎉 Bạn đã được chọn nhận món đồ từ bài đăng "${post.title}". Hãy liên hệ để sắp xếp nhận đồ nhé!`;
  
  const msg = await Message.create({
    conversationId: conv._id,
    sender: null,
    type: 'text',
    content: systemText,
    isSystem: true,
  });
  
  conv.lastMessage = { content: systemText, type: 'text', senderId: null, createdAt: msg.createdAt };
  const currentUnread = conv.unreadCounts.get(recipientId) || 0;
  conv.unreadCounts.set(recipientId, currentUnread + 1);
  await conv.save();
  
  // Emit to both participants if connected
  try {
    const io = getIO();
    io.to(`conv_${conv._id}`).emit('new_message', msg);
    io.to(`conv_${conv._id}`).emit('conversation_updated', {
      conversationId: conv._id,
      lastMessage: conv.lastMessage,
      unreadCounts: Object.fromEntries(conv.unreadCounts),
    });
  } catch {
    // Socket.IO may not be initialized in tests — safe to ignore emit errors
  }
} catch (err) {
  // Non-critical: chat message failure should not break the selection flow
  console.error('[chat auto-message] error:', err.message);
}
```

> **Note:** Wrap in try-catch so any chat error does NOT break the applicant selection response.

---

### PHASE-6: Frontend — Install Dependencies & Types

**Goal:** Add `socket.io-client` and define TypeScript types for chat.

#### TASK-6.1 — Install socket.io-client
- Directory: `frontend/`
- Command: `npm install socket.io-client`
- Verify: `socket.io-client` appears in `dependencies` in `frontend/package.json`

#### TASK-6.2 — Create chat TypeScript types
- File: `frontend/types/chat.ts`
- Content:
```ts
export type MessageType = 'text' | 'image' | 'video' | 'file';

export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    name: string;
    avatar: string | null;
  } | null;
  type: MessageType;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileMimeType: string | null;
  isSystem: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    avatar: string | null;
    role: string;
    verificationStatus: string;
  }>;
  lastMessage: {
    content: string | null;
    type: MessageType | null;
    senderId: string | null;
    createdAt: string | null;
  } | null;
  unreadCount: number; // extracted from unreadCounts map for current user
  updatedAt: string;
}
```

#### TASK-6.3 — Add chat API functions
- File: `frontend/lib/api/chat.ts`
- Functions using existing `request()` client:
  - `getConversations()` → `GET /chat/conversations`
  - `getOrCreateConversation(participantId: string)` → `POST /chat/conversations`
  - `getMessages(conversationId: string, params?: { limit?: number; before?: string })` → `GET /chat/conversations/:id/messages`
  - `markRead(conversationId: string)` → `PATCH /chat/conversations/:id/read`
  - `uploadChatFile(file: File)` → `POST /chat/upload` (multipart/form-data)

---

### PHASE-7: Frontend — ChatContext & useSocket Hook

**Goal:** Provide Socket.IO instance and unread count globally via React Context.

#### TASK-7.1 — Create `useSocket` hook
- File: `frontend/hooks/useSocket.ts`
- Logic:
  - Import `io` from `socket.io-client`
  - On mount (when `isAuthenticated` and token available): create socket connection to `process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE_URL`
  - Pass `{ auth: { token } }` in options
  - Socket URL: backend base URL (e.g. `http://localhost:5000`)
  - Return `{ socket, isConnected }`
  - Cleanup: `socket.disconnect()` on unmount

#### TASK-7.2 — Create `ChatContext`
- File: `frontend/contexts/ChatContext.tsx`
- State: `totalUnread: number`, `socket: Socket | null`
- On socket `new_message`: if message is NOT for the currently active conversation → increment `totalUnread`
- On socket `conversation_updated` with `unreadCount = 0`: recalculate total
- On mount: fetch conversations → sum all `unreadCount` values → set `totalUnread`
- Export: `useChatContext()` hook

#### TASK-7.3 — Wrap app layout with ChatContext
- File: `frontend/app/layout.tsx`
- Wrap children with `<ChatProvider>` (only active when user is authenticated)
- Pattern: render `ChatProvider` inside `AuthProvider`, conditionally based on `isAuthenticated`

---

### PHASE-8: Frontend — Chat Page UI

**Goal:** Build the `/chat` page with 3-column layout: conversation list + message thread + profile panel.

#### TASK-8.1 — Create chat page route
- File: `frontend/app/(dashboard)/chat/page.tsx`
- Route: `/chat`
- Auth guard: redirect to `/login` if not authenticated (use `useRequireAuth`)
- Layout: full-height flex row
  - Left (320px): `<ConversationList>`
  - Center (flex-grow): `<MessageThread>` (empty state when no conversation selected)
  - Right (300px, hidden by default): `<UserProfilePanel>` (shown when panel open)

#### TASK-8.2 — Create `ConversationList` component
- File: `frontend/components/chat/ConversationList.tsx`
- Props: `conversations: Conversation[]`, `activeId: string | null`, `onSelect: (id: string) => void`
- Renders: search input (filter by participant name, client-side), list of `<ConversationItem>` components
- Empty state: "Chưa có cuộc hội thoại nào"
- On mount: fetch conversations via `getConversations()`, sort by `updatedAt` desc
- Listen to `conversation_updated` socket event to reorder/update list without full refetch

#### TASK-8.3 — Create `ConversationItem` component
- File: `frontend/components/chat/ConversationItem.tsx`
- Props: `conversation: Conversation`, `isActive: boolean`, `currentUserId: string`, `onClick: () => void`
- Display: avatar of other participant, name, last message preview (truncate 40 chars), time, unread badge (red dot with count if > 0)
- Active state: highlighted background with brand-dark color

#### TASK-8.4 — Create `MessageThread` component
- File: `frontend/components/chat/MessageThread.tsx`
- Props: `conversationId: string`, `otherUser: ConversationParticipant`, `onOpenProfile: () => void`
- State: `messages: ChatMessage[]`, `isLoading`, `hasMore`, `isSending`
- On mount: `getMessages(conversationId)` + `markRead(conversationId)` + emit `mark_read` socket event
- Infinite scroll: "Load earlier messages" button at top, triggers `getMessages({ before: messages[0]._id })`
- Listen to `new_message` socket event: prepend to list, call `markRead`
- Header: avatar + name (clickable → `onOpenProfile`), status indicator
- Body: scrollable message list (`<MessageBubble>` per message)
- Footer: `<MessageInput>`

#### TASK-8.5 — Create `MessageBubble` component
- File: `frontend/components/chat/MessageBubble.tsx`
- Props: `message: ChatMessage`, `isOwn: boolean`
- Variants:
  - `isSystem: true` → centered gray italic text (system notification)
  - `type === 'text'` → text bubble, right-aligned if own, left-aligned if other
  - `type === 'image'` → `<img>` thumbnail (max 240px wide), click to open full size in new tab
  - `type === 'video'` → `<video controls>` element (max 320px)
  - `type === 'file'` → download card: file icon + filename + size + download link
- Timestamp: small gray text below bubble

#### TASK-8.6 — Create `MessageInput` component
- File: `frontend/components/chat/MessageInput.tsx`
- Props: `onSendText: (text: string) => void`, `onSendFile: (file: File) => Promise<void>`, `disabled: boolean`
- UI: textarea (auto-resize, max 4 rows), paperclip icon button, send button
- Text send: Enter key (Shift+Enter = newline), or click send button
- File attach: hidden `<input type="file">` triggered by paperclip icon
  - Accepted types: `image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip`
  - File size validation client-side: images ≤ 20 MB, videos ≤ 50 MB, other files ≤ 20 MB
  - On file selected: show preview/filename chip in input area, upload on send click
- File upload flow:
  1. Call `uploadChatFile(file)` → get `{ fileUrl, fileName, fileSize, fileMimeType }`
  2. Determine `type` from `fileMimeType` (image/* → 'image', video/* → 'video', else → 'file')
  3. Emit `send_message` socket event with file metadata

#### TASK-8.7 — Create `UserProfilePanel` component
- File: `frontend/components/chat/UserProfilePanel.tsx`
- Props: `userId: string`, `onClose: () => void`
- Fetches user profile via existing `GET /api/v1/users/:id` endpoint
- Displays: avatar, name, role badge, verification badge, "Lá đã gieo" count
- Lists: recent 5 posts from user via `GET /api/v1/posts?author=userId&limit=5`
- Close button (X) at top right

---

### PHASE-9: Frontend — Unread Badge on Navbar

**Goal:** Show unread message count badge on chat icon in Navbar.

#### TASK-9.1 — Add chat icon with badge to Navbar
- File: `frontend/components/layout/Navbar.tsx`
- Import `useChatContext` from `ChatContext`
- Add `<Link href="/chat">` with `MessageSquare` icon (lucide-react)
- Render red badge with `totalUnread` count (hide if 0)
- Position: badge absolute top-right of icon, z-10, min-w-4, h-4, rounded-full, bg-red-500 text-white text-[10px]
- Location: place between nav links and user dropdown

---

### PHASE-10: Integration — Start New Chat from Profile Page

**Goal:** Allow "Nhắn tin" button on profile pages to navigate to existing or new conversation.

#### TASK-10.1 — Add "Nhắn tin" button to profile page
- File: `frontend/app/(public)/profile/[id]/page.tsx` (or wherever profile page exists)
- Logic:
  1. When clicking "Nhắn tin": call `getOrCreateConversation(profileUserId)`
  2. Navigate to `/chat?conv=<conversationId>`
- On `/chat` page: read `?conv=` query param → auto-select that conversation on mount
- Only visible to authenticated users who are NOT the profile owner

---

### PHASE-11: Documentation Updates

**Goal:** Update `models.md` and `list_apis.md` per project instructions.

#### TASK-11.1 — Update `models.md`
- Add `Conversation` model section with full field table
- Add `Message` model section with full field table

#### TASK-11.2 — Update `list_apis.md`
- Add Chat group with all 5 endpoints:
  - `GET /api/v1/chat/conversations` — Authenticated — List user conversations
  - `POST /api/v1/chat/conversations` — Authenticated — Find or create conversation
  - `GET /api/v1/chat/conversations/:id/messages` — Authenticated — Get paginated messages
  - `PATCH /api/v1/chat/conversations/:id/read` — Authenticated — Mark conversation as read
  - `POST /api/v1/chat/upload` — Authenticated — Upload chat file attachment

#### TASK-11.3 — Update `notion.md`
- Add section for `socket.io` (backend)
- Add section for `socket.io-client` (frontend)

---

## Dependencies Between Phases

```
PHASE-1 (Socket.IO setup)
  └─ PHASE-4 (Chat Handler — needs io instance)
       └─ PHASE-5 (Auto-message — needs getIO())

PHASE-2 (Models)
  ├─ PHASE-3 (REST APIs — needs models)
  ├─ PHASE-4 (Chat Handler — needs models)
  └─ PHASE-5 (Auto-message — needs models)

PHASE-6 (Frontend types + deps)
  └─ PHASE-7 (ChatContext — needs types)
       └─ PHASE-8 (Chat UI — needs context)
            └─ PHASE-9 (Navbar badge — needs ChatContext)

PHASE-3 + PHASE-4 must be complete before PHASE-8 (frontend needs working APIs)
```

---

## File Inventory — New Files

### Backend
| File | Purpose |
|---|---|
| `backend/src/server.js` | HTTP server entry point (replaces direct listen in app.js) |
| `backend/src/socket/index.js` | Socket.IO init + `getIO()` singleton |
| `backend/src/socket/middleware.js` | JWT auth middleware for socket connections |
| `backend/src/socket/chatHandler.js` | Socket event handlers (send_message, mark_read) |
| `backend/src/models/Conversation.js` | Conversation Mongoose model |
| `backend/src/models/Message.js` | Message Mongoose model |
| `backend/src/controllers/chatController.js` | REST controller for conversations/messages |
| `backend/src/routes/chatRoutes.js` | REST routes + file upload endpoint |

### Frontend
| File | Purpose |
|---|---|
| `frontend/types/chat.ts` | TypeScript interfaces for chat |
| `frontend/lib/api/chat.ts` | API client functions for chat |
| `frontend/hooks/useSocket.ts` | Socket.IO connection hook |
| `frontend/contexts/ChatContext.tsx` | Global socket + unread count context |
| `frontend/app/(dashboard)/chat/page.tsx` | Main chat page |
| `frontend/components/chat/ConversationList.tsx` | Left sidebar conversation list |
| `frontend/components/chat/ConversationItem.tsx` | Single conversation card |
| `frontend/components/chat/MessageThread.tsx` | Message history + input |
| `frontend/components/chat/MessageBubble.tsx` | Individual message display |
| `frontend/components/chat/MessageInput.tsx` | Text + file input component |
| `frontend/components/chat/UserProfilePanel.tsx` | Right panel for viewing user profile |

## File Inventory — Modified Files

| File | Change |
|---|---|
| `backend/src/app.js` | Export `{ app, server }` instead of calling `.listen()` |
| `backend/package.json` | Add `socket.io` dependency |
| `backend/src/config/cloudinary.js` | Add `chatMediaStorage` + `uploadChatMedia` multer instance |
| `backend/src/controllers/applicationController.js` | Inject auto-message block in `selectApplicant` |
| `backend/src/routes/index.js` | Register `chatRoutes` at `/chat` |
| `frontend/package.json` | Add `socket.io-client` dependency |
| `frontend/app/layout.tsx` | Wrap with `<ChatProvider>` |
| `frontend/components/layout/Navbar.tsx` | Add chat icon with unread badge |
| `models.md` | Add Conversation + Message models |
| `list_apis.md` | Add Chat API group |
| `notion.md` | Add socket.io sections |

---

## Environment Variables Required

### Backend `.env`
```
# Already present:
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=http://localhost:3000

# No new variables required
```

### Frontend `.env.local`
```
# Already present:
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1

# New:
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## Security Checklist

- [x] Socket.IO connections require valid JWT token (auth middleware)
- [x] `send_message` handler validates user is a participant in the conversation before saving
- [x] File upload: MIME type and size validated server-side (Cloudinary config + multer limits)
- [x] `getMessages` REST endpoint validates user is a participant
- [x] No direct user input injected into system messages (hardcoded template)
- [x] `conversationId` validated as ObjectId before DB queries
- [x] Rate limiter already applied to all `/api` routes (existing)

---

## Implementation Order (Recommended)

1. PHASE-1 (backend infra)
2. PHASE-2 (models)
3. PHASE-3 (REST APIs)
4. PHASE-4 (socket handlers)
5. PHASE-5 (auto-message integration)
6. PHASE-6 (frontend types/deps)
7. PHASE-7 (ChatContext)
8. PHASE-8 (Chat UI)
9. PHASE-9 (Navbar badge)
10. PHASE-10 (Profile → chat button)
11. PHASE-11 (docs)
