'use strict';

const { Router } = require('express');
const { protect, optionalProtect } = require('../middlewares/auth');
const {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
  toggleLikePost,
} = require('../controllers/postController');

const router = Router();

// ── Public ─────────────────────────────────────────────────────────────────────────────
router.get('/', optionalProtect, listPosts);
router.get('/:id', getPost);

// ── Authenticated ─────────────────────────────────────────────────────────────────────
router.post('/', protect, createPost);
router.patch('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.patch('/:id/status', protect, updatePostStatus);
router.post('/:id/like', protect, toggleLikePost);

module.exports = router;

// ── Authenticated ─────────────────────────────────────────────────────────────
router.post('/', protect, createPost);
router.patch('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.patch('/:id/status', protect, updatePostStatus);
router.post('/:id/like', protect, toggleLikePost);

module.exports = router;
