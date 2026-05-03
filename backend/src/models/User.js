
const mongoose = require('mongoose');
const {
  USER_ROLES,
  ACCOUNT_STATUSES,
  VERIFICATION_STATUSES,
  USER_ROLE_VALUES,
  ACCOUNT_STATUS_VALUES,
  VERIFICATION_STATUS_VALUES,
} = require('../constants/userEnums');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: USER_ROLES.MEMBER,
    },

    // Account lifecycle
    accountStatus: {
      type: String,
      enum: ACCOUNT_STATUS_VALUES,
      default: ACCOUNT_STATUSES.ACTIVE,
    },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUS_VALUES,
      default: VERIFICATION_STATUSES.UNVERIFIED,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    // Profile
    avatar: {
      type: String,
      default: null,
    },
    contact: {
      phone: { type: String, default: null, trim: true },
    },
    location: {
      city: { type: String, default: null },
      district: { type: String, default: null },
    },

    // NGO-specific profile
    ngoProfile: {
      organizationName: { type: String, default: null },
      website: { type: String, default: null },
      description: { type: String, default: null },
    },

    // Gamification
    badge: {
      type: String,
      enum: ['none', 'bronze', 'silver', 'gold'],
      default: 'none',
    },

    // Counters
    completedDonations: {
      type: Number,
      default: 0,
    },
    receivedItemsThisMonth: {
      type: Number,
      default: 0,
    },
    receivedItemsResetAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1, accountStatus: 1 });
userSchema.index({ verificationStatus: 1, role: 1 });
// Partial indexes: chỉ index khi giá trị là string (bỏ qua null)
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } },
);
userSchema.index(
  { 'contact.phone': 1 },
  { unique: true, partialFilterExpression: { 'contact.phone': { $type: 'string' } } },
);

// At least one of email or phone must be set
userSchema.pre('validate', async function () {
  if (!this.email && !this.contact?.phone) {
    this.invalidate('email', 'Vui lòng cung cấp email hoặc số điện thoại');
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;