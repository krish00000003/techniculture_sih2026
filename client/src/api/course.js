import api from './axios';

const courseApi = {
  // List courses (employer: all, provider: own)
  getCourses: () => api.get('/courses'),

  // Trainees who completed a specific course
  getCourseCompletions: (courseId) => api.get(`/courses/${courseId}/completions`),

  // Trainee public profile (Digital CV)
  getTraineeProfile: (traineeId) => api.get(`/courses/trainee/${traineeId}/profile`),

  // Trainee: Pursue a course
  pursueCourse: (courseId) => api.post(`/courses/${courseId}/pursue`),

  // Trainee: Get enrolled courses (ongoing & completed)
  getMyEnrollments: () => api.get('/courses/my/enrollments'),
};

export default courseApi;
