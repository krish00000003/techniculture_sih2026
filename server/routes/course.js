const router = require('express').Router();
const authJWT = require('../middleware/authJWT');
const roleGuard = require('../middleware/roleGuard');
const course = require('../controllers/courseController');

// All course routes require authentication
router.use(authJWT);

// List courses — employer, provider, trainee, admin
router.get('/', roleGuard('employer', 'provider', 'trainee', 'admin'), course.getCourses);

// Trainee: pursue / enroll in a course
router.post('/:courseId/pursue', roleGuard('trainee'), course.pursueCourse);

// Trainee: get my courses / enrollments
router.get('/my/enrollments', roleGuard('trainee'), course.getMyEnrollments);

// Course completions — list trainees who completed a specific course
router.get(
  '/:courseId/completions',
  roleGuard('employer', 'provider', 'admin'),
  course.getCourseCompletions
);

// Trainee public profile (Digital CV) — accessible by employer / provider / admin / trainee
router.get(
  '/trainee/:traineeId/profile',
  roleGuard('employer', 'provider', 'admin', 'trainee'),
  course.getTraineePublicProfile
);

module.exports = router;
