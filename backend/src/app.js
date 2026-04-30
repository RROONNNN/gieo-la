'use strict';

const path = require('path');
const env = require('./config/env');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
// const connectDB = require('./config/db');
const apiRouter = require('./routes/index');

const app = express();

// ── Security middleware ───────────────────────
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// ── Request logging ───────────────────────────
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Cookie parser ─────────────────────────────
app.use(cookieParser());

// ── Body parsers ──────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Rate limiter ──────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'development',
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);
// ── Static files ───────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// ── Health check ──────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', message: 'Gieo La BE is running!' });
});

// ── API routes ────────────────────────────────
app.use('/api/v1', apiRouter);

// ── 404 handler ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Centralized error handler ─────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {  // Multer file size/format errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'Ảnh vượt quá giới hạn 5 MB.' });
  }
  if (err.message && err.message.startsWith('Định dạng ảnh')) {
    return res.status(400).json({ success: false, message: err.message });
  }  console.error(err.stack);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ── Export app for server.js to wrap with http.Server ─────────────────────
const http = require('http');
const server = http.createServer(app);

module.exports = { app, server };
