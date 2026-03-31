const User          = require('../models/User');
const bcrypt        = require('bcryptjs');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // 2. Mã hóa password (số 12 = độ phức tạp, càng cao càng chậm)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Tạo user mới
    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
    });

    // 4. Trả về token
    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── LOGIN ────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu sai' });
    }

    // 2. So sánh password đã nhập với password đã mã hóa trong DB
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu sai' });
    }

    // 3. Trả về thông tin + token
    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };