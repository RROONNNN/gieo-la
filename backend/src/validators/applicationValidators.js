'use strict';

const { z } = require('zod');

const applySchema = z.object({
  message: z
    .string()
    .min(10, 'Lý do muốn nhận đồ phải có ít nhất 10 ký tự')
    .max(2000, 'Lý do tối đa 2000 ký tự')
    .trim(),
});

const selectApplicantSchema = z.object({
  applicantId: z.string().min(1, 'Vui lòng chọn người nhận'),
});
module.exports = {
  applySchema,
  selectApplicantSchema,
};
