'use strict';

const { z } = require('zod');
const { NEWS_CATEGORY_VALUES, NEWS_STATUS_VALUES } = require('../constants/newsEnums');

const createNewsSchema = z.object({
  title: z
    .string()
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(200, 'Tiêu đề tối đa 200 ký tự')
    .trim(),
  thumbnail: z.string().url('URL ảnh bìa không hợp lệ'),
  content: z.string().min(1, 'Nội dung không được để trống'),
  category: z.enum(NEWS_CATEGORY_VALUES, {
    errorMap: () => ({ message: 'Danh mục không hợp lệ' }),
  }),
  status: z.enum(NEWS_STATUS_VALUES).optional().default('draft'),
  isPinned: z.boolean().optional().default(false),
});

const updateNewsSchema = z.object({
  title: z
    .string()
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(200, 'Tiêu đề tối đa 200 ký tự')
    .trim()
    .optional(),
  thumbnail: z.string().url('URL ảnh bìa không hợp lệ').optional(),
  content: z.string().min(1, 'Nội dung không được để trống').optional(),
  category: z
    .enum(NEWS_CATEGORY_VALUES, { errorMap: () => ({ message: 'Danh mục không hợp lệ' }) })
    .optional(),
  status: z.enum(NEWS_STATUS_VALUES).optional(),
  isPinned: z.boolean().optional(),
});

const listNewsQuerySchema = z.object({
  category: z.enum(NEWS_CATEGORY_VALUES).optional(),
  status: z.enum(NEWS_STATUS_VALUES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

module.exports = { createNewsSchema, updateNewsSchema, listNewsQuerySchema };
