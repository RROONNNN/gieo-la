'use strict';

const { Router }   = require('express');
const authRouter   = require('./authRoutes');

const router = Router();

// Root API probe
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Gieo La API v1' });
});

// Domain routers
router.use('/auth', authRouter);

module.exports = router;
