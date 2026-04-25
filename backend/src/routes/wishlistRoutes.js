'use strict';

const { Router } = require('express');
const { protect } = require('../middlewares/auth');
const {
  listWishlist,
  getWishlist,
  createWishlist,
  deleteWishlist,
  toggleLike,
} = require('../controllers/wishlistController');

const router = Router();

router.get('/', listWishlist);
router.get('/:id', getWishlist);
router.post('/', protect, createWishlist);
router.delete('/:id', protect, deleteWishlist);
router.post('/:id/like', protect, toggleLike);

module.exports = router;
