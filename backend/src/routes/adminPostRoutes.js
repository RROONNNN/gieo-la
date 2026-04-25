'use strict';

const { Router } = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { USER_ROLES } = require('../constants/userEnums');
const {
  adminListPosts,
  adminCompletePost,
  adminDeletePost,
  adminTogglePin,
  adminUpdatePostStatus,
} = require('../controllers/postController');
const { adminToggleWishlistPin } = require('../controllers/wishlistController');

const router = Router();

router.use(protect, restrictTo(USER_ROLES.ADMIN));

router.get('/', adminListPosts);
router.patch('/:id/status', adminUpdatePostStatus);
router.patch('/:id/complete', adminCompletePost);
router.patch('/:id/pin', adminTogglePin);
router.delete('/:id', adminDeletePost);
router.patch('/wishlist/:id/pin', adminToggleWishlistPin);

module.exports = router;
