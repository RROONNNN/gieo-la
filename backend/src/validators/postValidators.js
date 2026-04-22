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
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

module.exports = {
  createPostSchema,
  updatePostSchema,
  updatePostStatusSchema,
  listPostsQuerySchema,
};
