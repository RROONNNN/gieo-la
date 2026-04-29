'use strict';

const { Router } = require('express');
const {
  registerMember,
  registerNgo,
  registerIndividual,
  login,
  getMe,
  refreshToken,
  logout,
  updateMe,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/register/member',     registerMember);
router.post('/register/ngo',        registerNgo);
router.post('/register/individual', registerIndividual);
router.post('/login',               login);
router.post('/refresh-token',       refreshToken); // reads httpOnly cookie — no Bearer needed
router.post('/logout',              logout);       // clears cookie — no Bearer needed

// ── Protected ─────────────────────────────────────────────────────────────────
router.get('/me',   protect, getMe);
router.patch('/me', protect, updateMe);

module.exports = router;
