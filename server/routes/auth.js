const router = require('express').Router();
const {
  googleLogin,
  requestMagicLink,
  verifyMagicLink,
  getMe,
  devLogin,
  register,
} = require('../controllers/authController');
const authJWT = require('../middleware/authJWT');
const { magicLinkLimiter, authLimiter } = require('../middleware/rateLimit');

router.post('/register', authLimiter, register);
router.post('/google', authLimiter, googleLogin);
router.post('/magic-link', magicLinkLimiter, requestMagicLink);
router.get('/magic-link/verify/:token', verifyMagicLink);
router.post('/dev-login', devLogin);
router.get('/me', authJWT, getMe);

module.exports = router;
