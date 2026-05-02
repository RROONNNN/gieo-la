'use strict';

const { Router } = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { USER_ROLES } = require('../constants/userEnums');
const {
  adminListWishlist,
  adminToggleWishlistPin,
  adminUpdateWishlistStatus,
  adminDeleteWishlist,
} = require('../controllers/wishlistController');

const router = Router();

router.use(protect, restrictTo(USER_ROLES.ADMIN));

router.get('/', adminListWishlist);
router.patch('/:id/pin', adminToggleWishlistPin);
router.patch('/:id/status', adminUpdateWishlistStatus);
router.delete('/:id', adminDeleteWishlist);

module.exports = router;
