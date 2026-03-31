'use strict';

const { Router } = require('express');
const {
  registerMember,
  registerNgo,
  registerIndividual,
  login,
  getMe,
  updateMe,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/register/member',     registerMember);
router.post('/register/ngo',        registerNgo);
router.post('/register/individual', registerIndividual);
router.post('/login',               login);

// ── Protected ─────────────────────────────────────────────────────────────────
router.get('/me',   protect, getMe);
router.patch('/me', protect, updateMe);

module.exports = router;
