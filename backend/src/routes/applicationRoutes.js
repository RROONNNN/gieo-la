'use strict';

const { Router } = require('express');
const { protect } = require('../middlewares/auth');
const {
  applyForPost,
  listApplications,
  selectApplicant,
  getMyLimit,
  undoSelectApplicant,
  confirmReceipt,
} = require('../controllers/applicationController');

const router = Router();

// Check my monthly limit (authenticated)
router.get('/my-limit', protect, getMyLimit);

// Public: list applications for a post (sorted by role priority)
router.get('/:postId', listApplications);

// Authenticated: apply for a post
router.post('/:postId', protect, applyForPost);

// Authenticated (post author): select an applicant
router.post('/:postId/select', protect, selectApplicant);

router.post('/:postId/undo-select', protect, undoSelectApplicant);

// Authenticated (selected applicant): confirm receipt of item
router.post('/:postId/confirm-receipt', protect, confirmReceipt);

module.exports = router;
