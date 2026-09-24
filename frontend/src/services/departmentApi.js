import api from './api';

export const departmentApi = {
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  getDepartmentWorkers: async (deptId) => {
    const response = await api.get(`/departments/${deptId}/workers`);
    return response.data;
  },
};
