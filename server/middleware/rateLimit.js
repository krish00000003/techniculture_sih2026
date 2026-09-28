const rateLimit = require('express-rate-limit');

/**
 * Magic-link endpoint: max 3 requests per hour per phone number (PRD rule A1).
 */
const magicLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { message: 'Too many magic link requests. Try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.phone || req.ip,
});

/**
 * General auth routes: 20 requests per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { magicLinkLimiter, authLimiter };
