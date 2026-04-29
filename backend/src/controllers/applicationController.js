'use strict';

const mongoose = require('mongoose');
const Application = require('../models/Application');
const Post = require('../models/Post');
const { POST_STATUSES } = require('../constants/postEnums');
const { APPLICATION_STATUSES } = require('../constants/applicationEnums');
const { USER_ROLES } = require('../constants/userEnums');
const {
  applySchema,
  selectApplicantSchema,
} = require('../validators/applicationValidators');

// Monthly receive limits per role
const MONTHLY_LIMITS = {
  [USER_ROLES.INDIVIDUAL]: 3,
  [USER_ROLES.NGO]: 10,
};

// Role priority for sorting applicant list (lower = higher priority)
const ROLE_PRIORITY = {
  [USER_ROLES.NGO]: 0,
  [USER_ROLES.INDIVIDUAL]: 1,
  [USER_ROLES.MEMBER]: 2,
  [USER_ROLES.ADMIN]: 2,
};

/**
 * Get start of current month for limit counting.
 */
function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Check if user has exceeded their monthly receive limit.
 * Returns { allowed: boolean, used: number, limit: number }
 */
async function checkMonthlyLimit(userId, role) {
  const limit = MONTHLY_LIMITS[role];
  if (!limit) {
    // Members cannot apply (requirement: only NGO and Individual can apply)
    return { allowed: false, used: 0, limit: 0 };
  }

  const monthStart = getMonthStart();
  const used = await Application.countDocuments({
    applicant: userId,
    status: APPLICATION_STATUSES.SELECTED,
    createdAt: { $gte: monthStart },
  });

  return { allowed: used < limit, used, limit };
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

/**
 * POST /api/v1/applications/:postId
 * Verified NGO or Verified Individual applies to receive an item.
 */
const applyForPost = async (req, res) => {
  const parsed = applySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const { postId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ success: false, message: 'ID bài đăng không hợp lệ' });
  }

  const user = req.user;

  // Only verified NGO or verified Individual can apply
  if (
    !(
      (user.role === USER_ROLES.NGO && user.verificationStatus === 'verified') ||
      (user.role === USER_ROLES.INDIVIDUAL && user.verificationStatus === 'verified')
    )
  ) {
    return res.status(403).json({
      success: false,
      message: 'Chỉ NGO hoặc Cá nhân khó khăn đã xác thực mới được đăng ký nhận đồ',
    });
  }

  // Check monthly limit
  const { allowed, used, limit } = await checkMonthlyLimit(user._id, user.role);
  if (!allowed) {
    return res.status(429).json({
      success: false,
      message: `Bạn đã đạt giới hạn nhận đồ tháng này (${used}/${limit})`,
    });
  }

  // Check post exists and is available
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }
  if (post.status !== POST_STATUSES.AVAILABLE) {
    return res.status(409).json({
      success: false,
      message: 'Bài đăng không còn ở trạng thái sẵn sàng',
    });
  }
  // Author cannot apply to own post
  if (post.author.toString() === user._id.toString()) {
    return res.status(409).json({
      success: false,
      message: 'Bạn không thể đăng ký nhận đồ của chính mình',
    });
  }

  // Check for duplicate application
  const existing = await Application.findOne({
    post: postId,
    applicant: user._id,
  });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Bạn đã đăng ký nhận đồ cho bài đăng này rồi',
    });
  }

  const application = await Application.create({
    post: postId,
    applicant: user._id,
    message: parsed.data.message,
  });

  return res.status(201).json({
    success: true,
    message: 'Đăng ký nhận đồ thành công',
    data: { application },
  });
};

/**
 * GET /api/v1/applications/:postId
 * List all applications for a post. Public (requirement: danh sách public).
 * Sorted by role priority: NGO first, then Individual, then Member.
 */
const listApplications = async (req, res) => {
  const { postId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ success: false, message: 'ID bài đăng không hợp lệ' });
  }

  const applications = await Application.find({ post: postId })
    .populate('applicant', 'name avatar role verificationStatus badge ngoProfile.organizationName')
    .sort({ createdAt: 1 });

  // Sort by role priority: NGO → Individual → Member/Admin
  applications.sort((a, b) => {
    const priorityA = ROLE_PRIORITY[a.applicant?.role] ?? 99;
    const priorityB = ROLE_PRIORITY[b.applicant?.role] ?? 99;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  return res.json({
    success: true,
    data: { applications },
  });
};

/**
 * POST /api/v1/applications/:postId/select
 * Post author selects one applicant. Changes post status to 'in_transaction'.
 * Rejects all other applicants.
 */
const selectApplicant = async (req, res) => {
  const parsed = selectApplicantSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const { postId } = req.params;
  const { applicantId } = parsed.data;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Chỉ người đăng bài mới có quyền chọn người nhận' });
  }
  if (post.status !== POST_STATUSES.AVAILABLE) {
    return res.status(409).json({
      success: false,
      message: 'Bài đăng không còn ở trạng thái sẵn sàng',
    });
  }

  // Verify the applicant actually applied
  const selectedApp = await Application.findOne({
    post: postId,
    applicant: applicantId,
    status: APPLICATION_STATUSES.PENDING,
  });
  if (!selectedApp) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy đơn đăng ký này',
    });
  }

  // Select the winner, reject others, update post
  selectedApp.status = APPLICATION_STATUSES.SELECTED;
  await selectedApp.save();

  await Application.updateMany(
    { post: postId, _id: { $ne: selectedApp._id } },
    { status: APPLICATION_STATUSES.REJECTED }
  );

  post.status = POST_STATUSES.IN_TRANSACTION;
  post.selectedApplicant = applicantId;
  await post.save();

  // Auto-create conversation and send system notification message
  try {
    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');
    const { getIO } = require('../socket/index');

    const postAuthorId = req.user._id.toString();
    const recipientId = applicantId.toString();

    let conv = await Conversation.findOne({
      participants: { $all: [postAuthorId, recipientId], $size: 2 },
    });
    if (!conv) {
      conv = await Conversation.create({ participants: [postAuthorId, recipientId] });
    }

    const systemText = `🎉 Bạn đã được chọn nhận món đồ từ bài đăng "${post.title}". Hãy liên hệ để sắp xếp nhận đồ nhé!`;

    const msg = await Message.create({
      conversationId: conv._id,
      sender: null,
      type: 'text',
      content: systemText,
      isSystem: true,
    });

    conv.lastMessage = { content: systemText, type: 'text', senderId: null, createdAt: msg.createdAt };
    const currentUnread = conv.unreadCounts.get(recipientId) || 0;
    conv.unreadCounts.set(recipientId, currentUnread + 1);
    await conv.save();

    try {
      const io = getIO();
      io.to(`conv_${conv._id}`).emit('new_message', msg.toObject());
      io.to(`conv_${conv._id}`).emit('conversation_updated', {
        conversationId: conv._id,
        lastMessage: conv.lastMessage,
        unreadCounts: Object.fromEntries(conv.unreadCounts),
      });
    } catch {
      // Socket not initialized (e.g. in tests) — safe to skip
    }
  } catch (err) {
    // Non-critical: chat failure must not break the selection response
    console.error('[chat auto-message] error:', err.message);
  }

  return res.json({
    success: true,
    message: 'Đã chọn người nhận đồ thành công',
    data: { post, selectedApplication: selectedApp },
  });
};

/**
 * GET /api/v1/applications/my-limit
 * Authenticated user checks their monthly receive limit.
 */
const getMyLimit = async (req, res) => {
  const user = req.user;
  const limit = MONTHLY_LIMITS[user.role];

  if (!limit) {
    return res.json({
      success: true,
      data: { canApply: false, used: 0, limit: 0, message: 'Loại tài khoản không được đăng ký nhận đồ' },
    });
  }

  const monthStart = getMonthStart();
  const used = await Application.countDocuments({
    applicant: user._id,
    status: APPLICATION_STATUSES.SELECTED,
    createdAt: { $gte: monthStart },
  });

  return res.json({
    success: true,
    data: { canApply: used < limit, used, limit },
  });
};

const undoSelectApplicant = async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Chỉ người đăng bài mới có quyền chọn người nhận' });
  }
  if (post.status === POST_STATUSES.TRADED) {
    return res.status(409).json({
      success: false,
      message: 'Bài đăng đã hoàn tất giao dịch, không thể hủy chọn người nhận',
    });
  }

  await Application.updateMany(
    { post: postId },
    { status: APPLICATION_STATUSES.PENDING }
  );
  post.status = POST_STATUSES.AVAILABLE;
  post.selectedApplicant = null;
  post.receiverConfirmed = false;
  post.receiverConfirmedAt = null;
  await post.save();

  return res.json({
    success: true,
    message: 'Đã hủy chọn người nhận thành công',
    data: { post },
  });
};

/**
 * POST /api/v1/applications/:postId/confirm-receipt
 * selectedApplicant confirms they received the item. Only allowed when post is 'traded'.
 */
const confirmReceipt = async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ success: false, message: 'ID bài đăng không hợp lệ' });
  }

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài đăng' });
  }
  if (post.status !== POST_STATUSES.TRADED) {
    return res.status(409).json({
      success: false,
      message: 'Bài đăng chưa ở trạng thái đã giao',
    });
  }
  if (
    !post.selectedApplicant ||
    post.selectedApplicant.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không phải người nhận được chọn cho bài đăng này',
    });
  }
  if (post.receiverConfirmed) {
    return res.status(409).json({
      success: false,
      message: 'Bạn đã xác nhận nhận đồ rồi',
    });
  }

  post.receiverConfirmed = true;
  post.receiverConfirmedAt = new Date();
  await post.save();

  return res.json({
    success: true,
    message: 'Đã xác nhận nhận đồ thành công',
    data: { post },
  });
};

module.exports = {
  applyForPost,
  listApplications,
  selectApplicant,
  getMyLimit,
  undoSelectApplicant,
  confirmReceipt,
};
