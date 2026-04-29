'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

async function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    socket.userId = payload.id; // JWT payload uses { id, role }
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
}

module.exports = { socketAuthMiddleware };
