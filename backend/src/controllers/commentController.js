'use strict';

const PostComment = require('../models/PostComment');
const Post = require('../models/Post');
const { createCommentSchema } = require('../validators/postValidators');
const { USER_ROLES } = require('../constants/userEnums');

/**
 * GET /api/v1/posts/:postId/comments
 * Public — list comments for a post, oldest first.
 */
const listComments = async (req, res) => {
  const { postId } = req.params;

  const comments = await PostComment.find({ post: postId })
    .populate('author', 'name avatar role')
    .sort({ createdAt: 1 });

  return res.json({
    success: true,
    data: { comments },
  });
};

/**
 * POST /api/v1/posts/:postId/comments
 * Authenticated — create a new comment on a post.
 */
const createComment = async (req, res) => {
  const { postId } = req.params;

  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  // Verify post exists
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }

  const comment = await PostComment.create({
    post: postId,
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
 * DELETE /api/v1/posts/:postId/comments/:commentId
 * Authenticated — only the comment author OR an admin can delete.
 */
const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  const comment = await PostComment.findById(commentId);
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

module.exports = { listComments, createComment, deleteComment };
