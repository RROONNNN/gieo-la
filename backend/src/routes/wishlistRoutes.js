'use strict';

const { Router } = require('express');
const { protect } = require('../middlewares/auth');
const {
  listWishlist,
  getWishlist,
  createWishlist,
  deleteWishlist,
  toggleLike,
  ownerToggleWishlistStatus,
} = require('../controllers/wishlistController');

const router = Router();

router.get('/', listWishlist);
router.get('/:id', getWishlist);
router.post('/', protect, createWishlist);
router.delete('/:id', protect, deleteWishlist);
router.post('/:id/like', protect, toggleLike);
router.patch('/:id/status', protect, ownerToggleWishlistStatus);

module.exports = router;
