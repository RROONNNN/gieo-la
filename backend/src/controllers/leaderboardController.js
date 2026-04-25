'use strict';

const Post = require('../models/Post');
const { leaderboardQuerySchema } = require('../validators/leaderboardValidators');
const { POST_STATUSES } = require('../constants/postEnums');

const BADGE_THRESHOLDS = [
  { maxRank: 1, badge: 'gold', label: 'Đại sứ Lá Lành' },
  { maxRank: 5, badge: 'silver', label: 'Lá Lành Tích Cực' },
  { maxRank: 10, badge: 'bronze', label: 'Mầm Lành Năng Nổ' },
];

function getBadgeForRank(rank) {
  for (const threshold of BADGE_THRESHOLDS) {
    if (rank <= threshold.maxRank) {
      return { badge: threshold.badge, label: threshold.label };
    }
  }
  return { badge: 'none', label: '' };
}

/**
 * GET /api/v1/leaderboard
 * Returns top 10 donors for the given month/year (defaults to current UTC month).
 */
const getLeaderboard = async (req, res) => {
  const parsed = leaderboardQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Tham số truy vấn không hợp lệ',
      errors: parsed.error.errors,
    });
  }

  const now = new Date();
  const year = parsed.data.year ?? now.getUTCFullYear();
  const month = parsed.data.month ?? now.getUTCMonth() + 1;

  const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const entries = await Post.aggregate([
    {
      $match: {
        status: POST_STATUSES.COMPLETED,
        completedAt: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: '$author',
        completedThisMonth: { $sum: 1 },
      },
    },
    { $sort: { completedThisMonth: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDocs',
      },
    },
    {
      $unwind: { path: '$userDocs', preserveNullAndEmpty: false },
    },
    {
      $project: {
        _id: 0,
        completedThisMonth: 1,
        user: {
          _id: '$userDocs._id',
          name: '$userDocs.name',
          avatar: '$userDocs.avatar',
          role: '$userDocs.role',
          badge: '$userDocs.badge',
        },
      },
    },
  ]);

  const result = entries.map((entry, i) => {
    const rank = i + 1;
    const { badge, label: badgeLabel } = getBadgeForRank(rank);
    return { rank, ...entry, badge, badgeLabel };
  });

  return res.json({
    success: true,
    data: { year, month, entries: result },
  });
};

module.exports = { getLeaderboard };
