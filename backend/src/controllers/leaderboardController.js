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
 * Returns the ISO week number and ISO year for a given UTC Date.
 * ISO week year may differ from calendar year (e.g. 31 Dec 2023 → week 1 of 2024).
 */
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7; // 1=Mon ... 7=Sun
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // move to Thursday of the week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return {
    isoYear: d.getUTCFullYear(),
    isoWeek: Math.ceil((((d - yearStart) / 86400000) + 1) / 7),
  };
}

/**
 * Returns the UTC start (Monday 00:00:00.000) and end (Sunday 23:59:59.999)
 * for the given ISO year + week number.
 */
function getISOWeekRange(year, week) {
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7; // 1=Mon ... 7=Sun
  // Monday of week 1
  const startOfWeek1 = new Date(Date.UTC(year, 0, 4 - dayOfWeek + 1));
  // Monday of the requested week
  const startOfWeek = new Date(startOfWeek1);
  startOfWeek.setUTCDate(startOfWeek1.getUTCDate() + (week - 1) * 7);
  // Sunday of the requested week
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);
  return { startOfWeek, endOfWeek };
}

/**
 * GET /api/v1/leaderboard
 * Returns top 10 donors for the given ISO week/year (defaults to current UTC week).
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
  const { isoYear: currentYear, isoWeek: currentWeek } = getISOWeek(now);

  const year = parsed.data.year ?? currentYear;
  const week = parsed.data.week ?? currentWeek;

  const { startOfWeek, endOfWeek } = getISOWeekRange(year, week);

  const entries = await Post.aggregate([
    {
      $match: {
        status: POST_STATUSES.COMPLETED,
        completedAt: { $gte: startOfWeek, $lte: endOfWeek },
      },
    },
    {
      $group: {
        _id: '$author',
        completedThisWeek: { $sum: 1 },
      },
    },
    { $sort: { completedThisWeek: -1 } },
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
      $unwind: { path: '$userDocs', preserveNullAndEmptyArrays: false },
    },
    {
      $project: {
        _id: 0,
        completedThisWeek: 1,
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
    data: { year, week, entries: result },
  });
};

module.exports = { getLeaderboard };
