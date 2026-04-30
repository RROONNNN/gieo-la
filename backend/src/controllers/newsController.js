'use strict';

const NewsPost = require('../models/NewsPost');
const AuditLog = require('../models/AuditLog');
const { NEWS_STATUSES } = require('../constants/newsEnums');
const {
  createNewsSchema,
  updateNewsSchema,
  listNewsQuerySchema,
} = require('../validators/newsValidators');

const logAudit = (actorId, targetId, action, metadata, req) =>
  AuditLog.create({
    actorId,
    targetType: 'NewsPost',
    targetId,
    action,
    metadata: metadata || {},
    ip: req.ip || null,
    userAgent: req.headers['user-agent'] || null,
  });

// ─── Public endpoints ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/news
 * List published news posts. Public access.
 */
const listNews = async (req, res) => {
  const parsed = listNewsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Tham số truy vấn không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const { category, page, limit } = parsed.data;
  const filter = { status: NEWS_STATUSES.PUBLISHED };
  if (category) filter.category = category;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    NewsPost.find(filter)
      .populate('author', 'name avatar')
      .sort({ isPinned: -1, publishedAt: -1 })
      .skip(skip)
      .limit(limit),
    NewsPost.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    data: { items, total, page, limit },
  });
};

/**
 * GET /api/v1/news/:id
 * Single news post. Public access — only published posts visible.
 */
const getNews = async (req, res) => {
  const post = await NewsPost.findById(req.params.id).populate('author', 'name avatar');

  if (!post || post.status !== NEWS_STATUSES.PUBLISHED) {
    return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
  }

  return res.json({ success: true, data: { item: post } });
};

// ─── Admin endpoints ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/news
 * List all news posts (any status). Admin only.
 */
const adminListNews = async (req, res) => {
  const parsed = listNewsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Tham số truy vấn không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const { category, status, page, limit } = parsed.data;
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    NewsPost.find(filter)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    NewsPost.countDocuments(filter),
  ]);

  return res.json({ success: true, data: { items, total, page, limit } });
};

/**
 * GET /api/v1/admin/news/:id
 * Get a single news post by id (any status). Admin only.
 */
const adminGetNews = async (req, res) => {
  const post = await NewsPost.findById(req.params.id).populate('author', 'name avatar');

  if (!post) {
    return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
  }

  return res.json({ success: true, data: { item: post } });
};

/**
 * POST /api/v1/admin/news
 * Create a new news post. Admin only.
 */
const createNews = async (req, res) => {
  const parsed = createNewsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const data = parsed.data;

  // Auto-set publishedAt when status is published
  if (data.status === NEWS_STATUSES.PUBLISHED) {
    data.publishedAt = new Date();
  }

  const post = await NewsPost.create({ ...data, author: req.user._id });

  await logAudit(req.user._id, post._id, 'news.create', { title: post.title }, req);

  return res.status(201).json({ success: true, data: { item: post } });
};

/**
 * PATCH /api/v1/admin/news/:id
 * Update a news post. Admin only.
 */
const updateNews = async (req, res) => {
  const parsed = updateNewsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const post = await NewsPost.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
  }

  const updates = parsed.data;

  // Set publishedAt only on first publish — do not overwrite
  if (updates.status === NEWS_STATUSES.PUBLISHED && !post.publishedAt) {
    updates.publishedAt = new Date();
  }

  Object.assign(post, updates);
  await post.save();

  await logAudit(req.user._id, post._id, 'news.update', { updates }, req);

  return res.json({ success: true, data: { item: post } });
};

/**
 * DELETE /api/v1/admin/news/:id
 * Delete a news post. Admin only.
 */
const deleteNews = async (req, res) => {
  const post = await NewsPost.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
  }

  await post.deleteOne();

  await logAudit(req.user._id, req.params.id, 'news.delete', { title: post.title }, req);

  return res.json({ success: true, message: 'Đã xóa bài viết' });
};

/**
 * PATCH /api/v1/admin/news/:id/toggle-pin
 * Toggle isPinned. Admin only.
 */
const togglePin = async (req, res) => {
  const post = await NewsPost.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
  }

  post.isPinned = !post.isPinned;
  await post.save();

  await logAudit(
    req.user._id,
    post._id,
    'news.pin_toggle',
    { isPinned: post.isPinned },
    req,
  );

  return res.json({ success: true, data: { item: post } });
};

module.exports = {
  listNews,
  getNews,
  adminListNews,
  adminGetNews,
  createNews,
  updateNews,
  deleteNews,
  togglePin,
};
