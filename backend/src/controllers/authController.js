'use strict';

const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const User    = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const {
  USER_ROLES,
  ACCOUNT_STATUSES,
  VERIFICATION_STATUSES,
} = require('../constants/userEnums');
const {
  registerMemberSchema,
  registerNgoSchema,
  registerIndividualSchema,
  loginSchema,
  updateProfileSchema,
} = require('../validators/authValidators');

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// Serialise safe user fields for API responses
const safeUser = (user) => ({
  _id:                user._id,
  name:               user.name,
  email:              user.email,
  role:               user.role,
  accountStatus:      user.accountStatus,
  verificationStatus: user.verificationStatus,
  avatar:             user.avatar,
  contact:            user.contact,
  location:           user.location,
  ngoProfile:         user.ngoProfile,
  badge:              user.badge,
  completedDonations: user.completedDonations,
  lastLoginAt:        user.lastLoginAt,
  createdAt:          user.createdAt,
});

/** Set httpOnly refresh token cookie on the response */
const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   REFRESH_TOKEN_MAX_AGE,
    path:     '/',
  });
};

/** Clear refresh token cookie */
const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, { httpOnly: true, sameSite: 'lax', path: '/' });
};

/** Issue both tokens, persist hash, set cookie, return access token + user */
const issueTokens = async (res, user) => {
  const { raw, hash }  = generateRefreshToken();
  const accessToken    = generateToken(user._id, user.role);

  await User.findByIdAndUpdate(user._id, { refreshTokenHash: hash });
  setRefreshCookie(res, raw);

  return { accessToken, safeUserData: safeUser(user) };
};

// ── Shared registration helper ────────────────────────────────────────────────
const createUser = async (payload) => {
  const passwordHash = await bcrypt.hash(payload.password, 12);
  return User.create({ ...payload, passwordHash, password: undefined });
};

// ── Shared: check uniqueness of email / phone before creating ─────────────────
const checkIdentifierUniqueness = async (res, { email, phone }) => {
  if (email && await User.exists({ email })) {
    res.status(409).json({ success: false, message: 'Email đã được sử dụng' });
    return false;
  }
  if (phone && await User.exists({ 'contact.phone': phone })) {
    res.status(409).json({ success: false, message: 'Số điện thoại đã được sử dụng' });
    return false;
  }
  return true;
};

// ── REGISTER: Member ──────────────────────────────────────────────────────────
const registerMember = async (req, res) => {
  const parsed = registerMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors:  parsed.error.flatten().fieldErrors,
    });
  }

  const { name, email, phone, password } = parsed.data;

  if (!await checkIdentifierUniqueness(res, { email, phone })) return;

  const user = await createUser({
    name,
    email:    email || null,
    password,
    contact:  phone ? { phone } : undefined,
    role:               USER_ROLES.MEMBER,
    accountStatus:      ACCOUNT_STATUSES.ACTIVE,
    verificationStatus: VERIFICATION_STATUSES.VERIFIED,
  });

  const { accessToken, safeUserData } = await issueTokens(res, user);

  return res.status(201).json({
    success: true,
    message: 'Đăng ký thành công',
    data:    { user: safeUserData, token: accessToken },
  });
};

// ── REGISTER: NGO ─────────────────────────────────────────────────────────────
const registerNgo = async (req, res) => {
  const parsed = registerNgoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors:  parsed.error.flatten().fieldErrors,
    });
  }

  const { name, email, phone, password, organizationName, website, description } = parsed.data;

  if (!await checkIdentifierUniqueness(res, { email, phone })) return;

  const user = await createUser({
    name,
    email:    email || null,
    password,
    contact:  phone ? { phone } : undefined,
    role:               USER_ROLES.NGO,
    accountStatus:      ACCOUNT_STATUSES.ACTIVE,
    verificationStatus: VERIFICATION_STATUSES.UNVERIFIED,
    ngoProfile:         { organizationName, website: website || null, description: description || null },
  });

  const { accessToken, safeUserData } = await issueTokens(res, user);

  return res.status(201).json({
    success: true,
    message: 'Đăng ký NGO thành công. Tài khoản đang chờ Admin xác thực.',
    data:    { user: safeUserData, token: accessToken },
  });
};

