import api from './axios';

const adminApi = {
  // Dashboard stats
  getStats: () => api.get('/admin/stats'),

  // S14 — Rankings
  getRankings: (params) => api.get('/admin/rankings', { params }),

  // S15 — Skill Gaps
  getSkillGaps: (params) => api.get('/admin/skill-gaps', { params }),

  // S16 — Alerts
  getAlerts: (params) => api.get('/admin/alerts', { params }),
  updateAlert: (id, status) => api.patch(`/admin/alerts/${id}`, { status }),

  // S17 — Attrition
  getAttrition: (params) => api.get('/admin/attrition', { params }),

  // S18 — Duplicates
  getDuplicates: () => api.get('/admin/duplicates'),
  mergeDuplicate: (id) => api.post(`/admin/duplicates/${id}/merge`),
  rejectDuplicate: (id) => api.post(`/admin/duplicates/${id}/reject`),

  // S19 — Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

export default adminApi;
