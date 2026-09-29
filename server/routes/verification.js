const router = require('express').Router();
const authJWT = require('../middleware/authJWT');
const roleGuard = require('../middleware/roleGuard');
const verification = require('../controllers/verificationController');

// ── Public One-Tap Verification (No login required - PRD B2 / S10) ──
router.get('/public/:token', verification.getPublicVerification);
router.post('/public/:token/respond', verification.respondPublicVerification);

// ── Authenticated Queue (Employer & Admin) ──
router.get('/queue', authJWT, roleGuard('employer', 'admin'), verification.getVerificationsQueue);
router.post('/:id/remind', authJWT, roleGuard('employer', 'admin'), verification.resendReminder);

module.exports = router;
