'use strict';

const { Router } = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { USER_ROLES } = require('../constants/userEnums');
const {
  listVerificationRequests,
  approveVerification,
  rejectVerification,
  updateNgoStatus,
  updateAccountStatus,
} = require('../controllers/verificationController');

const router = Router();

// Every route in here requires a valid token AND admin role
router.use(protect, restrictTo(USER_ROLES.ADMIN));

// Verification request queue
router.get('/verification-requests', listVerificationRequests);
router.patch('/verification-requests/:id/approve', approveVerification);
router.patch('/verification-requests/:id/reject', rejectVerification);

// Per-user moderation
router.patch('/:id/ngo-status', updateNgoStatus);
router.patch('/:id/account-status', updateAccountStatus);

module.exports = router;
