'use strict';

const mongoose = require('mongoose');
const { POST_CATEGORY_VALUES } = require('../constants/postEnums');

const wishlistSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề'],
      trim: true,
      maxlength: 200,
    },
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'Tối đa 5 ảnh',
      },
      default: [],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },
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
    status: {
      type: String,
      enum: ['open', 'fulfilled'],
      default: 'open',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

wishlistSchema.index({ author: 1, createdAt: -1 });
wishlistSchema.index({ isPinned: -1, createdAt: -1 });
wishlistSchema.index({ category: 1, status: 1 });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
