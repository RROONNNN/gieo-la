'use strict';

const { z } = require('zod');

const leaderboardQuerySchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(2100)
    .optional(),
  week: z.coerce
    .number()
    .int()
    .min(1)
    .max(53)
    .optional(),
});

module.exports = { leaderboardQuerySchema };
