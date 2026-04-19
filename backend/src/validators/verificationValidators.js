'use strict';

const { z } = require('zod');
const {
  USER_ROLES,
  USER_ROLE_VALUES,
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
    // Tối đa 10 loại giấy tờ × tối đa 5 ảnh mỗi loại = 50 ảnh
    .max(50, 'Tối đa 50 ảnh minh chứng'),
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

/**
 * Admin revoking Individual tích xanh (no grant — Individual role is granted
 * only through the verification request flow, not directly by Admin).
 */
const updateIndividualStatusSchema = z.object({
  action: z.literal('revoke', {
    errorMap: () => ({ message: 'action phải là "revoke"' }),
  }),
  reason: z.string().max(500).optional(),
});

/**
 * Query params for listing users (GET /admin/users).
 */
const listUsersQuerySchema = z.object({
  role: z
    .enum(USER_ROLE_VALUES, {
      errorMap: () => ({ message: 'role không hợp lệ' }),
    })
    .optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(20).optional().default(20),
});

module.exports = {
  submitVerificationSchema,
  rejectVerificationSchema,
  updateNgoStatusSchema,
  updateIndividualStatusSchema,
  listUsersQuerySchema,
  updateAccountStatusSchema,
};
