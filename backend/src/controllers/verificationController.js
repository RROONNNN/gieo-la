'use strict';

const VerificationRequest = require('../models/VerificationRequest');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const {
  submitVerificationSchema,
  rejectVerificationSchema,
  updateNgoStatusSchema,
  updateIndividualStatusSchema,
  listUsersQuerySchema,
  updateAccountStatusSchema,
} = require('../validators/verificationValidators');

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Write a single AuditLog entry.
 * Reads ip and user-agent from the Express request object automatically.
 */
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

// ─── User-facing endpoints ───────────────────────────────────────────────────

/**
 * POST /api/v1/verification-requests
 * Authenticated user submits a new verification request.
 */
const submitVerification = async (req, res) => {
  const parsed = submitVerificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const { requestType, documents, notes } = parsed.data;

  // Block if user already has a pending request of the same type
  const existing = await VerificationRequest.findOne({
    userId: req.user._id,
    requestType,
    status: 'pending',
  });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Bạn đã có yêu cầu xác minh đang chờ duyệt',
    });
  }

  const request = await VerificationRequest.create({
    userId: req.user._id,
    requestType,
    documents,
    notes: notes || null,
  });

  // Reflect pending state on the user document
  await User.findByIdAndUpdate(req.user._id, { verificationStatus: 'pending' });

  return res.status(201).json({
    success: true,
    message: 'Yêu cầu xác minh đã được gửi thành công',
    data: { request },
  });
};

/**
 * GET /api/v1/verification-requests/me
 * Authenticated user views their own verification requests.
 */
const getMyVerificationRequests = async (req, res) => {
  const requests = await VerificationRequest.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });

  return res.json({
    success: true,
    message: 'Danh sách yêu cầu xác minh của bạn',
    data: { requests },
  });
};

// ─── Admin endpoints ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/users/verification-requests
 * Admin lists verification requests, filtered by status / requestType.
 * Defaults to pending requests, oldest first (review queue order).
 */
const listVerificationRequests = async (req, res) => {
  const { status = 'pending', requestType, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (requestType) filter.requestType = requestType;

  const skip = (Number(page) - 1) * Number(limit);

  const [requests, total] = await Promise.all([
    VerificationRequest.find(filter)
      .populate('userId', 'name email role verificationStatus')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit)),
    VerificationRequest.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    message: 'Danh sách yêu cầu xác minh',
    data: { requests, total, page: Number(page), limit: Number(limit) },
  });
};

/**
 * PATCH /api/v1/admin/users/verification-requests/:id/approve
 * Admin approves a pending verification request.
 * Updates both the request record and the user's role/verificationStatus.
 */
const approveVerification = async (req, res) => {
  const request = await VerificationRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu xác minh' });
  }
  if (request.status !== 'pending') {
    return res.status(409).json({ success: false, message: 'Yêu cầu này đã được xử lý rồi' });
  }

  // Update request record
  request.status = 'approved';
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  // Promote the user: role becomes requestType, mark verified
  await User.findByIdAndUpdate(request.userId, {
    role: request.requestType, // 'ngo' | 'individual'
    verificationStatus: 'verified',
  });

  await logAudit(
    req.user._id,
    'VerificationRequest',
    request._id,
    'verification.approve',
    { requestType: request.requestType, userId: request.userId },
    req
  );

  return res.json({
    success: true,
    message: 'Đã phê duyệt yêu cầu xác minh',
    data: { request },
  });
};

/**
 * PATCH /api/v1/admin/users/verification-requests/:id/reject
 * Admin rejects a pending verification request with a mandatory reason.
 */
const rejectVerification = async (req, res) => {
  const parsed = rejectVerificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const request = await VerificationRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu xác minh' });
  }
  if (request.status !== 'pending') {
    return res.status(409).json({ success: false, message: 'Yêu cầu này đã được xử lý rồi' });
  }

  request.status = 'rejected';
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.rejectionReason = parsed.data.rejectionReason;
  await request.save();

  await User.findByIdAndUpdate(request.userId, { verificationStatus: 'rejected' });

  await logAudit(
    req.user._id,
    'VerificationRequest',
    request._id,
    'verification.reject',
    {
      requestType: request.requestType,
      userId: request.userId,
      rejectionReason: parsed.data.rejectionReason,
    },
    req
  );

  return res.json({
    success: true,
    message: 'Đã từ chối yêu cầu xác minh',
    data: { request },
  });
};

