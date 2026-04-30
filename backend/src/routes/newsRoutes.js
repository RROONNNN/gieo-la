'use strict';

const { Router } = require('express');
const { listNews, getNews } = require('../controllers/newsController');

const router = Router();

router.get('/', listNews);
router.get('/:id', getNews);

module.exports = router;
