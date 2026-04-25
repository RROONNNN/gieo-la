# Gieo La Specs and Test Cases (Coverage Report)

Updated: 2026-04-22  
Inputs used:
- requirement.txt
- Code scan (backend + frontend)
- Automated test run: `cd backend && npm test -- --runInBand`

Status legend:
- 🟢 `PASS-AUTO`: passed by automated test execution
- 🔵 `PASS-SCAN`: passed by implementation scan (no automated test run for this case)
- 🟡 `PARTIAL`: implemented partly, missing flow/UI/validation details
- 🔴 `FAIL`: missing implementation

## 1) Spec List (derived from requirement.txt)

| Spec ID | Requirement Summary | Status | Evidence |
|---|---|---|---|
| SP-01 | Guest can read post feed and post detail (read-only) | 🔵 PASS-SCAN | backend/src/routes/postRoutes.js, frontend/app/(public)/posts/page.tsx, frontend/app/(public)/posts/[id]/page.tsx |
| SP-02 | Member account can register/login and CRUD own posts | 🔵 PASS-SCAN | backend/src/routes/authRoutes.js, backend/src/controllers/postController.js |
| SP-03 | Member cannot apply for receiving items; only verified NGO or verified Individual can apply | 🔵 PASS-SCAN | backend/src/controllers/applicationController.js |
| SP-04 | Admin can grant/revoke NGO verified status | 🔵 PASS-SCAN | backend/src/controllers/verificationController.js, backend/src/routes/adminUserRoutes.js |
| SP-05 | Verified NGO can apply with monthly limit = 10 and gets priority in application list | 🔵 PASS-SCAN | backend/src/controllers/applicationController.js |
| SP-06 | Verified NGO can create/manage Wishlist posts on /wishlist | 🔴 FAIL | Missing model/route/page for wishlist |
| SP-07 | Individual verification request with documents, admin approve/reject flow | 🔵 PASS-SCAN | backend/src/controllers/verificationController.js, backend/src/models/VerificationRequest.js |
| SP-08 | Verified Individual monthly limit = 3 and apply button auto-hide when reached limit | 🟡 PARTIAL | Limit exists in backend; no explicit frontend hide/unhide monthly behavior found |
| SP-09 | Admin can suspend/ban/reactivate user accounts | 🔵 PASS-SCAN | backend/src/controllers/verificationController.js (`updateAccountStatus`) |
| SP-10 | Post schema supports category/quantity/condition/images/description | 🔵 PASS-SCAN | backend/src/models/Post.js, backend/src/validators/postValidators.js |
| SP-11 | Post status flow: available -> in_transaction -> traded -> completed (admin finalizes) | 🔵 PASS-SCAN | backend/src/controllers/postController.js |
| SP-12 | Application flow (NGO/Individual only): apply message, public listing, author selects one, auto reject others | 🔵 PASS-SCAN | backend/src/controllers/applicationController.js |
| SP-13 | Notifications sent to selected and unselected applicants | 🔴 FAIL | No notification model/service/routes found |
| SP-14 | Chat 1-1 created after recipient selection and reused later | 🔴 FAIL | No chat model/routes/pages found |
| SP-15 | Leaderboard monthly top 10 from completed posts, monthly reset badges | 🔴 FAIL | No leaderboard logic/routes/pages found |
| SP-16 | Search and filters: full-text, category, status | 🔵 PASS-SCAN | backend/src/controllers/postController.js, frontend/components/posts/PostFilters.tsx |
| SP-17 | Location-based default Hanoi filter | 🔴 FAIL | No default Hanoi filter logic found |
| SP-18 | Profile page shows role-specific history (donated/received/feedback photos) | 🟡 PARTIAL | Public profile exists; no received history/feedback photo flows |
| SP-19 | Admin dashboard: verification/user moderation/post moderation/complete/pin | 🟡 PARTIAL | Core endpoints exist; several admin pages are still missing |
| SP-20 | Transparency: feedback loop with confirmation image in thread/comments | 🔴 FAIL | No comment/thread/feedback model or APIs |
| SP-21 | History logs for complaint investigation | 🟡 PARTIAL | AuditLog model + writes exist; no full admin history UI/API flow |
| SP-22 | Public pages required: /, /posts, /posts/[id], /profile/[id] | 🔵 PASS-SCAN | frontend/app/(public)/page.tsx, frontend/app/(public)/posts/page.tsx, frontend/app/(public)/posts/[id]/page.tsx, frontend/app/(public)/profile/[id]/page.tsx |
| SP-23 | Required pages /wishlist, /leaderboard, /chat | 🔴 FAIL | Missing pages/routes |
| SP-24 | News/Blog module: admin CRUD + publish/hidden + pinned + /news listing/detail | 🔴 FAIL | Only mock news UI card on home; no backend/news pages |
| SP-25 | Home page shows latest 3 news items + link to /news | 🟡 PARTIAL | Implemented with mock data only in frontend/app/(public)/page.tsx |

