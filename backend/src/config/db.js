const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    appName: 'gieo-la-backend',
    autoIndex: env.NODE_ENV !== 'production',
  };

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, options);
    console.log(`✅ MongoDB đã kết nối: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;