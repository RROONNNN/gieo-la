'use strict';

const { z } = require('zod');
const {
  USER_ROLES,
  ACCOUNT_STATUS_VALUES,
} = require('../constants/userEnums');

// Single document metadata entry (URL only — binary stored in cloud storage)
const documentSchema = z.object({
  url: z.string().url('URL tài liệu không hợp lệ'),
  label: z.string().max(100).optional(),
});

/**
 * User submitting a verification request.
 * requestType 'ngo' or 'individual', plus supporting document URLs.
 */
const submitVerificationSchema = z.object({
  requestType: z.enum([USER_ROLES.NGO, USER_ROLES.INDIVIDUAL], {
    errorMap: () => ({ message: 'requestType phải là "ngo" hoặc "individual"' }),
  }),
  documents: z
    .array(documentSchema)
    .min(1, 'Cần ít nhất 1 tài liệu đính kèm')
    .max(5, 'Tối đa 5 tài liệu'),
  notes: z.string().max(1000).optional(),
});

/**
 * Admin rejecting a request — must provide a reason.
 */
const rejectVerificationSchema = z.object({
  rejectionReason: z
    .string()
    .min(5, 'Vui lòng cung cấp lý do từ chối (ít nhất 5 ký tự)')
    .max(500),
});

/**
 * Admin granting or revoking NGO tích xanh.
 */
const updateNgoStatusSchema = z.object({
  action: z.enum(['grant', 'revoke'], {
    errorMap: () => ({ message: 'action phải là "grant" hoặc "revoke"' }),
  }),
  reason: z.string().max(500).optional(),
});

/**
 * Admin changing a user's account status (activate / suspend / ban).
 */
const updateAccountStatusSchema = z.object({
  accountStatus: z.enum(ACCOUNT_STATUS_VALUES, {
    errorMap: () => ({
      message: 'accountStatus phải là "active", "suspended", hoặc "banned"',
    }),
  }),
  reason: z.string().max(500).optional(),
});

module.exports = {
  submitVerificationSchema,
  rejectVerificationSchema,
  updateNgoStatusSchema,
  updateAccountStatusSchema,
};
