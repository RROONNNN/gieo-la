'use strict';

const { Router } = require('express');
const { protect } = require('../middlewares/auth');
const {
  submitVerification,
  getMyVerificationRequests,
} = require('../controllers/verificationController');

const router = Router();

// All verification-request routes require the user to be logged in
router.use(protect);

router.post('/', submitVerification);
router.get('/me', getMyVerificationRequests);

module.exports = router;
