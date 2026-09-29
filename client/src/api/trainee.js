import api from './axios';

const traineeApi = {
  // Get matched jobs, hiring companies, and hiring personnel
  getJobs: () => api.get('/trainee/jobs'),

  // Toggle interest in a job
  toggleJobInterest: (jobId) => api.post(`/trainee/jobs/${jobId}/interest`),

  // Report employment ("I got hired")
  reportHired: (data) => api.post('/trainee/jobs/report-hired', data),

  // Toggle talent pool opt-in
  toggleJobPool: (optIn) => api.put('/trainee/job-pool-opt-in', { optIn }),

  // Get trainee personal dashboard data
  getMeDashboard: () => api.get('/trainee/me'),

  // Update profile
  updateProfile: (data) => api.put('/trainee/me', data),

  // Toggle consent (grant / revoke)
  toggleConsent: (consentId, status) => api.post('/trainee/me/consent/toggle', { consentId, status }),

  // Update payout method (UPI ID or mobile number)
  updatePayoutMethod: (upiId) => api.post('/trainee/me/payout-method', { upiId }),
};

export default traineeApi;
