# NGO Wishlist Feature

## 🎯 Goal
Implement verified-NGO wishlist management plus public browsing and admin pinning.

## ⚠️ Depends On
- plan-01-foundation-bootstrap.prompt.md
- plan-03-auth-api-core.prompt.md
- plan-06-media-upload-pipeline.prompt.md

## 📋 Files to Create/Modify
- backend/src/models/Wishlist.js
- backend/src/controllers/wishlistController.js
- backend/src/routes/wishlistRoutes.js
- backend/src/routes/index.js

## 📎 Shared Context
#file:_context.prompt.md
#file:requirement.txt

## 📐 Implementation Details
- Create `Wishlist` as a separate collection, not a `Post` subtype.
- Support NGO-only create, update, and delete operations for verified NGO accounts.
- Support public list and detail endpoints for published or active wishlists.
- Add admin pin and unpin control for urgent requests.
- Include title, category, quantity, purpose, description, image metadata, status, and pin state.
- Keep query paths index-friendly for status, pin state, and created time.

## ✅ Acceptance Criteria
- [ ] Verified NGO accounts can create and manage their own wishlist entries.
- [ ] Public clients can list and view wishlist entries.
- [ ] Admin can pin a wishlist entry.
- [ ] Wishlist documents stay separate from the `Post` model.