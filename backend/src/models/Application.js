'use strict';

const mongoose = require('mongoose');
const {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_VALUES,
} = require('../constants/applicationEnums');

const applicationSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Mô tả hoàn cảnh / lý do muốn nhận
    message: {
      type: String,
      required: [true, 'Vui lòng nhập lý do muốn nhận đồ'],
      maxlength: 2000,
      trim: true,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUS_VALUES,
      default: APPLICATION_STATUSES.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications from same user on same post
applicationSchema.index({ post: 1, applicant: 1 }, { unique: true });
// Efficient queries per post (sorted by role priority handled in controller)
applicationSchema.index({ post: 1, status: 1, createdAt: 1 });
// For monthly limit counting
applicationSchema.index({ applicant: 1, status: 1, createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
