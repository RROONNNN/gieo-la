'use strict';

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gieo-la/verifications',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// Storage for verification documents (PDF, DOC, DOCX, images)
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gieo-la/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
  },
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Định dạng file không được hỗ trợ. Chấp nhận: ảnh, PDF, DOC, DOCX.'));
    }
  },
});

// module.exports moved to end of file — see below

// ── Chat media storage (images, videos, files) ─────────────────────────────
const RAW_MIME_TYPES = new Set([
  'application/msword',
  'application/vnd.ms-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
]);

const RAW_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx', 'zip']);

function getChatResourceType(file) {
  if (RAW_MIME_TYPES.has(file.mimetype)) return 'raw';
  const ext = (file.originalname || '').split('.').pop().toLowerCase();
  if (RAW_EXTENSIONS.has(ext)) return 'raw';
  return 'auto';
}

const chatMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: 'gieo-la/chat',
    resource_type: getChatResourceType(file),
  }),
});

const ALLOWED_CHAT_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/quicktime', 'video/x-msvideo',
  'application/pdf',
  'application/msword',
  'application/vnd.ms-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  // Fallback: some browsers report doc/docx/xls/xlsx as octet-stream
  'application/octet-stream',
]);

const ALLOWED_CHAT_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif',
  'mp4', 'mov', 'avi',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip',
]);

const uploadChatMedia = multer({
  storage: chatMediaStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB cap
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_CHAT_MIMES.has(file.mimetype)) {
      return cb(null, true);
    }
    // Allow by extension when MIME is unrecognised (e.g. octet-stream for .doc)
    const ext = (file.originalname || '').split('.').pop().toLowerCase();
    if (ALLOWED_CHAT_EXTENSIONS.has(ext)) {
      return cb(null, true);
    }
    cb(new Error('Định dạng file không được hỗ trợ trong chat.'));
  },
});

module.exports = { cloudinary, upload, uploadDocument, uploadChatMedia };
