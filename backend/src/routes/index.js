'use strict';

const { Router }            = require('express');
const authRouter            = require('./authRoutes');
const verificationRouter    = require('./verificationRoutes');
const adminUserRouter       = require('./adminUserRoutes');
const userRouter            = require('./userRoutes');
const uploadRouter          = require('./uploadRoutes');

const router = Router();

// Root API probe
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Gieo La API v1' });
});

// Domain routers
router.use('/auth', authRouter);
router.use('/verification-requests', verificationRouter);
router.use('/admin/users', adminUserRouter);
router.use('/users', userRouter);
router.use('/upload', uploadRouter);

module.exports = router;
