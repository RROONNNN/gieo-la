'use strict';

const { Router } = require('express');
const { protect } = require('../middlewares/auth');
const { upload, uploadImage } = require('../controllers/uploadController');

const router = Router();

router.use(protect);

/**
 * POST /api/v1/upload/image
 * Uploads a single image file (JPG/PNG/WEBP, ≤5 MB) and returns its URL.
 */
router.post('/image', upload.single('image'), uploadImage);

module.exports = router;
