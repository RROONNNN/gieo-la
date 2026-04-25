'use strict';

/**
 * One-time backfill: set completedAt = updatedAt for all Post docs
 * where status === 'completed' AND completedAt is null.
 *
 * Run with: node backend/src/scripts/backfill-completedAt.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const result = await mongoose
    .connection
    .collection('posts')
    .updateMany(
      { status: 'completed', completedAt: null },
      [{ $set: { completedAt: '$updatedAt' } }]
    );

  console.log(`Updated ${result.modifiedCount} document(s)`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
