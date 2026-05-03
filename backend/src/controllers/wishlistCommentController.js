'use strict';

const WishlistComment = require('../models/WishlistComment');
const Wishlist = require('../models/Wishlist');
const { createCommentSchema } = require('../validators/postValidators');
const { USER_ROLES } = require('../constants/userEnums');

/**
 * GET /api/v1/wishlist/:wishlistId/comments
 * Public — list comments for a wishlist post, oldest first.
 */
const listWishlistComments = async (req, res) => {
  const { wishlistId } = req.params;

  const comments = await WishlistComment.find({ wishlist: wishlistId })
    .populate('author', 'name avatar role')
    .sort({ createdAt: 1 });

  return res.json({ success: true, data: { comments } });
};

/**
 * POST /api/v1/wishlist/:wishlistId/comments
 * Authenticated — create a new comment.
 */
const createWishlistComment = async (req, res) => {
  const { wishlistId } = req.params;

  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const wishlist = await Wishlist.findById(wishlistId);
  if (!wishlist) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy wishlist' });
  }

  const comment = await WishlistComment.create({
    wishlist: wishlistId,
    author: req.user._id,
    content: parsed.data.content,
    images: parsed.data.images,
  });

  await comment.populate('author', 'name avatar role');

  return res.status(201).json({
    success: true,
    message: 'Bình luận đã được đăng',
    data: { comment },
  });
};

/**
 * DELETE /api/v1/wishlist/:wishlistId/comments/:commentId
 * Authenticated — comment author or admin only.
 */
const deleteWishlistComment = async (req, res) => {
  const { commentId } = req.params;

  const comment = await WishlistComment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
  }

  const isAuthor = comment.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === USER_ROLES.ADMIN;

  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bình luận này' });
  }

  await comment.deleteOne();

  return res.json({ success: true, message: 'Đã xóa bình luận' });
};

module.exports = { listWishlistComments, createWishlistComment, deleteWishlistComment };
