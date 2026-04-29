'use strict';

const { Router }            = require('express');
const authRouter            = require('./authRoutes');
const verificationRouter    = require('./verificationRoutes');
const adminUserRouter       = require('./adminUserRoutes');
const adminPostRouter       = require('./adminPostRoutes');
const userRouter            = require('./userRoutes');
const uploadRouter          = require('./uploadRoutes');
const postRouter            = require('./postRoutes');
const applicationRouter     = require('./applicationRoutes');
const commentRouter         = require('./commentRoutes');
const leaderboardRouter     = require('./leaderboardRoutes');
const wishlistRouter        = require('./wishlistRoutes');
const chatRouter            = require('./chatRoutes');

const router = Router();

// Root API probe
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Gieo La API v1' });
});

// Domain routers
router.use('/auth', authRouter);
router.use('/verification-requests', verificationRouter);
router.use('/admin/users', adminUserRouter);
router.use('/admin/posts', adminPostRouter);
router.use('/users', userRouter);
router.use('/upload', uploadRouter);
router.use('/posts', postRouter);
router.use('/applications', applicationRouter);
router.use('/posts/:postId/comments', commentRouter);
router.use('/leaderboard', leaderboardRouter);
router.use('/wishlist', wishlistRouter);
router.use('/chat', chatRouter);

module.exports = router;
