const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    // Who performed the action
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = system
    },

    // What was acted upon
    targetType: {
      type: String,
      enum: ['User', 'Post', 'VerificationRequest', 'AuditLog', 'System', 'NewsPost', 'Wishlist'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // What happened
    action: {
      type: String,
      required: true,
      // e.g. 'user.ban', 'verification.approve', 'post.delete', 'ngo.badge_grant'
    },

    // Extra context
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Request context
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