// ── REGISTER: Individual (Cá nhân khó khăn) ──────────────────────────────────
const registerIndividual = async (req, res) => {
  const parsed = registerIndividualSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors:  parsed.error.flatten().fieldErrors,
    });
  }

  const { name, email, phone, password } = parsed.data;

  if (!await checkIdentifierUniqueness(res, { email, phone })) return;

  const user = await createUser({
    name,
    email:    email || null,
    password,
    contact:  phone ? { phone } : undefined,
    role:               USER_ROLES.INDIVIDUAL,
    accountStatus:      ACCOUNT_STATUSES.ACTIVE,
    verificationStatus: VERIFICATION_STATUSES.UNVERIFIED,
  });

  const { accessToken, safeUserData } = await issueTokens(res, user);

  return res.status(201).json({
    success: true,
    message: 'Đăng ký thành công. Tài khoản đang chờ Admin xét duyệt giấy tờ xác nhận.',
    data:    { user: safeUserData, token: accessToken },
  });
};

// Detect if a string looks like a phone number (digits, optional leading +)
const isPhoneNumber = (value) => /^\+?[0-9]{9,15}$/.test(value.replace(/[\s\-()]/g, ''));

// ── LOGIN ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors:  parsed.error.flatten().fieldErrors,
    });
  }

  const { identifier: rawIdentifier, email: emailAlias, password } = parsed.data;
  const identifier = (rawIdentifier || emailAlias || '').trim();

  const query = isPhoneNumber(identifier)
    ? { 'contact.phone': identifier }
    : { email: identifier };

  const user = await User.findOne(query).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ success: false, message: 'Email/số điện thoại hoặc mật khẩu không đúng' });
  }

  if (
    user.accountStatus === ACCOUNT_STATUSES.SUSPENDED ||
    user.accountStatus === ACCOUNT_STATUSES.BANNED
  ) {
    return res.status(403).json({
      success: false,
      message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
    });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const { accessToken, safeUserData } = await issueTokens(res, user);

  return res.json({
    success: true,
    message: 'Đăng nhập thành công',
    data:    { user: safeUserData, token: accessToken },
  });
};

// ── GET /me ───────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  return res.json({
    success: true,
    data:    { user: safeUser(req.user) },
  });
};

// ── POST /refresh-token ───────────────────────────────────────────────────────
const refreshToken = async (req, res) => {
  const raw = req.cookies?.[REFRESH_TOKEN_COOKIE];
  if (!raw) {
    return res.status(401).json({ success: false, message: 'Không tìm thấy refresh token' });
  }

  const incomingHash = crypto
    .createHmac('sha256', process.env.REFRESH_TOKEN_SECRET)
    .update(raw)
    .digest('hex');

  const user = await User.findOne({ refreshTokenHash: incomingHash }).select('+refreshTokenHash');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
  }

  if (
    user.accountStatus === ACCOUNT_STATUSES.SUSPENDED ||
    user.accountStatus === ACCOUNT_STATUSES.BANNED
  ) {
    clearRefreshCookie(res);
    return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });
  }

  // Rotate: issue a new refresh token
  const { accessToken, safeUserData } = await issueTokens(res, user);

  return res.json({
    success: true,
    message: 'Làm mới phiên đăng nhập thành công',
    data:    { user: safeUserData, token: accessToken },
  });
};

// ── POST /logout ──────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  const raw = req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (raw) {
    const hash = crypto
      .createHmac('sha256', process.env.REFRESH_TOKEN_SECRET)
      .update(raw)
      .digest('hex');
    await User.findOneAndUpdate({ refreshTokenHash: hash }, { refreshTokenHash: null });
  }

  clearRefreshCookie(res);

  return res.json({ success: true, message: 'Đăng xuất thành công' });
};

// ── PATCH /me ─────────────────────────────────────────────────────────────────
const updateMe = async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors:  parsed.error.flatten().fieldErrors,
    });
  }

  const updates = {};
  const { name, avatar, contact, location, ngoProfile } = parsed.data;
  if (name   !== undefined) updates.name   = name;
  if (avatar !== undefined) updates.avatar = avatar;
  if (contact?.phone !== undefined)               updates['contact.phone']               = contact.phone;
  if (location?.city !== undefined)               updates['location.city']               = location.city;
  if (location?.district !== undefined)           updates['location.district']           = location.district;
  if (ngoProfile?.organizationName !== undefined) updates['ngoProfile.organizationName'] = ngoProfile.organizationName;
  if (ngoProfile?.website !== undefined)          updates['ngoProfile.website']          = ngoProfile.website;
  if (ngoProfile?.description !== undefined)      updates['ngoProfile.description']      = ngoProfile.description;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true },
  );

  return res.json({
    success: true,
    message: 'Cập nhật thông tin thành công',
    data:    { user: safeUser(user) },
  });
};

module.exports = {
  registerMember,
  registerNgo,
  registerIndividual,
  login,
  getMe,
  refreshToken,
  logout,
  updateMe,
};
