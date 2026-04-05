# Leaderboard, Profile & Admin Dashboard UI

## 🎯 Goal
Build the public leaderboard page, user profile pages, and the admin dashboard with summary stats, audit logs, and moderation tools.

## ⚠️ Depends On
- FE plan-01-foundation-bootstrap (layout, UI primitives)
- FE plan-03-auth-pages-and-state (auth context)
- FE plan-04-verification-admin-user-ui (admin layout)
- FE plan-05-post-notification-domain-types (Post, User types)
- BE plan-13-reporting-leaderboard-and-dashboard (reporting endpoints)

## 📋 Files to Create/Modify
- frontend/app/(public)/leaderboard/page.tsx
- frontend/app/(public)/profile/[id]/page.tsx
- frontend/app/(dashboard)/profile/page.tsx
- frontend/app/(dashboard)/profile/edit/page.tsx
- frontend/app/(admin)/admin/dashboard/page.tsx
- frontend/app/(admin)/admin/audit-logs/page.tsx
- frontend/lib/api/leaderboard.ts
- frontend/lib/api/profile.ts
- frontend/types/leaderboard.ts
- frontend/components/leaderboard/LeaderboardTable.tsx
- frontend/components/leaderboard/LeaderboardCard.tsx
- frontend/components/leaderboard/BadgeDisplay.tsx
- frontend/components/leaderboard/MonthSelector.tsx
- frontend/components/profile/ProfileHeader.tsx
- frontend/components/profile/ProfileStats.tsx
- frontend/components/profile/PostHistory.tsx
- frontend/components/profile/ReceivedHistory.tsx
- frontend/components/profile/FeedbackGallery.tsx
- frontend/components/admin/DashboardSummary.tsx
- frontend/components/admin/StatCard.tsx
- frontend/components/admin/AuditLogTable.tsx
- frontend/components/admin/PendingActionsWidget.tsx

## 📎 Shared Context
#file:requirement.txt

## 📐 Implementation Details

### Leaderboard Types (`types/leaderboard.ts`)
- Define `LeaderboardEntry` with: `rank`, `userId`, `user` (SafeUser), `completedCount`, `badge`.
- Define `LeaderboardSnapshot` with: `_id`, `monthKey`, `rankings` (LeaderboardEntry[]), `generatedAt`, `finalizedAt?`.

### API Layer
- `lib/api/leaderboard.ts`: `getCurrentLeaderboard()`, `getLeaderboardHistory(monthKey?)`.
- `lib/api/profile.ts`: `getUserProfile(id)`, `updateMyProfile(data)`.

### Leaderboard Page (`/leaderboard`)
- Server Component for SEO.
- Current month Top 10 with ranking table.
- **LeaderboardCard**: rank number, user avatar, name, role badge, completed donations count, badge icon.
- Top 1: special crown/gold styling ("Đại sứ Lá Lành").
- Top 2-5: silver badge ("Lá Lành Tích Cực").
- Top 6-10: bronze badge ("Mầm Lành Năng Nổ").
- **MonthSelector**: Dropdown to view historical leaderboards by month/quarter.
- Note: badges reset monthly (clearly communicated in UI).

### BadgeDisplay Component
- Reusable component to show badge icon inline with user name.
- Used in leaderboard, profile, post cards, and chat headers.

### Public Profile (`/profile/[id]`)
- Server Component.
- **ProfileHeader**: Avatar, name, role badge, verification badge, current leaderboard badge.
- **ProfileStats**: "Lá đã gieo" count, completed donations, current badge.
- **PostHistory**: List of user's posts with status.
- For verified individuals: **ReceivedHistory** (items received) + **FeedbackGallery** (thank-you photos).
- For NGOs: tích xanh, wishlist listings, organization info, logo.
- For donors: leaderboard rank, donation history.

### My Profile (`/profile`)
- Authenticated user viewing their own profile.
- Link to edit profile.

### Edit Profile (`/profile/edit`)
- Update safe fields: name, avatar (with AvatarUploader from plan-06), contact, location.
- NGO-specific: organization name, description, website.
- Cannot edit: email, role, verification status.

### Admin Dashboard (`/admin/dashboard`)
- **DashboardSummary** with **StatCard** widgets:
  - Pending verification requests count.
  - Active posts by status (sẵn sàng, đang giao dịch, đã giao dịch).
  - Posts pending completion review.
  - Total users by role.
  - This month's leaderboard leader.
- **PendingActionsWidget**: Quick links to pending verification requests, posts awaiting completion.
- Visual charts if time permits (bar chart for posts by status, line chart for monthly activity).

### Audit Logs Page (`/admin/audit-logs`)
- **AuditLogTable**: Paginated table of admin actions.
- Columns: date, actor, action, target, details.
- Filter by action type, date range, actor.
- Search by target ID.

## ✅ Acceptance Criteria
- [ ] Leaderboard page displays Top 10 with correct badge tiers.
- [ ] Historical leaderboard data is viewable by month.
- [ ] Badge display is consistent across all surfaces (leaderboard, profile, posts, chat).
- [ ] Public profile shows appropriate info based on user role.
- [ ] Verified individual profile shows received history and feedback gallery.
- [ ] NGO profile shows tích xanh and wishlist listings.
- [ ] Users can edit their own safe profile fields.
- [ ] Admin dashboard shows actionable summary stats.
- [ ] Audit log table supports filtering and pagination.
- [ ] Admin can quickly navigate to pending verification and completion tasks from the dashboard.
