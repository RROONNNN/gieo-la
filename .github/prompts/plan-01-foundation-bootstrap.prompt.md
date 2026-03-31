# Backend Foundation Bootstrap

## 🎯 Goal
Set up the backend foundation so all later domain plans can plug into a validated, versioned Express app.

## ⚠️ Depends On
None

## 📋 Files to Create/Modify
- backend/package.json
- backend/src/config/env.js
- backend/src/config/db.js
- backend/src/app.js
- backend/src/routes/index.js

## 📎 Shared Context
#file:_context.prompt.md
#file:backend/package.json
#file:backend/src/app.js
#file:backend/src/config/db.js

## 📐 Implementation Details
- Create `backend/src/config/env.js` to load dotenv once and validate required environment variables. Fail fast if `MONGODB_URI` or `JWT_SECRET` is missing.
- Refactor `backend/src/config/db.js` to use tuned Mongoose connection options such as `maxPoolSize`, `minPoolSize`, `serverSelectionTimeoutMS`, `socketTimeoutMS`, `maxIdleTimeMS`, `retryWrites`, and `appName`.
- In production, disable `autoIndex`. In development, keep index creation practical.
- Refactor `backend/src/app.js` so it builds the Express app, mounts middleware, registers `/health`, and mounts `backend/src/routes/index.js` at `/api/v1`.
- Add security and ops middleware in `app.js`: `cors`, `helmet`, JSON body limit, URL-encoded parser if needed, request logging, and a small auth-safe rate limiter.
- Add a placeholder API root route in `backend/src/routes/index.js` so future plans can extend one router instead of editing `app.js` repeatedly.
- Add a not-found handler and a centralized error response in `app.js` using the shared JSON envelope.
- Update `backend/package.json` scripts if needed, and add only the cross-cutting dependencies needed for this plan.
- Keep the current `/health` endpoint working.

## ✅ Acceptance Criteria
- [ ] `backend/src/config/env.js` validates required env vars and exports normalized config.
- [ ] `backend/src/app.js` mounts all APIs under `/api/v1`.
- [ ] `backend/src/routes/index.js` responds successfully for a root API probe route.
- [ ] MongoDB connection code uses explicit connection options instead of a bare `mongoose.connect(uri)` call.
- [ ] Unknown routes return a consistent JSON error response.