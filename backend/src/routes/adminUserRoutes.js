'use strict';

const { Router } = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { USER_ROLES } = require('../constants/userEnums');
const {
  listVerificationRequests,
  getVerificationRequest,
  approveVerification,
  rejectVerification,
  updateNgoStatus,
  updateIndividualStatus,
  listUsers,
  getUser,
  updateAccountStatus,
} = require('../controllers/verificationController');

const router = Router();

// Every route in here requires a valid token AND admin role
router.use(protect, restrictTo(USER_ROLES.ADMIN));

// User list
router.get('/', listUsers);

// Verification request queue — must be declared BEFORE /:id to avoid shadowing
router.get('/verification-requests', listVerificationRequests);
router.get('/verification-requests/:id', getVerificationRequest);
router.patch('/verification-requests/:id/approve', approveVerification);
router.patch('/verification-requests/:id/reject', rejectVerification);

// Per-user detail & moderation — parameterised routes last
router.get('/:id', getUser);
router.patch('/:id/ngo-status', updateNgoStatus);
router.patch('/:id/individual-status', updateIndividualStatus);
router.patch('/:id/account-status', updateAccountStatus);

module.exports = router;
