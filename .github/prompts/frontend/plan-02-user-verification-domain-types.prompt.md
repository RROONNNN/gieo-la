# User, Verification & Domain Types

## 🎯 Goal
Define all TypeScript types and interfaces for User, Verification, and Audit domains to match backend models and enable type-safe development across the frontend.

## ⚠️ Depends On
- FE plan-01-foundation-bootstrap
- BE plan-02-user-verification-audit-models (schema definitions)

## 📋 Files to Create/Modify
- frontend/types/user.ts
- frontend/types/verification.ts
- frontend/types/audit.ts
- frontend/types/enums.ts
- frontend/types/index.ts

## 📎 Shared Context
#file:requirement.txt
#file:backend/src/models/User.js
#file:backend/src/models/VerificationRequest.js
#file:backend/src/models/AuditLog.js
#file:backend/src/constants/userEnums.js

## 📐 Implementation Details

### User Types (`types/user.ts`)
- Define `UserRole` enum: `member`, `ngo`, `individual`, `admin`.
- Define `AccountStatus` enum: `active`, `locked`, `disabled`.
- Define `VerificationStatus` enum: `unverified`, `pending`, `verified`, `rejected`.
- Define `User` interface with: `_id`, `name`, `email`, `role`, `accountStatus`, `verificationStatus`, `avatar`, `contact`, `location`, `ngoProfile?`, `individualProfile?`, `currentBadge?`, `stats`, `lastLoginAt`, `createdAt`, `updatedAt`.
- Define `NgoProfile` with: `organizationName`, `description`, `logo`, `website`, `contactPerson`.
- Define `IndividualProfile` with: `circumstanceDescription`, `documents`.
- Define `UserStats` with: `totalPosts`, `completedDonations`, `monthlyCompletions`.
- Define `SafeUser` as the public-facing user shape (no sensitive fields).
- Define `BadgeType` enum: `dai_su_la_lanh`, `la_lanh_tich_cuc`, `mam_lanh_nang_no`, `none`.

### Verification Types (`types/verification.ts`)
- Define `VerificationRequest` interface with: `_id`, `userId`, `requestType`, `submittedDocuments`, `note`, `status`, `reviewedBy?`, `reviewedAt?`, `rejectionReason?`, `createdAt`, `updatedAt`.
- Define `VerificationRequestStatus`: `pending`, `approved`, `rejected`.
- Define `VerificationRequestType`: `individual`, `ngo`.
- Define `SubmittedDocument` with: `url`, `publicId`, `originalName`, `mimeType`.

### Audit Types (`types/audit.ts`)
- Define `AuditLog` interface with: `_id`, `actorId`, `action`, `targetType`, `targetId`, `metadata`, `ip`, `userAgent`, `createdAt`.
- Define `AuditAction` union type for known action strings.

### Shared Enums (`types/enums.ts`)
- Centralize all enum types shared across multiple domains.
- Export category enum: `do_nam`, `do_nu`, `do_tre_em`, `phu_kien`.

### Barrel Export
- Update `types/index.ts` to re-export all domain types.

## ✅ Acceptance Criteria
- [ ] `User` type matches the backend model fields (excluding `passwordHash`).
- [ ] All role, status, and verification enums are defined and match backend constants.
- [ ] `SafeUser` type excludes sensitive fields for public display.
- [ ] `VerificationRequest` type supports document metadata and admin review fields.
- [ ] `AuditLog` type supports all audit event shapes.
- [ ] All types are exported from `types/index.ts` barrel.
