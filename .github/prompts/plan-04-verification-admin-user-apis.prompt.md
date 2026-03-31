# Verification and Admin User APIs

## 🎯 Goal
Implement verification request workflows and the admin controls needed to approve, reject, verify, or lock user accounts.

## ⚠️ Depends On
- plan-01-foundation-bootstrap.prompt.md
- plan-02-user-verification-audit-models.prompt.md
- plan-03-auth-api-core.prompt.md

## 📋 Files to Create/Modify
- backend/src/controllers/verificationController.js
- backend/src/routes/verificationRoutes.js
- backend/src/routes/adminUserRoutes.js
- backend/src/validators/verificationValidators.js
- backend/src/routes/index.js

## 📎 Shared Context
#file:_context.prompt.md
#file:requirement.txt
#file:backend/src/models/VerificationRequest.js
#file:backend/src/models/AuditLog.js

## 📐 Implementation Details
- Add `POST /api/v1/verification-requests` and `GET /api/v1/verification-requests/me` for authenticated users.
- Verification submission must store document metadata and a human note. Do not store raw binary data in MongoDB.
- Add admin endpoints to list verification requests and approve or reject them.
- Add admin endpoints to set NGO verification status and to change `accountStatus` for any user.
- Approval or rejection must update both the request record and the relevant fields on `User`.
- Write an `AuditLog` entry for approval, rejection, NGO verification changes, and account locking or unlocking.
- Validate payloads and reasons with `backend/src/validators/verificationValidators.js`.
- Mount both verification and admin-user routes from `backend/src/routes/index.js`.

## ✅ Acceptance Criteria
- [ ] Users can submit and view their own verification requests.
- [ ] Admin can list pending verification requests.
- [ ] Admin approve and reject actions update both `VerificationRequest` and `User`.
- [ ] Admin can modify NGO verification state and user account status.
- [ ] All admin moderation actions create an `AuditLog` document.