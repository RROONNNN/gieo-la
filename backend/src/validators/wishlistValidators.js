'use strict';

const { z } = require('zod');
const { POST_CATEGORY_VALUES } = require('../constants/postEnums');

const createWishlistSchema = z.object({
  title: z
    .string()
    .min(3, 'Tiêu đề phải có ít nhất 3 ký tự')
    .max(200, 'Tiêu đề tối đa 200 ký tự')
    .trim(),
  category: z.enum(POST_CATEGORY_VALUES, {
    errorMap: () => ({ message: 'Danh mục không hợp lệ' }),
  }),
  quantity: z.coerce
    .number()
    .int('Số lượng phải là số nguyên')
    .min(1, 'Số lượng tối thiểu là 1'),
  images: z
    .array(z.string().url('URL ảnh không hợp lệ'))
    .max(5, 'Tối đa 5 ảnh')
    .optional()
    .default([]),
  description: z.string().max(2000).trim().optional(),
});

const listWishlistQuerySchema = z.object({
  category: z.enum(POST_CATEGORY_VALUES).optional(),
  status: z.enum(['open', 'fulfilled']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

module.exports = { createWishlistSchema, listWishlistQuerySchema };
