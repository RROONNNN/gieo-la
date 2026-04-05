# Frontend Foundation Bootstrap

## 🎯 Goal
Set up the frontend project structure, shared utilities, API client, design system tokens, and layout components so all later feature plans plug into a consistent, type-safe Next.js 16 app.

## ⚠️ Depends On
- BE plan-01-foundation-bootstrap (API base URL, health endpoint)

## 📋 Files to Create/Modify
- frontend/next.config.ts
- frontend/app/layout.tsx
- frontend/app/globals.css
- frontend/lib/api/client.ts
- frontend/lib/api/endpoints.ts
- frontend/lib/utils.ts
- frontend/types/api.ts
- frontend/types/index.ts
- frontend/components/ui/Button.tsx
- frontend/components/ui/Input.tsx
- frontend/components/ui/Badge.tsx
- frontend/components/ui/Card.tsx
- frontend/components/ui/Spinner.tsx
- frontend/components/layout/Header.tsx
- frontend/components/layout/Footer.tsx
- frontend/components/layout/MainLayout.tsx
- frontend/components/layout/MobileNav.tsx

## 📎 Shared Context
#file:requirement.txt
#file:frontend/package.json
#file:frontend/tsconfig.json
#file:frontend/app/layout.tsx
#file:frontend/next.config.ts

## 📐 Implementation Details

### Project Structure
- Establish the folder convention: `app/` for routing, `components/` for reusable UI, `lib/` for utilities and API clients, `types/` for TypeScript definitions, `hooks/` for custom hooks, `contexts/` for React providers, `stores/` for client state if needed.
- Use `@/*` path alias already configured in `tsconfig.json`.
- Use route groups `(public)`, `(auth)`, `(dashboard)`, `(admin)` to organize pages without affecting URL paths.

### Next.js Configuration
- Update `next.config.ts` with image domains for Cloudinary, API rewrites or env-based API URL, and any required headers.
- Set `NEXT_PUBLIC_API_URL` as the backend base URL environment variable.

### API Client
- Create `lib/api/client.ts` as a thin fetch wrapper with base URL, JSON headers, auth token injection, and consistent error handling.
- The client should return typed responses matching the backend JSON envelope `{ success, data, message, error }`.
- Create `lib/api/endpoints.ts` with constants for all API path segments (to be filled in by later plans).
- Handle 401 responses globally (redirect to login or clear auth state).

### Type Foundation
- Create `types/api.ts` with the generic API response envelope type `ApiResponse<T>`.
- Create `types/index.ts` as a barrel export for shared types across the app.

### Design System & Layout
- Set up Tailwind CSS 4 design tokens in `globals.css`: brand colors (greens for "Lá Lành" theme), typography scale, spacing, border radius.
- Create basic reusable UI primitives: `Button`, `Input`, `Badge`, `Card`, `Spinner`.
- Build the `MainLayout` with `Header` (logo, navigation, auth buttons) and `Footer` (NGO logos slider section, copyright).
- Header navigation should include links to: Trang chủ, Diễn đàn, Wishlist, Bản tin, Bảng xếp hạng.
- Add responsive mobile navigation with hamburger menu.
- Update `app/layout.tsx` with Vietnamese lang attribute, proper metadata for "Lá Lành", and Vietnamese-friendly font setup.

### Utilities
- Create `lib/utils.ts` with `cn()` helper for conditional Tailwind classes (using `clsx` + `tailwind-merge`).
- Add date formatting utilities for Vietnamese locale.

### Dependencies to Add
- `clsx` and `tailwind-merge` for className composition.
- `lucide-react` for icons.

## ✅ Acceptance Criteria
- [ ] Project folder structure follows the established convention with `components/`, `lib/`, `types/`, `hooks/`, `contexts/`.
- [ ] `lib/api/client.ts` can make authenticated and unauthenticated requests to the backend API.
- [ ] `ApiResponse<T>` type matches the backend JSON envelope format.
- [ ] `MainLayout` renders Header with navigation and Footer across all pages.
- [ ] Tailwind design tokens reflect the "Lá Lành" green brand theme.
- [ ] Basic UI primitives (`Button`, `Input`, `Badge`, `Card`, `Spinner`) are reusable and typed.
- [ ] `app/layout.tsx` has correct Vietnamese metadata and lang attribute.
- [ ] Mobile navigation works on small screens.
