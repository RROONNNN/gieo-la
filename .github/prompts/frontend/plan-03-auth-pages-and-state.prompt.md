# Authentication Pages & Auth State

## 🎯 Goal
Build login, registration pages (member/NGO/individual), auth context, protected route middleware, and current-user hooks to enable authenticated flows across the app.

## ⚠️ Depends On
- FE plan-01-foundation-bootstrap (API client, layout, UI primitives)
- FE plan-02-user-verification-domain-types (User types)
- BE plan-03-auth-api-core (auth endpoints)

## 📋 Files to Create/Modify
- frontend/app/(auth)/login/page.tsx
- frontend/app/(auth)/register/page.tsx
- frontend/app/(auth)/register/member/page.tsx
- frontend/app/(auth)/register/ngo/page.tsx
- frontend/app/(auth)/register/individual/page.tsx
- frontend/app/(auth)/layout.tsx
- frontend/contexts/AuthContext.tsx
- frontend/hooks/useAuth.ts
- frontend/hooks/useRequireAuth.ts
- frontend/lib/api/auth.ts
- frontend/middleware.ts
- frontend/components/auth/LoginForm.tsx
- frontend/components/auth/RegisterMemberForm.tsx
- frontend/components/auth/RegisterNgoForm.tsx
- frontend/components/auth/RegisterIndividualForm.tsx
- frontend/components/auth/RoleSelector.tsx
- frontend/components/layout/UserMenu.tsx

## 📎 Shared Context
#file:requirement.txt
#file:frontend/types/user.ts

## 📐 Implementation Details

### Auth API Layer (`lib/api/auth.ts`)
- Create typed API functions: `loginApi(email, password)`, `registerMemberApi(data)`, `registerNgoApi(data)`, `registerIndividualApi(data)`, `getMeApi()`, `updateProfileApi(data)`.
- All functions use the shared API client from plan-01.
- Store JWT token in `httpOnly` cookie or `localStorage` (prefer cookie for security). If using localStorage, ensure XSS-safe patterns.

### Auth Context (`contexts/AuthContext.tsx`)
- Client Component with `'use client'` directive.
- Provide `user`, `isLoading`, `isAuthenticated`, `login()`, `logout()`, `register()`, `refreshUser()`.
- On mount, attempt to load current user via `GET /api/v1/auth/me`.
- On 401 response, clear auth state silently.
- Wrap the app with `AuthProvider` in layout.

### Auth Hooks
- `useAuth()` — access auth context values.
- `useRequireAuth(allowedRoles?)` — redirect to login if unauthenticated, optionally check role-based access.

### Middleware (`middleware.ts`)
- Use Next.js middleware to protect routes under `(dashboard)` and `(admin)` groups.
- Check for auth token in cookies/headers. Redirect unauthenticated users to `/login`.
- For admin routes, verify the user role claim if possible from the token.

### Auth Pages
- **Login page** (`/login`): Email + password form, "Chưa có tài khoản? Đăng ký" link, form validation with error display.
- **Register landing** (`/register`): Role selector — "Thành viên", "Tổ chức Thiện nguyện", "Cá nhân Khó khăn" — each links to its specific registration form.
- **Register Member** (`/register/member`): Name, email, password, confirm password.
- **Register NGO** (`/register/ngo`): Name, email, password, organization name, description, contact person, optional logo upload.
- **Register Individual** (`/register/individual`): Name, email, password, circumstance description, document upload (required). Show notice that account requires admin approval.
- Auth layout should be minimal (centered card, no main navigation).

### Form Validation
- Client-side validation with `zod` schemas matching backend validators.
- Inline error messages in Vietnamese.
- Loading states on submit buttons.

### User Menu Component
- Display user avatar, name, and role badge in the Header.
- Dropdown with: "Trang cá nhân", "Bài đăng của tôi", "Tin nhắn", "Đăng xuất".
- Show different menu items based on user role.

### Dependencies to Add
- `zod` for form validation.
- `js-cookie` or rely on `fetch` credentials for auth token management.

## ✅ Acceptance Criteria
- [ ] Users can register with 3 different account types.
- [ ] Login form authenticates and redirects to home page on success.
- [ ] Auth context provides current user state across the app.
- [ ] Protected routes redirect unauthenticated users to login.
- [ ] Individual registration clearly communicates the admin approval process.
- [ ] NGO registration accepts organization-specific fields.
- [ ] Form validation shows Vietnamese error messages inline.
- [ ] User menu in Header reflects the logged-in user's role and name.
- [ ] Next.js middleware blocks unauthenticated access to protected route groups.
