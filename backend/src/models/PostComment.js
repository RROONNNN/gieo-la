'use strict';

const mongoose = require('mongoose');

const postCommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: [500, 'Bình luận tối đa 500 ký tự'],
      default: '',
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 3,
        message: 'Tối đa 3 ảnh trên mỗi bình luận',
      },
    },
  },
  { timestamps: true },
);

postCommentSchema.index({ post: 1, createdAt: 1 });

module.exports = mongoose.model('PostComment', postCommentSchema);
