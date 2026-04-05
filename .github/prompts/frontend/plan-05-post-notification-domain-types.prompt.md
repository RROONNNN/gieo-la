# Post, Application, Notification & Quota Types

## 🎯 Goal
Define all TypeScript types and interfaces for Post, PostApplication, PostComment, Notification, and MonthlyQuota domains to enable type-safe post and application flows.

## ⚠️ Depends On
- FE plan-02-user-verification-domain-types (User, enum types)
- BE plan-05-post-quota-notification-models (schema definitions)

## 📋 Files to Create/Modify
- frontend/types/post.ts
- frontend/types/application.ts
- frontend/types/comment.ts
- frontend/types/notification.ts
- frontend/types/quota.ts
- frontend/types/index.ts

## 📎 Shared Context
#file:requirement.txt
#file:backend/src/models/Post.js
#file:backend/src/models/PostApplication.js

## 📐 Implementation Details

### Post Types (`types/post.ts`)
- Define `PostStatus` enum: `san_sang`, `dang_giao_dich`, `da_giao_dich`, `hoan_thanh`.
- Define `PostCategory` enum: `do_nam`, `do_nu`, `do_tre_em`, `phu_kien`.
- Define `PostCondition` enum or string: `moi_100`, `moi_90`, `moi_80`, or freeform.
- Define `Post` interface with: `_id`, `authorId`, `author?` (populated SafeUser), `category`, `quantity`, `condition`, `description`, `images` (ImageMeta[]), `status`, `isPinned`, `selectedApplicationId?`, `selectedRecipientId?`, `location`, `searchText`, `createdAt`, `updatedAt`.
- Define `ImageMeta` with: `url`, `publicId`, `width?`, `height?`.
- Define `PostFilters` for query params: `keyword?`, `category?`, `status?`, `authorId?`, `isPinned?`, `page?`, `limit?`.
- Define `CreatePostInput` and `UpdatePostInput` for form data.

### Application Types (`types/application.ts`)
- Define `ApplicationStatus`: `pending`, `selected`, `rejected`, `withdrawn`.
- Define `PriorityBucket`: `ngo`, `individual`, `member`.
- Define `PostApplication` interface with: `_id`, `postId`, `applicantId`, `applicant?` (populated SafeUser), `applicantRoleSnapshot`, `motivation`, `priorityBucket`, `status`, `selectedAt?`, `rejectedAt?`, `withdrawnAt?`, `monthKey`, `createdAt`.

### Comment Types (`types/comment.ts`)
- Define `CommentType`: `comment`, `feedback`, `proof`.
- Define `PostComment` interface with: `_id`, `postId`, `authorId`, `author?`, `type`, `body`, `images`, `isProofEvidence`, `createdAt`.

### Notification Types (`types/notification.ts`)
- Define `NotificationType` union: `application_selected`, `application_rejected`, `verification_approved`, `verification_rejected`, `post_completed`, etc.
- Define `Notification` interface with: `_id`, `userId`, `type`, `title`, `body`, `payload?`, `readAt?`, `createdAt`.

### Quota Types (`types/quota.ts`)
- Define `MonthlyQuota` interface with: `_id`, `userId`, `monthKey`, `applicationCount`, `completedReceiveCount`, `roleSnapshot`, `limits`.

### Update Barrel
- Re-export all new types from `types/index.ts`.

## ✅ Acceptance Criteria
- [ ] `Post` type covers all post lifecycle fields and status values.
- [ ] `PostApplication` type supports priority ordering and status tracking.
- [ ] `PostComment` type supports comment, feedback, and proof types.
- [ ] `Notification` type supports all workflow notification events.
- [ ] `PostFilters` type defines the querystring shape for list endpoints.
- [ ] All new types are exported via the barrel file.
