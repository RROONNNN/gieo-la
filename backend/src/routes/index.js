'use strict';

const { Router } = require('express');

const router = Router();

// Root API probe — future domain routers mount here
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Gieo La API v1' });
});

module.exports = router;
