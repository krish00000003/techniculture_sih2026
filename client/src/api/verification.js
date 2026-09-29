import api from './axios';

const verificationApi = {
  // Public verification check by token (no login required)
  getPublicVerification: (token) => api.get(`/verifications/public/${token}`),

  // Public verification respond (verify or dispute)
  respondPublicVerification: (token, data) => api.post(`/verifications/public/${token}/respond`, data),

  // Employer & Admin verification queue
  getVerificationsQueue: () => api.get('/verifications/queue'),

  // Resend reminder to employer
  resendReminder: (id) => api.post(`/verifications/${id}/remind`),
};

export default verificationApi;
