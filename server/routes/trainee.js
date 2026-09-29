const router = require('express').Router();
const authJWT = require('../middleware/authJWT');
const roleGuard = require('../middleware/roleGuard');
const trainee = require('../controllers/traineeController');

// All trainee routes require authentication
router.use(authJWT);

// ── Job Portal & Suggestions ──
router.get('/jobs', roleGuard('trainee', 'admin'), trainee.getJobs);
router.post('/jobs/:jobId/interest', roleGuard('trainee', 'admin'), trainee.toggleJobInterest);
router.post('/jobs/report-hired', roleGuard('trainee', 'admin'), trainee.reportHired);
router.put('/job-pool-opt-in', roleGuard('trainee', 'admin'), trainee.toggleJobPool);

// ── Me / Personal Dashboard ──
router.get('/me', roleGuard('trainee', 'admin'), trainee.getMeDashboard);
router.put('/me', roleGuard('trainee', 'admin'), trainee.updateProfile);
router.post('/me/consent/toggle', roleGuard('trainee', 'admin'), trainee.toggleConsent);
router.post('/me/payout-method', roleGuard('trainee', 'admin'), trainee.updatePayoutMethod);

module.exports = router;
