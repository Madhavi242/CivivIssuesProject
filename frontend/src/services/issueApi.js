import api from './api';

export const issueApi = {
  createIssue: async (formData) => {
    const response = await api.post('/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  previewIssue: async (data) => {
    const response = await api.post('/issues/preview', data);
    return response.data;
  },

  getIssues: async (params = {}) => {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  getNearbyIssues: async (params) => {
    const response = await api.get('/issues/nearby', { params });
    return response.data;
  },

  getClusters: async () => {
    const response = await api.get('/issues/clusters');
    return response.data;
  },

  getIssueById: async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  supportIssue: async (id) => {
    const response = await api.post(`/issues/${id}/support`);
    return response.data;
  },

  updateIssueStatus: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const response = await api.put(`/issues/${id}/status`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  verifyResolution: async (id, data) => {
    const response = await api.post(`/issues/${id}/verify`, data);
    return response.data;
  },

  uploadEvidence: async (id, formData) => {
    const response = await api.post(`/issues/${id}/evidence`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
