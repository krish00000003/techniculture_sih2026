const router = require('express').Router();
const authJWT = require('../middleware/authJWT');
const roleGuard = require('../middleware/roleGuard');
const survey = require('../controllers/surveyController');

// Trainee submits survey
router.post('/submit', authJWT, roleGuard('trainee', 'admin'), survey.submitSurvey);

module.exports = router;
