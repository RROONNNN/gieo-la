'use strict';

const { z } = require('zod');

const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(72, 'Mật khẩu không được vượt quá 72 ký tự'); // bcrypt 72-byte limit

const emailSchema = z
  .string()
  .email('Email không hợp lệ')
  .toLowerCase()
  .trim();

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{9,15}$/, 'Số điện thoại không hợp lệ (chỉ chứa số, bắt đầu bằng + hoặc 0)');

const nameSchema = z
  .string()
  .min(2, 'Tên phải có ít nhất 2 ký tự')
  .max(60, 'Tên không được vượt quá 60 ký tự')
  .trim();

/** Refinement: yêu cầu ít nhất một trong email hoặc phone */
const requireEmailOrPhone = (data, ctx) => {
  if (!data.email && !data.phone) {
    ctx.addIssue({
      code: 'custom',
      path: ['email'],
      message: 'Vui lòng cung cấp email hoặc số điện thoại',
    });
  }
};

// ── Register: Member ──────────────────────────────────────────────────────────
const registerMemberSchema = z
  .object({
    name:     nameSchema,
    email:    emailSchema.optional(),
    phone:    phoneSchema.optional(),
    password: passwordSchema,
  })
  .superRefine(requireEmailOrPhone);

// ── Register: NGO ─────────────────────────────────────────────────────────────
const registerNgoSchema = z
  .object({
    name:        nameSchema,
    email:       emailSchema.optional(),
    phone:       phoneSchema.optional(),
    password:    passwordSchema,
    website:     z.string().url('Website không hợp lệ').optional().or(z.literal('')),
    description: z.string().max(500).trim().optional(),
  })
  .superRefine(requireEmailOrPhone);

// ── Register: Individual ──────────────────────────────────────────────────────
const registerIndividualSchema = z
  .object({
    name:     nameSchema,
    email:    emailSchema.optional(),
    phone:    phoneSchema.optional(),
    password: passwordSchema,
  })
  .superRefine(requireEmailOrPhone);

// ── Login ─────────────────────────────────────────────────────────────────────
// Chấp nhận cả `identifier` (mới) lẫn `email` (cũ/frontend) để backward-compatible
// Normalization (identifier = identifier || email) được xử lý trong controller
const loginSchema = z
  .object({
    identifier: z.string().trim().optional(),
    email:      z.string().trim().optional(),
    password:   z.string().min(1, 'Vui lòng nhập mật khẩu'),
  })
  .refine(
    (data) => !!(data.identifier?.trim() || data.email?.trim()),
    { message: 'Vui lòng nhập email hoặc số điện thoại', path: ['identifier'] },
  );

// ── Update profile (PATCH /me) ────────────────────────────────────────────────
const updateProfileSchema = z
  .object({
    name:   nameSchema.optional(),
    avatar: z.string().url('Avatar URL không hợp lệ').nullable().optional(),
    contact: z
      .object({
        phone: z
          .string()
          .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Số điện thoại không hợp lệ')
          .nullable()
          .optional(),
      })
      .optional(),
    location: z
      .object({
        city:     z.string().max(60).trim().nullable().optional(),
        district: z.string().max(60).trim().nullable().optional(),
      })
      .optional(),
    ngoProfile: z
      .object({
        website:     z.string().url().nullable().optional().or(z.literal('')),
        description: z.string().max(500).trim().nullable().optional(),
      })
      .optional(),
  })
  .strict(); // reject unknown keys so privileged fields can't sneak in

module.exports = {
  registerMemberSchema,
  registerNgoSchema,
  registerIndividualSchema,
  loginSchema,
  updateProfileSchema,
};
