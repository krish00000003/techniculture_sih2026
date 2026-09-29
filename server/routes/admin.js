const router = require('express').Router();
const authJWT = require('../middleware/authJWT');
const roleGuard = require('../middleware/roleGuard');
const admin = require('../controllers/adminController');

// Admin, Manager, and Supervisor can access admin oversight endpoints
router.use(authJWT, roleGuard('admin', 'manager', 'supervisor'));

// Dashboard stats
router.get('/stats', admin.getStats);

// User Directory & Minute-by-Minute Data Audit
router.get('/users', admin.getUsersMinuteData);
router.get('/users/:id/details', admin.getUserDetailedMinuteData);
router.put('/users/:id/status', admin.updateUserStatus);
router.put('/users/:id/role', roleGuard('admin'), admin.updateUserRole);

// S14 — Provider Rankings
router.get('/rankings', admin.getRankings);

// S15 — Skill Gaps
router.get('/skill-gaps', admin.getSkillGaps);

// S16 — Action Center (Alerts)
router.get('/alerts', admin.getAlerts);
router.patch('/alerts/:id', admin.updateAlert);

// S17 — Attrition & Non-Placement
router.get('/attrition', admin.getAttrition);

// S18 — Duplicate Review
router.get('/duplicates', admin.getDuplicates);
router.post('/duplicates/:id/merge', admin.mergeDuplicate);
router.post('/duplicates/:id/reject', admin.rejectDuplicate);

// S19 — Settings (Super Admin only)
router.get('/settings', admin.getSettings);
router.put('/settings', roleGuard('admin'), admin.updateSettings);

module.exports = router;
