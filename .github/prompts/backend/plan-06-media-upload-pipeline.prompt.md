# Media Upload Pipeline

## 🎯 Goal
Add the reusable upload pipeline for images and verification documents before feature endpoints start accepting files.

## ⚠️ Depends On
- plan-01-foundation-bootstrap.prompt.md

## 📋 Files to Create/Modify
- backend/package.json
- backend/src/config/cloudinary.js
- backend/src/middlewares/uploadImages.js
- backend/src/utils/mediaUpload.js
- backend/src/validators/uploadValidators.js

## 📎 Shared Context
#file:_context.prompt.md
#file:requirement.txt
#file:backend/package.json

## 📐 Implementation Details
- Add the upload-related dependencies needed for Multer memory storage, Sharp image processing, and Cloudinary uploads.
- Create `backend/src/config/cloudinary.js` to validate Cloudinary credentials and export a configured client.
- Create `backend/src/middlewares/uploadImages.js` for memory storage, MIME checks, file-size limits, and upload-count limits.
- Create `backend/src/utils/mediaUpload.js` to resize or compress images with Sharp and upload them to Cloudinary folders for posts, verification documents, avatars, proofs, and news thumbnails.
- Create `backend/src/validators/uploadValidators.js` for feature-level constraints such as post image max count `5` and required document presence for verification flows.
- Keep MongoDB storage metadata-only. Do not store raw file buffers in documents.

## ✅ Acceptance Criteria
- [ ] `backend/package.json` includes the dependencies required for uploads.
- [ ] Cloudinary configuration fails fast if required credentials are missing.
- [ ] Upload middleware enforces allowed MIME types and size limits.
- [ ] Utility upload code returns metadata and URLs, not raw buffers.
- [ ] Validation rules exist for both post images and verification documents.