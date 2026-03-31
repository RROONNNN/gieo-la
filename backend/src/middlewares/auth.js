'use strict';

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — parse Bearer token, verify JWT, load user, block locked accounts.
 * Attaches the full user document to req.user.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Không tìm thấy token xác thực' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Token đã hết hạn' : 'Token không hợp lệ';
    return res.status(401).json({ success: false, message });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });
  }

  if (user.accountStatus === 'suspended' || user.accountStatus === 'banned') {
    return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });
  }

  req.user = user;
  next();
};

/**
 * restrictTo(...roles) — role guard factory.
 * Must be used after protect.
 *
 * @example
 *   router.delete('/post/:id', protect, restrictTo('admin'), handler);
 */
const restrictTo = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này',
      });
    }
    next();
  };

module.exports = { protect, restrictTo };
