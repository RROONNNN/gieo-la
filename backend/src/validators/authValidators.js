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

const nameSchema = z
  .string()
  .min(2, 'Tên phải có ít nhất 2 ký tự')
  .max(60, 'Tên không được vượt quá 60 ký tự')
  .trim();

// ── Register: Member ──────────────────────────────────────────────────────────
const registerMemberSchema = z.object({
  name:     nameSchema,
  email:    emailSchema,
  password: passwordSchema,
});

// ── Register: NGO ─────────────────────────────────────────────────────────────
const registerNgoSchema = z.object({
  name:             nameSchema,
  email:            emailSchema,
  password:         passwordSchema,
  organizationName: z
    .string()
    .min(2, 'Tên tổ chức phải có ít nhất 2 ký tự')
    .max(120, 'Tên tổ chức không được vượt quá 120 ký tự')
    .trim(),
  website: z.string().url('Website không hợp lệ').optional().or(z.literal('')),
  description: z.string().max(500).trim().optional(),
});

// ── Register: Individual ──────────────────────────────────────────────────────
const registerIndividualSchema = z.object({
  name:     nameSchema,
  email:    emailSchema,
  password: passwordSchema,
});

// ── Login ─────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    emailSchema,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

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
        organizationName: z.string().max(120).trim().nullable().optional(),
        website:          z.string().url().nullable().optional().or(z.literal('')),
        description:      z.string().max(500).trim().nullable().optional(),
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
