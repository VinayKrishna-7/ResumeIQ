const rateLimit = require('express-rate-limit');

// Rate limiter for expensive AI & analysis endpoints
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1024, // 1 hour window
  max: process.env.NODE_ENV === 'test' ? 1000 : 60, // 60 analyses/ai improvements per hour in dev/prod
  message: {
    success: false,
    message: 'Rate limit exceeded: Maximum 60 analyses/AI enhancements per hour. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { analysisLimiter };
