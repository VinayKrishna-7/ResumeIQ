const express = require('express');
const router = express.Router();
const { improveBullet, improveSummary } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { analysisLimiter } = require('../middleware/rateLimit');

router.use(protect);

router.post('/improve-bullet', analysisLimiter, improveBullet);
router.post('/improve-summary', analysisLimiter, improveSummary);

module.exports = router;
