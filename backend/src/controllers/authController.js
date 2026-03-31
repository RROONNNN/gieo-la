'use strict';

const bcrypt        = require('bcryptjs');
const User          = require('../models/User');
const generateToken = require('../utils/generateToken');
const {
  registerMemberSchema,
  registerNgoSchema,
  registerIndividualSchema,
  loginSchema,
  updateProfileSchema,
} = require('../validators/authValidators');

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

// ── Shared registration helper ────────────────────────────────────────────────
const createUser = async (payload) => {
  const passwordHash = await bcrypt.hash(payload.password, 12);
  return User.create({ ...payload, passwordHash, password: undefined });
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

  const { name, email, password } = parsed.data;

  if (await User.exists({ email })) {
    return res.status(409).json({ success: false, message: 'Email đã được sử dụng' });
  }

  const user = await createUser({
    name,
    email,
    password,
    role:               'member',
    accountStatus:      'active',
    verificationStatus: 'unverified',
  });

  return res.status(201).json({
    success: true,
    message: 'Đăng ký thành công',
    data:    { user: safeUser(user), token: generateToken(user._id, user.role) },
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

  const { name, email, password, organizationName, website, description } = parsed.data;

  if (await User.exists({ email })) {
    return res.status(409).json({ success: false, message: 'Email đã được sử dụng' });
  }

  const user = await createUser({
    name,
    email,
    password,
    role:               'ngo',
    accountStatus:      'active',
    verificationStatus: 'pending',
    ngoProfile:         { organizationName, website: website || null, description: description || null },
  });

  return res.status(201).json({
    success: true,
    message: 'Đăng ký NGO thành công. Tài khoản đang chờ Admin xác thực.',
    data:    { user: safeUser(user), token: generateToken(user._id, user.role) },
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

  const { name, email, password } = parsed.data;

  if (await User.exists({ email })) {
    return res.status(409).json({ success: false, message: 'Email đã được sử dụng' });
  }

  const user = await createUser({
    name,
    email,
    password,
    role:               'individual',
    accountStatus:      'active',
    verificationStatus: 'pending',
  });

  return res.status(201).json({
    success: true,
    message: 'Đăng ký thành công. Tài khoản đang chờ Admin xét duyệt giấy tờ xác nhận.',
    data:    { user: safeUser(user), token: generateToken(user._id, user.role) },
  });
};

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

  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
  }

  if (user.accountStatus === 'suspended' || user.accountStatus === 'banned') {
    return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });
  }

  user.lastLoginAt = new Date();
  await user.save();

  return res.json({
    success: true,
    message: 'Đăng nhập thành công',
    data:    { user: safeUser(user), token: generateToken(user._id, user.role) },
  });
};

// ── GET /me ───────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user is populated by auth middleware
  return res.json({
    success: true,
    data:    { user: safeUser(req.user) },
  });
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

  // Build a flat $set object so partial nested updates don't wipe siblings
  const updates = {};
  const { name, avatar, contact, location, ngoProfile } = parsed.data;
  if (name   !== undefined) updates.name   = name;
  if (avatar !== undefined) updates.avatar = avatar;
  if (contact?.phone !== undefined)          updates['contact.phone']            = contact.phone;
  if (location?.city !== undefined)          updates['location.city']            = location.city;
  if (location?.district !== undefined)      updates['location.district']        = location.district;
  if (ngoProfile?.organizationName !== undefined) updates['ngoProfile.organizationName'] = ngoProfile.organizationName;
  if (ngoProfile?.website !== undefined)     updates['ngoProfile.website']       = ngoProfile.website;
  if (ngoProfile?.description !== undefined) updates['ngoProfile.description']   = ngoProfile.description;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return res.json({
    success: true,
    message: 'Cập nhật thông tin thành công',
    data:    { user: safeUser(user) },
  });
};

module.exports = { registerMember, registerNgo, registerIndividual, login, getMe, updateMe };