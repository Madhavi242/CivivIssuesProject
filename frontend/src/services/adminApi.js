import api from './api';

export const adminApi = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getAuditLogs: async () => {
    const response = await api.get('/admin/audit-logs');
    return response.data;
  },
};
