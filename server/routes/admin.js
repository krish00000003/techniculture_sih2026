const router = require('express').Router();
const authJWT = require('../middleware/authJWT');
const roleGuard = require('../middleware/roleGuard');
const admin = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(authJWT, roleGuard('admin'));

// Dashboard stats
router.get('/stats', admin.getStats);

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

// S19 — Settings
router.get('/settings', admin.getSettings);
router.put('/settings', admin.updateSettings);

module.exports = router;
