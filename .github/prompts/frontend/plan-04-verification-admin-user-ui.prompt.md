# Verification Management & Admin User Controls UI

## 🎯 Goal
Build the admin UI for reviewing verification requests, managing user account status, and granting/revoking NGO verification. Also build the user-facing verification request submission flow.

## ⚠️ Depends On
- FE plan-01-foundation-bootstrap (layout, UI primitives)
- FE plan-02-user-verification-domain-types (Verification types)
- FE plan-03-auth-pages-and-state (auth context, role guards)
- BE plan-04-verification-admin-user-apis (admin endpoints)

## 📋 Files to Create/Modify
- frontend/app/(admin)/admin/layout.tsx
- frontend/app/(admin)/admin/page.tsx
- frontend/app/(admin)/admin/verification-requests/page.tsx
- frontend/app/(admin)/admin/users/page.tsx
- frontend/app/(admin)/admin/users/[id]/page.tsx
- frontend/lib/api/verification.ts
- frontend/lib/api/admin.ts
- frontend/components/admin/AdminSidebar.tsx
- frontend/components/admin/VerificationRequestCard.tsx
- frontend/components/admin/VerificationRequestDetail.tsx
- frontend/components/admin/UserManagementTable.tsx
- frontend/components/admin/UserDetailPanel.tsx
- frontend/components/verification/VerificationStatusBadge.tsx
- frontend/components/verification/VerificationSubmitForm.tsx

## 📎 Shared Context
#file:requirement.txt
#file:frontend/types/verification.ts
#file:frontend/types/user.ts

## 📐 Implementation Details

### Admin Layout
- Create admin layout with sidebar navigation: "Tổng quan", "Yêu cầu xác thực", "Quản lý người dùng", "Quản lý bài đăng", "Bản tin", "Bảng xếp hạng", "Nhật ký".
- Only accessible to users with `admin` role (enforced by middleware + client-side check).
- Responsive: sidebar collapses on mobile.

### Admin API Layer
- `lib/api/verification.ts`: `submitVerificationRequest(data)`, `getMyVerificationRequests()`.
- `lib/api/admin.ts`: `getVerificationRequests(filters)`, `approveVerification(id)`, `rejectVerification(id, reason)`, `setNgoVerification(userId, status)`, `setAccountStatus(userId, status)`, `getUsers(filters)`, `getUserById(id)`.

### Verification Request Management (Admin)
- **List page** (`/admin/verification-requests`): Filterable table of pending/approved/rejected requests. Show user info, request type, submission date, document thumbnails.
- **Detail view**: Expandable card or modal showing submitted documents (images viewable inline), user note, review actions.
- **Approve action**: Confirmation dialog → call approve API → show success toast.
- **Reject action**: Require rejection reason input → call reject API → show success toast.

### User Management (Admin)
- **User list** (`/admin/users`): Searchable, filterable table with columns: name, email, role, account status, verification status, created date.
- **User detail** (`/admin/users/[id]`): Full user profile view, action buttons for: lock/unlock account, grant/revoke NGO verification, view verification history.
- Each admin action should show a confirmation dialog and create visual feedback (toast).

### User-facing Verification
- For `individual` users with `unverified` status: show a prompt on their profile or dashboard to submit verification documents.
- `VerificationSubmitForm`: Upload documents (images of hộ nghèo, cận nghèo papers), add a note, submit.
- Show current verification status with clear Vietnamese labels.

### Shared Components
- `VerificationStatusBadge`: Color-coded badge for pending (yellow), approved (green), rejected (red).

## ✅ Acceptance Criteria
- [ ] Admin sidebar navigation provides access to all admin sections.
- [ ] Admin can view, filter, approve, and reject verification requests.
- [ ] Admin can view submitted verification documents inline.
- [ ] Admin can lock/unlock user accounts with confirmation.
- [ ] Admin can grant/revoke NGO verified status.
- [ ] Individual users can submit verification requests with document uploads.
- [ ] All admin actions show confirmation dialogs and success/error feedback.
- [ ] Admin layout is only accessible to users with `admin` role.
