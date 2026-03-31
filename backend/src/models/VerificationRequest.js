const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestType: {
      type: String,
      enum: ['ngo', 'individual'],
      required: true,
    },

    // Submitted documents
    documents: [
      {
        url: { type: String, required: true },
        label: { type: String, default: null }, // e.g. "Hộ nghèo", "Xác nhận địa phương"
      },
    ],
    notes: {
      type: String,
      default: null,
    },

    // Workflow
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

verificationRequestSchema.index({ userId: 1, status: 1 });
verificationRequestSchema.index({ status: 1, requestType: 1 });

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);

module.exports = VerificationRequest;
