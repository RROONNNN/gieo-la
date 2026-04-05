# Application, Selection & Completion UI

## 🎯 Goal
Build the complete "đăng ký nhận đồ" flow: application submission, applicant list panel, recipient selection, rejection notifications, quota display, proof upload, delivery confirmation, and admin completion review.

## ⚠️ Depends On
- FE plan-03-auth-pages-and-state (auth context, role checks)
- FE plan-05-post-notification-domain-types (Application, Notification types)
- FE plan-06-media-upload-components (image upload for proof)
- FE plan-07-post-crud-browsing-ui (post detail page)
- BE plan-09-application-selection-and-completion (application endpoints)

## 📋 Files to Create/Modify
- frontend/lib/api/applications.ts
- frontend/lib/api/notifications.ts
- frontend/hooks/useNotifications.ts
- frontend/components/application/ApplyButton.tsx
- frontend/components/application/ApplyModal.tsx
- frontend/components/application/ApplicantList.tsx
- frontend/components/application/ApplicantCard.tsx
- frontend/components/application/SelectionConfirmDialog.tsx
- frontend/components/application/QuotaIndicator.tsx
- frontend/components/application/ProofUploadForm.tsx
- frontend/components/application/CompletionTimeline.tsx
- frontend/components/notification/NotificationBell.tsx
- frontend/components/notification/NotificationDropdown.tsx
- frontend/components/notification/NotificationItem.tsx
- frontend/app/(dashboard)/notifications/page.tsx
- frontend/app/(admin)/admin/posts/pending-completion/page.tsx

## 📎 Shared Context
#file:requirement.txt
#file:frontend/types/application.ts
#file:frontend/types/notification.ts

## 📐 Implementation Details

### Application API Layer
- `applyToPost(postId, motivation)`, `getApplicationsForPost(postId)`, `selectApplication(postId, applicationId)`, `rejectApplication(postId, applicationId)`, `withdrawApplication(postId, applicationId)`, `reopenPost(postId)`, `submitProof(postId, images)`, `markDelivered(postId)`.

### Notification API Layer
- `getNotifications(page?)`, `markNotificationRead(id)`, `markAllNotificationsRead()`.

### Apply Flow
- **ApplyButton**: Shown on post detail for verified NGO/individual users when post is `san_sang`. Hidden if user has hit monthly quota. Shows "Bạn đã đăng ký" if already applied.
- **ApplyModal**: Text area for motivation/circumstance description. Submit calls `applyToPost()`. Show success message.
- **QuotaIndicator**: Display remaining monthly quota (e.g., "Còn 2/3 lượt nhận tháng này").

### Applicant List Panel (on Post Detail)
- Public panel showing all applicants for a post.
- Sorted: NGO (tích xanh) first → Verified Individual → Member.
- **ApplicantCard**: Avatar, name, role badge, motivation text, verification status.
- For post owner: "Chọn người nhận" button per applicant.
- **SelectionConfirmDialog**: Confirm selection with warning that other applicants will be rejected.

### Post Owner Actions
- After selection: post moves to `dang_giao_dich`. Show selected recipient info.
- "Đã giao đồ" button to mark `da_giao_dich`.
- If handoff fails: "Mở lại bài đăng" to reopen (moves back to `san_sang`).

### Proof Upload
- **ProofUploadForm**: Recipient uploads thank-you/confirmation photos to the post's comment thread.
- Uses `ImageUploader` from plan-06.
- Proof comments are marked with a special badge in the thread.

### Completion Timeline
- Visual timeline showing the post's status journey: Sẵn sàng → Đang giao dịch → Đã giao dịch → Hoàn thành.
- Highlight current step.

### Notification System
- **NotificationBell**: Icon in Header with unread count badge.
- **NotificationDropdown**: Recent notifications list, "Xem tất cả" link.
- **NotificationItem**: Type-specific icon, title, body, time ago, read/unread styling.
- **Notifications page** (`/notifications`): Full paginated notification list with mark-all-read.
- `useNotifications` hook: poll or use socket for real-time unread count updates.

### Admin Completion Review
- **Pending Completion page** (`/admin/posts/pending-completion`): List posts in `da_giao_dich` status.
- Admin reviews if proof photos exist in comments, then marks as `hoan_thanh`.
- Show proof images inline for quick review.

## ✅ Acceptance Criteria
- [ ] Verified NGO/individual users can apply to receive items with a motivation message.
- [ ] Apply button is hidden when monthly quota is exhausted.
- [ ] Applicant list shows correct priority ordering (NGO → Individual → Member).
- [ ] Post owner can select one recipient; other applicants are automatically rejected.
- [ ] Selection triggers notification to all applicants (selected/rejected).
- [ ] Post owner can mark delivery and reopen if handoff fails.
- [ ] Recipients can upload proof photos.
- [ ] Notification bell shows real-time unread count.
- [ ] Admin can review and complete posts with proof verification.
- [ ] Completion timeline visualizes the full post lifecycle.