## 2) Test Cases (all cases tracked in this file)

| Test Case ID | Related Spec | Test Scenario | Expected Result | Status |
|---|---|---|---|---|
| TC-01 | SP-01 | Guest requests post listing | Get list successfully without auth | 🔵 PASS-SCAN |
| TC-02 | SP-01 | Guest opens post detail | Get detail successfully without auth | 🔵 PASS-SCAN |
| TC-03 | SP-02 | Register member account | Account created with role member | 🔵 PASS-SCAN |
| TC-04 | SP-02 | Member creates post | Post created with author = current member | 🔵 PASS-SCAN |
| TC-05 | SP-02 | Member updates own post in available status | Update succeeds | 🔵 PASS-SCAN |
| TC-06 | SP-02 | Member deletes own post | Delete succeeds | 🔵 PASS-SCAN |
| TC-07 | SP-03 | Member applies for receiving item | API returns forbidden (only NGO/Individual are eligible) | 🔵 PASS-SCAN |
| TC-08 | SP-04 | Admin grants NGO status | User role becomes ngo + verified | 🔵 PASS-SCAN |
| TC-09 | SP-04 | Admin revokes NGO status | User role returns member + unverified | 🔵 PASS-SCAN |
| TC-10 | SP-05 | NGO applies more than 10 selected items/month | Request blocked by monthly limit | 🔵 PASS-SCAN |
| TC-11 | SP-05 | Public application list sorting | Only NGO/Individual applicants are listed, with NGO priority first | 🔵 PASS-SCAN |
| TC-12 | SP-06 | NGO opens /wishlist page | Wishlist page exists and loads | 🔴 FAIL |
| TC-13 | SP-06 | NGO creates wishlist post | Wishlist post saved successfully | 🔴 FAIL |
| TC-14 | SP-07 | User submits verification with invalid payload | Return 400 validation error | 🟢 PASS-AUTO |
| TC-15 | SP-07 | User submits duplicated pending verification | Return 409 conflict | 🟢 PASS-AUTO |
| TC-16 | SP-07 | User submits valid verification | Return 201 and create request | 🟢 PASS-AUTO |
| TC-17 | SP-07 | Admin approves verification request | Request approved and user verified | 🔵 PASS-SCAN |
| TC-18 | SP-07 | Admin rejects verification request with reason | Request rejected and reason stored | 🔵 PASS-SCAN |
| TC-19 | SP-08 | Individual exceeds 3 selected items/month | API returns limit reached | 🔵 PASS-SCAN |
| TC-20 | SP-08 | Frontend hides apply button after limit reached | Apply button hidden until next month | 🟡 PARTIAL |
| TC-21 | SP-09 | Admin suspends/bans/reactivates account | accountStatus updated correctly | 🔵 PASS-SCAN |
| TC-22 | SP-10 | Create post with missing required field | Validation fails | 🔵 PASS-SCAN |
| TC-23 | SP-10 | Create post with >5 images | Validation fails | 🔵 PASS-SCAN |
| TC-24 | SP-11 | Author changes available -> in_transaction | Transition accepted | 🔵 PASS-SCAN |
| TC-25 | SP-11 | Author changes in_transaction -> traded | Transition accepted | 🔵 PASS-SCAN |
| TC-26 | SP-11 | Invalid transition blocked | Return 409 invalid transition | 🔵 PASS-SCAN |
| TC-27 | SP-11 | Admin marks traded -> completed | Status becomes completed, donation count increments | 🔵 PASS-SCAN |
| TC-28 | SP-12 | Eligible user applies with message | Application created | 🔵 PASS-SCAN |
| TC-29 | SP-12 | Post author selects one applicant | Selected=selected, others=rejected, post=in_transaction | 🔵 PASS-SCAN |
| TC-30 | SP-13 | Selection triggers notify selected user | Selected user receives success notification | 🔴 FAIL |
| TC-31 | SP-13 | Selection triggers notify unselected users | Unselected users receive rejection notification | 🔴 FAIL |
| TC-32 | SP-14 | Chat auto-created when author selects applicant | Conversation record created | 🔴 FAIL |
| TC-33 | SP-14 | Two users can continue 1-1 chat after transaction | Messages persist and can be exchanged | 🔴 FAIL |
| TC-34 | SP-15 | Monthly leaderboard generated from completed posts | Top 10 rendered correctly | 🔴 FAIL |
| TC-35 | SP-15 | Monthly reset updates rankings/badges | New month ranking reset executed | 🔴 FAIL |
| TC-36 | SP-16 | Search by keyword title/description | Matching posts returned | 🔵 PASS-SCAN |
| TC-37 | SP-16 | Filter by category/status | Filtered posts returned | 🔵 PASS-SCAN |
| TC-38 | SP-17 | Default listing constrained to Hanoi | Initial feed uses Hanoi filter | 🔴 FAIL |
| TC-39 | SP-18 | Public profile shows donated history and role badge | Data visible on profile page | 🟡 PARTIAL |
| TC-40 | SP-18 | Individual profile shows received history and thank-you photos | Data visible on profile page | 🔴 FAIL |
| TC-41 | SP-19 | Admin opens user management page | /admin/users page exists and works | 🔴 FAIL |
| TC-42 | SP-19 | Admin opens verification queue page | /admin/verifications page exists and works | 🔴 FAIL |
| TC-43 | SP-19 | Admin post moderation page supports complete/pin/delete | Actions call backend successfully | 🔵 PASS-SCAN |
| TC-44 | SP-20 | Receiver uploads confirmation image in comment/thread | Image feedback linked to post thread | 🔴 FAIL |
| TC-45 | SP-21 | Audit logs query for disputes | Admin can retrieve action history | 🟡 PARTIAL |
| TC-46 | SP-22 | Home page loads hero/search/categories/latest posts | Public home renders correctly | 🔵 PASS-SCAN |
| TC-47 | SP-22 | Public routes /posts and /profile/:id open correctly | Route rendering works | 🔵 PASS-SCAN |
| TC-48 | SP-23 | /wishlist route exists | Route resolves | 🔴 FAIL |
| TC-49 | SP-23 | /leaderboard route exists | Route resolves | 🔴 FAIL |
| TC-50 | SP-23 | /chat route exists | Route resolves | 🔴 FAIL |
| TC-51 | SP-24 | Admin creates draft/published news | News API + admin page works | 🔴 FAIL |
| TC-52 | SP-24 | Public /news lists published posts and pinned first | News feed order correct | 🔴 FAIL |
| TC-53 | SP-24 | Public /news/:id renders full article | Article detail available | 🔴 FAIL |
| TC-54 | SP-25 | Home news section shows 3 latest news from backend | Live data from backend API | 🟡 PARTIAL |

## 3) Automated Test Execution Snapshot

Executed suite: `backend/src/controllers/__tests__/verificationController.test.js`

- 🟢 PASS: `returns 400 when request body validation fails`
- 🟢 PASS: `returns 409 when user already has a pending request of same type`
- 🟢 PASS: `returns 201 and creates verification request on valid input`

Result: `1` suite passed, `3` tests passed, `0` failed.
