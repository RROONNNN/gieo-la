'use strict';

const mongoose = require('mongoose');

const wishlistCommentSchema = new mongoose.Schema(
  {
    wishlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wishlist',
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

wishlistCommentSchema.index({ wishlist: 1, createdAt: 1 });

module.exports = mongoose.model('WishlistComment', wishlistCommentSchema);
