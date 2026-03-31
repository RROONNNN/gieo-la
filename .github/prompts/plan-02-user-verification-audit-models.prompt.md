# User, Verification, and Audit Models

## 🎯 Goal
Expand the user domain so authentication, verification, moderation, and auditing have the required schema support.

## ⚠️ Depends On
- plan-01-foundation-bootstrap.prompt.md

## 📋 Files to Create/Modify
- backend/src/models/User.js
- backend/src/models/VerificationRequest.js
- backend/src/models/AuditLog.js
- backend/src/utils/generateToken.js

## 📎 Shared Context
#file:_context.prompt.md
#file:requirement.txt
#file:backend/src/models/User.js
#file:backend/src/utils/generateToken.js

## 📐 Implementation Details
- Replace the minimal `User` schema with a role-aware account model.
- Rename persisted password storage from `password` to `passwordHash`.
- Keep roles aligned to authenticated accounts only: `member`, `ngo`, `individual`, `admin`.
- Add explicit account lifecycle fields such as `accountStatus`, `verificationStatus`, `lastLoginAt`, avatar, contact, location, badge, and counters.
- Add nested profile areas for NGO information and individual verification metadata when useful.
- Add indexes for unique email and the main admin query paths.
- Create `VerificationRequest` as a separate collection with `userId`, `requestType`, submitted document metadata, status, reviewer, review timestamps, rejection reason, and notes.
- Create `AuditLog` as a generic moderation and workflow trail with actor, target, action, metadata, IP, user agent, and timestamps.
- Update `generateToken` so JWT payload includes at least `id` and `role`. Prefer a shorter access-token lifetime than the current `30d` value.
- Keep schema definitions implementation-friendly for later plans. Avoid over-modeling fields that the current product does not use.

## ✅ Acceptance Criteria
- [ ] `User` stores `passwordHash` instead of `password`.
- [ ] `User` includes role, account status, verification-related fields, badge, and counters.
- [ ] `VerificationRequest` exists as its own model and does not embed full workflow history inside `User`.
- [ ] `AuditLog` exists as its own model for admin and workflow events.
- [ ] JWT generation includes role-aware payload data and uses a shorter expiry than `30d`.