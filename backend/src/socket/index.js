'use strict';

const { Server } = require('socket.io');
const env = require('../config/env');
const { socketAuthMiddleware } = require('./middleware');
const { registerChatHandlers } = require('./chatHandler');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });
  io.use(socketAuthMiddleware);
  io.on('connection', (socket) => {
    registerChatHandlers(io, socket);
  });
  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

module.exports = { initSocket, getIO };
