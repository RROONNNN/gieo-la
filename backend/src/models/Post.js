'use strict';

const mongoose = require('mongoose');
const {
  POST_CATEGORY_VALUES,
  POST_CONDITION_VALUES,
  POST_STATUS_VALUES,
  POST_STATUSES,
} = require('../constants/postEnums');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Required fields per requirement III
    category: {
      type: String,
      enum: POST_CATEGORY_VALUES,
      required: [true, 'Vui lòng chọn danh mục'],
    },
    quantity: {
      type: Number,
      required: [true, 'Vui lòng nhập số lượng'],
      min: [1, 'Số lượng tối thiểu là 1'],
    },
    condition: {
      type: String,
      enum: POST_CONDITION_VALUES,
      required: [true, 'Vui lòng chọn tình trạng'],
    },
    conditionNote: {
      type: String,
      maxlength: 500,
      default: null,
    },
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 5,
        message: 'Cần từ 1 đến 5 ảnh',
      },
      required: [true, 'Vui lòng tải lên ít nhất 1 ảnh'],
    },
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },

    // Status flow: available → in_transaction → traded → completed
    status: {
      type: String,
      enum: POST_STATUS_VALUES,
      default: POST_STATUSES.AVAILABLE,
    },

    // Admin can pin posts
    isPinned: {
      type: Boolean,
      default: false,
    },

    // Timestamp set by admin when post is marked 'completed' (for leaderboard)
    completedAt: {
      type: Date,
      default: null,
    },

    // Likes
    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
    },

    // Chosen recipient (set when author selects an applicant)
    selectedApplicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Recipient confirms they received the item (set by selectedApplicant)
    receiverConfirmed: {
      type: Boolean,
      default: false,
    },
    receiverConfirmedAt: {
      type: Date,
      default: null,
    },

    // Location
    location: {
      city: { type: String, default: 'Hà Nội' },
      district: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search
postSchema.index({ title: 'text', description: 'text' });
// Filtering indexes
postSchema.index({ status: 1, category: 1, createdAt: -1 });
postSchema.index({ status: 1, completedAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ isPinned: -1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
