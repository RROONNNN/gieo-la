'use strict';

const { Router } = require('express');
const { protect } = require('../middlewares/auth');
const {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
} = require('../controllers/postController');

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', listPosts);
router.get('/:id', getPost);

// ── Authenticated ─────────────────────────────────────────────────────────────
router.post('/', protect, createPost);
router.patch('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.patch('/:id/status', protect, updatePostStatus);

module.exports = router;
