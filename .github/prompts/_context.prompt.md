# Shared Backend Context

## Tech Stack & Versions
- Backend lives in `backend/` and currently uses CommonJS modules.
- Runtime stack already present: Express `5.2.1`, Mongoose `9.3.3`, bcryptjs `3.0.3`, jsonwebtoken `9.0.3`, cors `2.8.6`, dotenv `17.3.1`, nodemon `3.1.14`, ESLint `10.x`.
- Planned additions from the master plan: zod or joi, helmet, express-rate-limit, morgan or pino-http, multer, sharp, cloudinary, socket.io, node-cron, and vitest or jest with supertest.

## Project Structure
- Current backend entry is `backend/src/app.js`.
- Existing folders: `config/`, `controllers/`, `middlewares/`, `models/`, `routes/`, `utils/`.
- New code should stay inside `backend/src/` unless a plan explicitly adds tests or seed scripts under `backend/tests/` or `backend/scripts/`.

## Naming Conventions
- Keep CommonJS style: `require(...)` and `module.exports`.
- Use PascalCase file names for Mongoose models, for example `User.js` and `Conversation.js`.
- Use camelCase file names for controllers, services, middlewares, routes, validators, utils, and jobs.
- Use camelCase for field names and function names.
- Mount all HTTP APIs under `/api/v1`.

## Common Backend Patterns
- Use a consistent JSON envelope when practical.
- Success shape: `{ success: true, message, data }`.
- Error shape: `{ success: false, message, errors? }`.
- Prefer `async/await` and forward errors through Express middleware instead of duplicating `try/catch` response code everywhere.
- Validate Mongo ObjectIds before querying.
- Use `lean()` and field projection on list endpoints.
- Disable `autoIndex` in production and rely on explicit schema indexes.

## Domain Rules That Must Stay Consistent
- User roles are `member`, `ngo`, `individual`, and `admin`. Guest is anonymous client state, not a persisted database user.
- Conversation is account-to-account only. It must never store `postId` or `applicationId`.
- A conversation is uniquely identified by the sorted pair of two participant user IDs.
- Chat is only allowed after a donor has selected a recipient. Once created, that conversation can continue independently of any single post.
- Post statuses are `san_sang`, `dang_giao_dich`, `da_giao_dich`, and `hoan_thanh`.
- Verified individual receive quota is `3` completed receives per UTC month.
- Verified NGO receive quota is `10` completed receives per UTC month.
- Admin is the only role allowed to move a post from `da_giao_dich` to `hoan_thanh`.
- The backend plan allows reopening a post from `dang_giao_dich` back to `san_sang`, but it must leave an audit trail.

## Environment Assumptions
- Baseline env vars: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `PORT`, `NODE_ENV`.
- Upload plans add: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Assume MongoDB uses UTC timestamps and month boundaries for quota and leaderboard calculations.

## Implementation Expectations
- Keep each sub-plan scoped to its listed files.
- Preserve existing style where possible, but prefer clearer naming over legacy shortcuts.
- Do not reintroduce `Conversation.postId` or `Conversation.applicationId` anywhere.