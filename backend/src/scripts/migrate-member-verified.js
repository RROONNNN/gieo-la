'use strict';

const connectDB = require('../config/db');
const User = require('../models/User');
const { USER_ROLES, VERIFICATION_STATUSES } = require('../constants/userEnums');

async function run() {
  await connectDB();

  const result = await User.updateMany(
    { role: USER_ROLES.MEMBER },
    { $set: { verificationStatus: VERIFICATION_STATUSES.VERIFIED } }
  );

  console.log(`✅ Migration hoàn tất: ${result.modifiedCount} / ${result.matchedCount} users đã được cập nhật`);
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Migration thất bại:', err.message);
  process.exit(1);
});
