'use strict';

const { Router } = require('express');
const { getLeaderboard } = require('../controllers/leaderboardController');

const router = Router();

router.get('/', getLeaderboard);

module.exports = router;
