import api from './axios';

const surveyApi = {
  // Submit milestone follow-up survey
  submitSurvey: (data) => api.post('/surveys/submit', data),
};

export default surveyApi;
