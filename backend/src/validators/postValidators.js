'use strict';

const { z } = require('zod');
const {
  POST_CATEGORY_VALUES,
  POST_CONDITION_VALUES,
  POST_STATUS_VALUES,
} = require('../constants/postEnums');

const createPostSchema = z.object({
  title: z
    .string()
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(200, 'Tiêu đề tối đa 200 ký tự')
    .trim(),
  category: z.enum(POST_CATEGORY_VALUES, {
    errorMap: () => ({ message: 'Danh mục không hợp lệ' }),
  }),
  quantity: z.coerce
    .number()
    .int('Số lượng phải là số nguyên')
    .min(1, 'Số lượng tối thiểu là 1'),
  condition: z.enum(POST_CONDITION_VALUES, {
    errorMap: () => ({ message: 'Tình trạng không hợp lệ' }),
  }),
  conditionNote: z.string().max(500).trim().optional(),
  images: z
    .array(z.string().url('URL ảnh không hợp lệ'))
    .min(1, 'Cần ít nhất 1 ảnh')
    .max(5, 'Tối đa 5 ảnh'),
  description: z.string().max(2000).trim().optional(),
  location: z
    .object({
      city: z.string().max(60).trim().optional(),
      district: z.string().max(60).trim().optional(),
    })
    .optional(),
});

const updatePostSchema = z
  .object({
    title: z.string().min(5).max(200).trim().optional(),
    category: z
      .enum(POST_CATEGORY_VALUES, {
        errorMap: () => ({ message: 'Danh mục không hợp lệ' }),
      })
      .optional(),
    quantity: z.coerce.number().int().min(1).optional(),
    condition: z
      .enum(POST_CONDITION_VALUES, {
        errorMap: () => ({ message: 'Tình trạng không hợp lệ' }),
      })
      .optional(),
    conditionNote: z.string().max(500).trim().optional(),
    images: z.array(z.string().url()).min(1).max(5).optional(),
    description: z.string().max(2000).trim().optional(),
    location: z
      .object({
        city: z.string().max(60).trim().optional(),
        district: z.string().max(60).trim().optional(),
      })
      .optional(),
  })
  .strict();

const updatePostStatusSchema = z.object({
  status: z.enum(POST_STATUS_VALUES, {
    errorMap: () => ({ message: 'Trạng thái không hợp lệ' }),
  }),
});

const listPostsQuerySchema = z.object({
  category: z
    .enum(POST_CATEGORY_VALUES, {
      errorMap: () => ({ message: 'Danh mục không hợp lệ' }),
    })
    .optional(),
  status: z
    .enum(POST_STATUS_VALUES, {
      errorMap: () => ({ message: 'Trạng thái không hợp lệ' }),
    })
    .optional(),
  search: z.string().max(200).trim().optional(),
  mine: z.coerce.boolean().optional().default(false),
  // Admin-only: search by author name / email
  authorSearch: z.string().max(100).trim().optional(),
  // Admin-only: date range (ISO date strings, e.g. 2025-01-01)
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

const createCommentSchema = z
  .object({
    content: z.string().trim().max(500, 'Bình luận tối đa 500 ký tự').optional().default(''),
    images: z
      .array(z.string().url('URL ảnh không hợp lệ'))
      .max(3, 'Tối đa 3 ảnh')
      .optional()
      .default([]),
  })
  .refine((d) => d.content.length > 0 || d.images.length > 0, {
    message: 'Bình luận cần có nội dung hoặc ít nhất 1 ảnh',
  });

module.exports = {
  createPostSchema,
  updatePostSchema,
  updatePostStatusSchema,
  listPostsQuerySchema,
  createCommentSchema,
};
