'use strict';

const { Router } = require('express');
const { protect } = require('../middlewares/auth');
const {
  listWishlistComments,
  createWishlistComment,
  deleteWishlistComment,
} = require('../controllers/wishlistCommentController');

const router = Router({ mergeParams: true });

router.get('/', listWishlistComments);
router.post('/', protect, createWishlistComment);
router.delete('/:commentId', protect, deleteWishlistComment);

module.exports = router;
