'use strict';

/**
 * Migration: Email optional + phone login support
 *
 * Thực hiện:
 * 1. Drop index email_1 (unique non-sparse) nếu tồn tại
 * 2. Tạo index { email: 1 } unique sparse (cho phép nhiều null)
 * 3. Tạo index { contact.phone: 1 } unique sparse
 * 4. Chuẩn hoá các document có email là chuỗi rỗng → null
 *    (để sparse index bỏ qua thay vì bị conflict unique)
 */

const mongoose = require('mongoose');
const connectDB = require('../config/db');

async function run() {
  await connectDB();

  const db = mongoose.connection.db;
  const collection = db.collection('users');

  // ── 1. Drop các index email cũ nếu tồn tại ──────────────────────────────────
  for (const indexName of ['email_1', 'email_1_sparse', 'contact_phone_1_sparse']) {
    try {
      await collection.dropIndex(indexName);
      console.log(`✅ Đã drop index ${indexName}`);
    } catch (err) {
      if (err.codeName === 'IndexNotFound' || err.code === 27) {
        console.log(`ℹ️  Index ${indexName} không tồn tại, bỏ qua`);
      } else {
        throw err;
      }
    }
  }

  // ── 2. Chuẩn hoá email rỗng → null ─────────────────────────────────────────
  const emailFix = await collection.updateMany(
    { email: '' },
    { $set: { email: null } },
  );
  if (emailFix.modifiedCount > 0) {
    console.log(`✅ Đã chuẩn hoá ${emailFix.modifiedCount} document có email="" → null`);
  } else {
    console.log('ℹ️  Không có document nào cần chuẩn hoá email');
  }

  // ── 3. Tạo index email (partial) ────────────────────────────────────────────
  // Dùng partialFilterExpression thay vì sparse để chỉ index khi email là string
  // (sparse index vẫn index null nếu field tồn tại trong document)
  await collection.createIndex(
    { email: 1 },
    {
      unique: true,
      partialFilterExpression: { email: { $type: 'string' } },
      name: 'email_1_partial',
    },
  );
  console.log('✅ Đã tạo index email_1_partial (unique, partial string)');

  // ── 4. Tạo index contact.phone (partial) ─────────────────────────────────────
  // Tương tự: chỉ index khi contact.phone là string, bỏ qua null
  await collection.createIndex(
    { 'contact.phone': 1 },
    {
      unique: true,
      partialFilterExpression: { 'contact.phone': { $type: 'string' } },
      name: 'contact_phone_1_partial',
    },
  );
  console.log('✅ Đã tạo index contact_phone_1_partial (unique, partial string)');

  // ── Tóm tắt ──────────────────────────────────────────────────────────────────
  const totalUsers = await collection.countDocuments();
  const withEmail  = await collection.countDocuments({ email: { $nin: [null, ''] } });
  const withPhone  = await collection.countDocuments({ 'contact.phone': { $nin: [null, ''] } });

  console.log('\n📊 Thống kê sau migration:');
  console.log(`   Tổng số users    : ${totalUsers}`);
  console.log(`   Có email         : ${withEmail}`);
  console.log(`   Có contact.phone : ${withPhone}`);

  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Migration thất bại:', err.message);
  process.exit(1);
});