/**
 * PATCH /api/v1/admin/users/:id/ngo-status
 * Admin directly grants or revokes the NGO tích xanh badge on a user account.
 */
const updateNgoStatus = async (req, res) => {
  const parsed = updateNgoStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const { action, reason } = parsed.data;

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }

  if (action === 'grant') {
    user.role = 'ngo';
    user.verificationStatus = 'verified';
  } else {
    // revoke — downgrade back to basic member
    user.role = 'member';
    user.verificationStatus = 'unverified';
  }
  await user.save();

  await logAudit(
    req.user._id,
    'User',
    user._id,
    `ngo.badge_${action}`,
    { reason: reason || null },
    req
  );

  return res.json({
    success: true,
    message: action === 'grant' ? 'Đã cấp tích xanh NGO' : 'Đã thu hồi tích xanh NGO',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    },
  });
};

/**
 * PATCH /api/v1/admin/users/:id/account-status
 * Admin activates, suspends, or bans a user account.
 */
const updateAccountStatus = async (req, res) => {
  const parsed = updateAccountStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const { accountStatus, reason } = parsed.data;

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }

  // Safety guard: admin accounts cannot be locked by other admins
  if (user.role === 'admin' && accountStatus !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Không thể khóa tài khoản Admin',
    });
  }

  const previousStatus = user.accountStatus;
  user.accountStatus = accountStatus;
  await user.save();

  await logAudit(
    req.user._id,
    'User',
    user._id,
    `user.account_status_${accountStatus}`,
    { previousStatus, reason: reason || null },
    req
  );

  return res.json({
    success: true,
    message: `Đã cập nhật trạng thái tài khoản thành "${accountStatus}"`,
    data: {
      user: { _id: user._id, name: user.name, accountStatus: user.accountStatus },
    },
  });
};

/**
 * PATCH /api/v1/admin/users/:id/individual-status
 * Admin revokes the Individual tích xanh badge from a user account.
 * Individual role is only granted via the verification-request approval flow,
 * so this endpoint only supports action = "revoke".
 */
const updateIndividualStatus = async (req, res) => {
  const parsed = updateIndividualStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const { reason } = parsed.data;

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }

  if (user.role !== 'individual') {
    return res.status(409).json({
      success: false,
      message: 'Người dùng không phải Individual hoặc chưa được xác minh',
    });
  }

  user.role = 'member';
  user.verificationStatus = 'unverified';
  await user.save();

  await logAudit(
    req.user._id,
    'User',
    user._id,
    'individual.badge_revoke',
    { reason: reason || null },
    req
  );

  return res.json({
    success: true,
    message: 'Đã thu hồi xác minh Individual',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    },
  });
};

/**
 * GET /api/v1/admin/users/:id
 * Admin fetches a single user by ID.
 */
const getUser = async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('name email role verificationStatus accountStatus ngoProfile.organizationName');
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }
  return res.json({ success: true, data: { user } });
};

/**
 * GET /api/v1/admin/users/verification-requests/:id
 * Admin fetches a single verification request by ID.
 */
const getVerificationRequest = async (req, res) => {
  const request = await VerificationRequest.findById(req.params.id)
    .populate('userId', 'name email role verificationStatus')
    .populate('reviewedBy', 'name email');
  if (!request) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu xác minh' });
  }
  return res.json({ success: true, data: { request } });
};

/**
 * GET /api/v1/admin/users
 * Admin lists users with optional role filter and pagination.
 */
const listUsers = async (req, res) => {
  const parsed = listUsersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Tham số truy vấn không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const { role, page, limit } = parsed.data;
  const filter = role ? { role } : {};
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name email role verificationStatus accountStatus ngoProfile.organizationName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    data: { users, total, page, limit },
  });
};

module.exports = {
  submitVerification,
  getMyVerificationRequests,
  listVerificationRequests,
  getVerificationRequest,
  approveVerification,
  rejectVerification,
  updateNgoStatus,
  updateIndividualStatus,
  listUsers,
  getUser,
  updateAccountStatus,
};
