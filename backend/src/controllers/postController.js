'use strict';

const removeAccents = require('remove-accents');
const Post = require('../models/Post');
const AuditLog = require('../models/AuditLog');
const { POST_STATUSES } = require('../constants/postEnums');
const {
  createPostSchema,
  updatePostSchema,
  updatePostStatusSchema,
  listPostsQuerySchema,
} = require('../validators/postValidators');

const logAudit = (actorId, targetType, targetId, action, metadata, req) =>
  AuditLog.create({
    actorId,
    targetType,
    targetId,
    action,
    metadata: metadata || {},
    ip: req.ip || null,
    userAgent: req.headers['user-agent'] || null,
  });

// ─── Public endpoints ────────────────────────────────────────────────────────

/**
 * GET /api/v1/posts
 * List posts with optional filters. Public access.
 */
const listPosts = async (req, res) => {
  const parsed = listPostsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Tham số truy vấn không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const { category, status, search, city, mine, page, limit } = parsed.data;
  const filter = {};

  if (category) filter.category = category;
  if (city) filter['location.city'] = city;

  if (mine && req.user) {
    // Authenticated owner: show all own posts regardless of status
    filter.author = req.user._id;
  } else {
    // Public visitors only see available posts by default
    if (status) {
      filter.status = status;
    } else {
      filter.status = POST_STATUSES.AVAILABLE;
    }
  }
  if (search) {
    const normalized = removeAccents(search);
    filter.$or = [
      { title: { $regex: normalized, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
       {
        author: { $regex: normalized, $options: 'i' } },
       
    ];
  }

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'name avatar role verificationStatus badge ngoProfile.organizationName')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    data: { posts, total, page, limit },
  });
};

/**
 * GET /api/v1/posts/:id
 * Get single post detail. Public access.
 */
const getPost = async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name avatar role verificationStatus badge ngoProfile.organizationName location')
    .populate('selectedApplicant', 'name avatar role');

  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }

  return res.json({ success: true, data: { post } });
};

// ─── Authenticated (author) endpoints ────────────────────────────────────────

/**
 * POST /api/v1/posts
 * Create a new post. Requires authentication.
 */
const createPost = async (req, res) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const post = await Post.create({
    ...parsed.data,
    author: req.user._id,
    status: POST_STATUSES.AVAILABLE,
  });

  return res.status(201).json({
    success: true,
    message: 'Đăng bài thành công',
    data: { post },
  });
};

/**
 * PATCH /api/v1/posts/:id
 * Update own post. Only author, only when status is 'available'.
 */
const updatePost = async (req, res) => {
  const parsed = updatePostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa bài này' });
  }
  if (post.status !== POST_STATUSES.AVAILABLE) {
    return res.status(409).json({
      success: false,
      message: 'Chỉ có thể sửa bài đăng ở trạng thái "Sẵn sàng"',
    });
  }

  Object.assign(post, parsed.data);
  await post.save();

  return res.json({
    success: true,
    message: 'Cập nhật bài đăng thành công',
    data: { post },
  });
};

/**
 * DELETE /api/v1/posts/:id
 * Delete own post. Only author.
 */
const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bài này' });
  }

  await post.deleteOne();

  return res.json({ success: true, message: 'Đã xóa bài đăng' });
};

/**
 * PATCH /api/v1/posts/:id/status
 * Author updates post status according to the status flow.
 * Available → In Transaction (when author selects recipient)
 * In Transaction → Traded (when delivery is done)
 */
const updatePostStatus = async (req, res) => {
  const parsed = updatePostStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền thay đổi trạng thái bài này' });
  }

  const { status: newStatus } = parsed.data;

  // Validate status transitions for author
  const ALLOWED_TRANSITIONS = {
    [POST_STATUSES.AVAILABLE]: [POST_STATUSES.IN_TRANSACTION],
    [POST_STATUSES.IN_TRANSACTION]: [POST_STATUSES.TRADED, POST_STATUSES.AVAILABLE],
  };

  const allowed = ALLOWED_TRANSITIONS[post.status] || [];
  if (!allowed.includes(newStatus)) {
    return res.status(409).json({
      success: false,
      message: `Không thể chuyển từ "${post.status}" sang "${newStatus}"`,
    });
  }

  post.status = newStatus;
  await post.save();

  return res.json({
    success: true,
    message: 'Cập nhật trạng thái thành công',
    data: { post },
  });
};

// ─── Admin endpoints ─────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/admin/posts/:id/complete
 * Admin sets post status to 'completed'. Only from 'traded' status.
 */
const adminCompletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }
  if (post.status !== POST_STATUSES.TRADED) {
    return res.status(409).json({
      success: false,
      message: 'Chỉ có thể hoàn thành bài đăng đang ở trạng thái "Đã giao dịch"',
    });
  }

  if (!post.receiverConfirmed) {
    return res.status(409).json({
      success: false,
      message: 'Người nhận chưa xác nhận đã nhận đồ. Vui lòng chờ người nhận xác nhận trước.',
    });
  }

  post.status = POST_STATUSES.COMPLETED;
  post.completedAt = new Date();
  await post.save();

  // Increment the author's completedDonations counter
  const User = require('../models/User');
  await User.findByIdAndUpdate(post.author, { $inc: { completedDonations: 1 } });

  await logAudit(req.user._id, 'Post', post._id, 'post.complete', {}, req);

  return res.json({
    success: true,
    message: 'Đã đánh dấu bài đăng hoàn thành',
    data: { post },
  });
};

/**
 * DELETE /api/v1/admin/posts/:id
 * Admin deletes a post (violation).
 */
const adminDeletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }

  const reason = req.body?.reason || null;
  await logAudit(req.user._id, 'Post', post._id, 'post.admin_delete', { reason }, req);
  await post.deleteOne();

  return res.json({ success: true, message: 'Đã xóa bài đăng vi phạm' });
};

/**
 * GET /api/v1/admin/posts/stats
 * Returns aggregate stats for the admin dashboard (e.g. today's post count).
 */
const adminGetPostsStats = async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayCount = await Post.countDocuments({ createdAt: { $gte: startOfToday } });

  return res.json({ success: true, data: { todayCount } });
};

/**
 * PATCH /api/v1/admin/posts/:id/pin
 * Admin pins/unpins a post.
 */
const adminTogglePin = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }

  post.isPinned = !post.isPinned;
  await post.save();

  await logAudit(
    req.user._id, 'Post', post._id,
    post.isPinned ? 'post.pin' : 'post.unpin', {}, req
  );

  return res.json({
    success: true,
    message: post.isPinned ? 'Đã ghim bài đăng' : 'Đã bỏ ghim bài đăng',
    data: { post },
  });
};

/**
 * GET /api/v1/admin/posts
 * Admin lists all posts with all status filters.
 */
const adminListPosts = async (req, res) => {
  const parsed = listPostsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Tham số truy vấn không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const { category, status, search, authorSearch, dateFrom, dateTo, page, limit } = parsed.data;
  const filter = {};

  if (category) filter.category = category;
  if (status) filter.status = status;

  if (search || authorSearch) {
    const User = require('../models/User');
    const orClauses = [];

    if (search) {
      const normalizedSearch = removeAccents(search);
      orClauses.push({ title: { $regex: normalizedSearch, $options: 'i' } });
    }
    if (authorSearch || search) {
      const userQuery = authorSearch || search;
      const normalizedUserQuery = removeAccents(userQuery);
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: normalizedUserQuery, $options: 'i' } },
          { email: { $regex: userQuery, $options: 'i' } },
        ],
      }).select('_id');
      if (matchingUsers.length > 0) {
        orClauses.push({ author: { $in: matchingUsers.map((u) => u._id) } });
      }
    }

    if (orClauses.length > 0) filter.$or = orClauses;
  }

  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(`${dateTo}T23:59:59.999Z`);
  }

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'name email avatar role verificationStatus')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    data: { posts, total, page, limit },
  });
};

/**
 * POST /api/v1/posts/:id/like
 * Toggle like on a post. Requires authentication.
 */
const toggleLikePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }

  const userId = req.user._id.toString();
  const index = post.likes.findIndex((id) => id.toString() === userId);

  if (index === -1) {
    post.likes.push(req.user._id);
  } else {
    post.likes.splice(index, 1);
  }
  post.likesCount = post.likes.length;
  await post.save();

  return res.json({
    success: true,
    data: { liked: index === -1, likesCount: post.likesCount },
  });
};

/**
 * PATCH /api/v1/admin/posts/:id/status
 * Admin sets a post to any status. When setting 'completed', mirrors adminCompletePost logic.
 */
const adminUpdatePostStatus = async (req, res) => {
  const parsed = updatePostStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }

  const { status: newStatus } = parsed.data;

  if (newStatus === POST_STATUSES.COMPLETED && post.status !== POST_STATUSES.COMPLETED) {
    if (!post.receiverConfirmed) {
      return res.status(409).json({
        success: false,
        message: 'Người nhận chưa xác nhận đã nhận đồ. Vui lòng chờ người nhận xác nhận trước.',
      });
    }
    post.completedAt = new Date();
    const User = require('../models/User');
    await User.findByIdAndUpdate(post.author, { $inc: { completedDonations: 1 } });
    await logAudit(req.user._id, 'Post', post._id, 'post.complete', {}, req);
  }

  post.status = newStatus;
  await post.save();

  await logAudit(req.user._id, 'Post', post._id, 'post.admin_status_update', { newStatus }, req);

  return res.json({
    success: true,
    message: 'Đã cập nhật trạng thái bài đăng',
    data: { post },
  });
};

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
  adminCompletePost,
  adminUpdatePostStatus,
  adminDeletePost,
  adminTogglePin,
  adminListPosts,
  adminGetPostsStats,
  toggleLikePost,
};
