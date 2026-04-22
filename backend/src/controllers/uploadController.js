'use strict';

const { upload } = require('../config/cloudinary');

/**
 * POST /api/v1/upload/image
 * Authenticated user uploads a single image for verification documents.
 * Returns the Cloudinary CDN URL.
 */
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Không tìm thấy file ảnh. Vui lòng chọn ảnh để tải lên.',
    });
  }

  // multer-storage-cloudinary puts the CDN URL in req.file.path
  const url = req.file.path;

  return res.status(201).json({
    success: true,
    message: 'Tải ảnh lên thành công',
    data: { url },
  });
};

module.exports = { upload, uploadImage };
