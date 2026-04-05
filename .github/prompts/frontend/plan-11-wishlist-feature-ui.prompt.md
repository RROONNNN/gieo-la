# Wishlist Feature UI

## 🎯 Goal
Build the NGO wishlist browse page, NGO wishlist management, and admin pin controls for urgent wishlist requests.

## ⚠️ Depends On
- FE plan-01-foundation-bootstrap (layout, UI primitives)
- FE plan-03-auth-pages-and-state (auth context, role guards)
- FE plan-06-media-upload-components (image upload)
- BE plan-11-wishlist-feature (wishlist endpoints)

## 📋 Files to Create/Modify
- frontend/app/(public)/wishlist/page.tsx
- frontend/app/(public)/wishlist/[id]/page.tsx
- frontend/app/(dashboard)/wishlist/manage/page.tsx
- frontend/app/(dashboard)/wishlist/new/page.tsx
- frontend/app/(dashboard)/wishlist/[id]/edit/page.tsx
- frontend/lib/api/wishlist.ts
- frontend/types/wishlist.ts
- frontend/components/wishlist/WishlistCard.tsx
- frontend/components/wishlist/WishlistGrid.tsx
- frontend/components/wishlist/WishlistDetail.tsx
- frontend/components/wishlist/WishlistForm.tsx
- frontend/components/wishlist/WishlistPinBadge.tsx

## 📎 Shared Context
#file:requirement.txt

## 📐 Implementation Details

### Wishlist Types (`types/wishlist.ts`)
- Define `WishlistStatus`: `active`, `fulfilled`, `closed`.
- Define `Wishlist` interface with: `_id`, `ngoId`, `ngo?` (populated SafeUser with NGO profile), `title`, `category`, `quantity`, `purpose`, `description`, `images`, `status`, `isPinned`, `createdAt`, `updatedAt`.
- Define `CreateWishlistInput` and `UpdateWishlistInput`.

### API Layer (`lib/api/wishlist.ts`)
- `getWishlists(filters?)`, `getWishlistById(id)`, `createWishlist(data)`, `updateWishlist(id, data)`, `deleteWishlist(id)`, `pinWishlist(id)` (admin), `unpinWishlist(id)` (admin).

### Public Wishlist Page (`/wishlist`)
- Server Component for SEO.
- List of active wishlist entries from verified NGOs.
- Pinned items appear first with "Khẩn cấp" badge.
- Filter by category.
- Each `WishlistCard`: NGO logo/avatar + tích xanh, title, category badge, quantity, purpose snippet.
- Click navigates to `/wishlist/[id]`.

### Wishlist Detail (`/wishlist/[id]`)
- Full wishlist information: NGO profile, item details, purpose, description, contact info.
- CTA for members: "Liên hệ tặng đồ" (links to the NGO's profile or opens chat if applicable).

### NGO Wishlist Management (`/wishlist/manage`)
- Protected route, only accessible to verified NGO users.
- List of NGO's own wishlist entries with status filters.
- Actions: create, edit, delete, change status.

### WishlistForm
- Used for create and edit.
- Fields: title, category, quantity, purpose, description, images.
- Validation with zod.

### Admin Pin Control
- Admin can pin/unpin wishlist entries from the admin dashboard (handled in admin UI) or from the wishlist detail page.

## ✅ Acceptance Criteria
- [ ] Public users (including guests) can browse and view wishlist entries.
- [ ] Pinned wishlist entries appear first with an "Khẩn cấp" badge.
- [ ] Verified NGO users can create, edit, and delete their own wishlist entries.
- [ ] Only verified NGO users see the wishlist management section.
- [ ] Wishlist detail shows full NGO profile with tích xanh verification.
- [ ] Admin can pin/unpin wishlist entries.
- [ ] Wishlist form validates all required fields.
