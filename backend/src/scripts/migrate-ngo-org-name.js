'use strict';

/**
 * Migration: Remove ngoProfile.organizationName — use name field instead
 *
 * Thực hiện:
 * 1. Với mọi NGO user có ngoProfile.organizationName != null:
 *    - Gán name = ngoProfile.organizationName (tên tổ chức là field name)
 *    - Xoá ngoProfile.organizationName
 * 2. Với mọi user còn lại có ngoProfile.organizationName tồn tại:
 *    - Chỉ xoá ngoProfile.organizationName (không thay đổi name)
 *
 * Chạy một lần: node backend/src/scripts/migrate-ngo-org-name.js
 */

const mongoose = require('mongoose');
const connectDB = require('../config/db');

async function run() {
  await connectDB();

  const collection = mongoose.connection.db.collection('users');

  // ── 1. Các NGO user có organizationName khác null ────────────────────────────
  const result1 = await collection.updateMany(
    {
      role: 'ngo',
      'ngoProfile.organizationName': { $type: 'string' },
    },
    [
      {
        $set: {
          name: '$ngoProfile.organizationName',
        },
      },
      {
        $unset: 'ngoProfile.organizationName',
      },
    ],
  );

  console.log(
    `✅ Bước 1: ${result1.modifiedCount} NGO user đã được cập nhật name ← ngoProfile.organizationName`,
  );

  // ── 2. Dọn sạch mọi user còn tồn tại ngoProfile.organizationName ────────────
  const result2 = await collection.updateMany(
    { 'ngoProfile.organizationName': { $exists: true } },
    { $unset: { 'ngoProfile.organizationName': '' } },
  );

  if (result2.modifiedCount > 0) {
    console.log(
      `✅ Bước 2: Đã xoá ngoProfile.organizationName khỏi ${result2.modifiedCount} user còn lại`,
    );
  } else {
    console.log('ℹ️  Bước 2: Không còn document nào chứa ngoProfile.organizationName');
  }

  // ── Kiểm tra kết quả ─────────────────────────────────────────────────────────
  const remaining = await collection.countDocuments({
    'ngoProfile.organizationName': { $exists: true },
  });

  if (remaining === 0) {
    console.log('✅ Migration hoàn tất — không còn ngoProfile.organizationName nào trong DB');
  } else {
    console.warn(`⚠️  Còn ${remaining} document chứa ngoProfile.organizationName — kiểm tra lại`);
  }

  await mongoose.disconnect();
  console.log('✅ Đã ngắt kết nối MongoDB');
}

run().catch((err) => {
  console.error('❌ Migration thất bại:', err);
  process.exit(1);
});
