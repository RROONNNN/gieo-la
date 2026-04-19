'use strict';

const path = require('path');
const multer = require('multer');

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/verifications'),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Định dạng ảnh không hỗ trợ. Vui lòng dùng JPG, PNG hoặc WEBP.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});

/**
 * POST /api/v1/upload/image
 * Authenticated user uploads a single image for verification documents.
 * Returns the URL path to the stored file.
 */
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Không tìm thấy file ảnh. Vui lòng chọn ảnh để tải lên.',
    });
  }

  const url = `/uploads/verifications/${req.file.filename}`;
  return res.status(201).json({
    success: true,
    message: 'Tải ảnh lên thành công',
    data: { url },
  });
};

module.exports = { upload, uploadImage };
