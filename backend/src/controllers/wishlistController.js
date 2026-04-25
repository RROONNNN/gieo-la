'use strict';

const Wishlist = require('../models/Wishlist');
const AuditLog = require('../models/AuditLog');
const {
  createWishlistSchema,
  listWishlistQuerySchema,
} = require('../validators/wishlistValidators');

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

/**
 * GET /api/v1/wishlist
 * Public — list wishlist posts with optional filters.
 */
const listWishlist = async (req, res) => {
  const parsed = listWishlistQuerySchema.safeParse(req.query);
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
    Wishlist.find(filter)
      .populate('author', 'name avatar role verificationStatus ngoProfile.organizationName')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Wishlist.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    data: { items, total, page, limit },
  });
};

/**
 * GET /api/v1/wishlist/:id
 * Public — single wishlist post detail.
 */
const getWishlist = async (req, res) => {
  const item = await Wishlist.findById(req.params.id).populate(
    'author',
    'name avatar role verificationStatus ngoProfile.organizationName'
  );
  if (!item) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy wishlist' });
  }
  return res.json({ success: true, data: { item } });
};

/**
 * POST /api/v1/wishlist
 * Create wishlist post. Only ngo + ngo_verified.
 */
const createWishlist = async (req, res) => {
  const { role, verificationStatus } = req.user;
  if (role!== 'admin' && (role !== 'ngo' || verificationStatus !== 'ngo_verified')) {
    return res.status(403).json({
      success: false,
      message: 'Chỉ tổ chức NGO đã xác thực mới có thể đăng Wishlist',
    });
  }

  const parsed = createWishlistSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const item = await Wishlist.create({ ...parsed.data, author: req.user._id });

  return res.status(201).json({
    success: true,
    message: 'Đăng Wishlist thành công',
    data: { item },
  });
};

/**
 * DELETE /api/v1/wishlist/:id
 * Delete wishlist post. Author or admin only.
 */
const deleteWishlist = async (req, res) => {
  const item = await Wishlist.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy wishlist' });
  }

  const isAuthor = item.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa wishlist này' });
  }

  await logAudit(req.user._id, 'Wishlist', item._id, 'wishlist.delete', {}, req);
  await item.deleteOne();

  return res.json({ success: true, message: 'Đã xóa wishlist' });
};

/**
 * POST /api/v1/wishlist/:id/like
 * Toggle like. Any authenticated user.
 */
const toggleLike = async (req, res) => {
  const item = await Wishlist.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy wishlist' });
  }

  const userId = req.user._id.toString();
  const index = item.likes.findIndex((id) => id.toString() === userId);

  if (index === -1) {
    item.likes.push(req.user._id);
  } else {
    item.likes.splice(index, 1);
  }
  item.likesCount = item.likes.length;
  await item.save();

  return res.json({
    success: true,
    data: { liked: index === -1, likesCount: item.likesCount },
  });
};

/**
 * PATCH /api/v1/admin/wishlist/:id/pin
 * Admin pins/unpins a wishlist post.
 */
const adminToggleWishlistPin = async (req, res) => {
  const item = await Wishlist.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy wishlist' });
  }

  item.isPinned = !item.isPinned;
  await item.save();

  await logAudit(
    req.user._id, 'Wishlist', item._id,
    item.isPinned ? 'wishlist.pin' : 'wishlist.unpin', {}, req
  );

  return res.json({
    success: true,
    message: item.isPinned ? 'Đã ghim wishlist' : 'Đã bỏ ghim wishlist',
    data: { item },
  });
};

module.exports = {
  listWishlist,
  getWishlist,
  createWishlist,
  deleteWishlist,
  toggleLike,
  adminToggleWishlistPin,
};
