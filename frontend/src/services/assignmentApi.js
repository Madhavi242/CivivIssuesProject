import api from './api';

export const assignmentApi = {
  getRecommendations: async (issueId) => {
    const response = await api.get(`/assignments/recommend/${issueId}`);
    return response.data;
  },

  assignWorker: async (data) => {
    const response = await api.post('/assignments', data);
    return response.data;
  },

  getMyAssignments: async () => {
    const response = await api.get('/assignments');
    return response.data;
  },
};
