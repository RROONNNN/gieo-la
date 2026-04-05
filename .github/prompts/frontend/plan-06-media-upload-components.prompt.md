# Media Upload Components

## 🎯 Goal
Build reusable image upload, preview, and compression components that power post creation, verification document submission, avatar upload, proof photos, and news thumbnails.

## ⚠️ Depends On
- FE plan-01-foundation-bootstrap (UI primitives, API client)
- BE plan-06-media-upload-pipeline (upload endpoints, size/count limits)

## 📋 Files to Create/Modify
- frontend/components/upload/ImageUploader.tsx
- frontend/components/upload/ImagePreview.tsx
- frontend/components/upload/ImageGrid.tsx
- frontend/components/upload/AvatarUploader.tsx
- frontend/components/upload/DocumentUploader.tsx
- frontend/hooks/useImageUpload.ts
- frontend/lib/utils/imageCompression.ts
- frontend/types/upload.ts

## 📎 Shared Context
#file:requirement.txt
#file:frontend/types/post.ts

## 📐 Implementation Details

### Upload Types (`types/upload.ts`)
- Define `UploadContext`: `post`, `verification`, `avatar`, `proof`, `news_thumbnail`.
- Define `UploadedFile` with: `file`, `preview` (blob URL), `uploading`, `progress?`, `error?`, `result?` (ImageMeta after success).
- Define upload limits per context: post images max 5, verification docs max 3, avatar 1, proof max 3, thumbnail 1.

### ImageUploader Component
- Client Component with `'use client'` directive.
- Drag-and-drop zone + file input fallback.
- Props: `maxFiles`, `maxSizeMB`, `allowedTypes`, `onUpload(files)`, `existingImages?`, `context`.
- Display upload progress per file.
- Show validation errors for oversized files, wrong MIME types, and exceeded count.
- Compress images client-side before upload using canvas or a lightweight library.

### ImagePreview Component
- Show thumbnail grid of selected/uploaded images.
- Support reordering (drag) and removal (X button).
- Distinguish between "pending upload" and "already uploaded" states.

### ImageGrid Component
- Read-only grid for displaying uploaded images in post detail, profile, etc.
- Lightbox/modal for full-size image viewing on click.

### AvatarUploader Component
- Single circular image upload with crop preview.
- Uses the same upload pipeline but constrained to 1 image.

### DocumentUploader Component
- For verification document upload flow.
- Accept image and PDF MIME types.
- Show file name and type icon instead of image preview for PDFs.
- Max 3 documents.

### useImageUpload Hook
- Manage the upload state machine: selecting → compressing → uploading → done/error.
- Call the backend upload endpoint and return `ImageMeta` results.
- Support batch upload with parallel requests.

### Client-side Compression
- `lib/utils/imageCompression.ts`: Resize images to max 1920px wide, compress to JPEG/WebP at reasonable quality before sending to server.
- Reduce payload size to improve upload speed and reduce Cloudinary bandwidth.

### Dependencies to Add
- `browser-image-compression` or implement with canvas API.

## ✅ Acceptance Criteria
- [ ] `ImageUploader` supports drag-and-drop and click-to-select.
- [ ] Upload enforces max file count, max size, and allowed MIME types per context.
- [ ] Images are compressed client-side before upload.
- [ ] Upload progress is shown per file.
- [ ] `ImagePreview` allows reordering and removing images.
- [ ] `DocumentUploader` accepts images and PDFs for verification.
- [ ] `AvatarUploader` supports single circular image upload.
- [ ] `useImageUpload` hook abstracts the full upload lifecycle.
