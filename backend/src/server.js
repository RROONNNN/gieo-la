'use strict';

const { server } = require('./app');
const { initSocket } = require('./socket/index');
const env = require('./config/env');
const connectDB = require('./config/db');

connectDB().then(() => {
  initSocket(server);
  server.listen(env.PORT, () => {
    console.log(`🌿 Server đang chạy tại http://localhost:${env.PORT}`);
  });
});
