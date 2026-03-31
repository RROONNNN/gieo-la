# Auth API Core

## 🎯 Goal
Implement the core authentication and current-user profile endpoints on top of the expanded user model.

## ⚠️ Depends On
- plan-01-foundation-bootstrap.prompt.md
- plan-02-user-verification-audit-models.prompt.md

## 📋 Files to Create/Modify
- backend/src/controllers/authController.js
- backend/src/middlewares/auth.js
- backend/src/routes/authRoutes.js
- backend/src/validators/authValidators.js
- backend/src/routes/index.js

## 📎 Shared Context
#file:_context.prompt.md
#file:requirement.txt
#file:backend/src/controllers/authController.js
#file:backend/src/models/User.js

## 📐 Implementation Details
- Add role-specific registration handlers for `register-member`, `register-ngo`, and `register-individual`.
- Preserve one login endpoint that authenticates by email and password.
- Add `GET /api/v1/auth/me` to return the authenticated account and `PATCH /api/v1/auth/me` to update only safe profile fields.
- On registration, set the correct default role, account status, and verification state for each account type.
- Hash incoming passwords into `passwordHash` using bcrypt.
- Build `backend/src/middlewares/auth.js` to parse Bearer tokens, verify JWTs, load the current user, and block locked or disabled accounts.
- Export a simple role guard from the same middleware file if it helps later plans.
- Validate payloads with Zod or Joi inside `backend/src/validators/authValidators.js`.
- Keep responses consistent with the shared JSON envelope.
- Mount the new auth router from `backend/src/routes/index.js`.

## ✅ Acceptance Criteria
- [ ] The backend exposes register routes for member, NGO, and individual accounts.
- [ ] Login verifies `passwordHash` and returns a signed token plus safe user fields.
- [ ] `GET /api/v1/auth/me` works for a valid Bearer token.
- [ ] `PATCH /api/v1/auth/me` cannot edit privileged fields such as role or verification status.
- [ ] `backend/src/routes/index.js` mounts the auth router under `/auth`.