'use strict';

const { Router } = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { USER_ROLES } = require('../constants/userEnums');
const {
  adminListNews,
  adminGetNews,
  createNews,
  updateNews,
  deleteNews,
  togglePin,
} = require('../controllers/newsController');

const router = Router();

// All admin news routes require authentication and admin role
router.use(protect, restrictTo(USER_ROLES.ADMIN));

router.get('/', adminListNews);
router.get('/:id', adminGetNews);
router.post('/', createNews);
router.patch('/:id', updateNews);
router.delete('/:id', deleteNews);
router.patch('/:id/toggle-pin', togglePin);

module.exports = router;
