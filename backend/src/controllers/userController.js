'use strict';

const mongoose = require('mongoose');
const User = require('../models/User');
const { USER_ROLES } = require('../constants/userEnums');

const publicProfile = (user) => ({
  _id:                user._id,
  name:               user.name,
  avatar:             user.avatar,
  role:               user.role,
  verificationStatus: user.verificationStatus,
  accountStatus:      user.accountStatus,
  badge:              user.badge,
  completedDonations: user.completedDonations,
  ngoProfile:         user.role === USER_ROLES.NGO ? user.ngoProfile : null,
  location:           { city: user.location?.city ?? null },
  createdAt:          user.createdAt,
});

const getUserProfile = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'ID người dùng không hợp lệ' });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ người dùng' });
  }

  return res.status(200).json({ success: true, data: { user: publicProfile(user) } });
};

module.exports = { getUserProfile };
