'use strict';

const { Router } = require('express');
const { protect } = require('../middlewares/auth');
const { listComments, createComment, deleteComment } = require('../controllers/commentController');

// mergeParams so :postId from parent router is available
const router = Router({ mergeParams: true });

router.get('/', listComments);
router.post('/', protect, createComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;
