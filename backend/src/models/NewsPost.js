'use strict';

const mongoose = require('mongoose');
const { NEWS_CATEGORY_VALUES, NEWS_STATUS_VALUES, NEWS_STATUSES } = require('../constants/newsEnums');

const newsPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề'],
      trim: true,
      minlength: [5, 'Tiêu đề phải có ít nhất 5 ký tự'],
      maxlength: [200, 'Tiêu đề tối đa 200 ký tự'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Vui lòng tải lên ảnh bìa'],
    },
    content: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung bài viết'],
    },
    category: {
      type: String,
      enum: NEWS_CATEGORY_VALUES,
      required: [true, 'Vui lòng chọn danh mục'],
    },
    status: {
      type: String,
      enum: NEWS_STATUS_VALUES,
      default: NEWS_STATUSES.DRAFT,
    },
    // Set automatically when status first transitions to 'published'
    publishedAt: {
      type: Date,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Optimise public listing: pinned first, then by published date
newsPostSchema.index({ status: 1, isPinned: -1, publishedAt: -1 });
// Optimise category filter
newsPostSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('NewsPost', newsPostSchema);
