'use strict';

const { Router } = require('express');
const { protect } = require('../middlewares/auth');
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  markRead,
} = require('../controllers/chatController');
const { uploadChatMedia } = require('../config/cloudinary');

const router = Router();

// All chat routes require authentication
router.use(protect);

// Conversations
router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:id/messages', getMessages);
router.patch('/conversations/:id/read', markRead);

// File upload for chat attachments
router.post('/upload', uploadChatMedia.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không tìm thấy file' });
  }
  return res.status(201).json({
    success: true,
    data: {
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileMimeType: req.file.mimetype,
    },
  });
});

module.exports = router;
