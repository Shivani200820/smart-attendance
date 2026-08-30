import axiosInstance from './axiosInstance';

export const departmentService = {
  // Get all departments
  getDepartments: async () => {
    const response = await axiosInstance.get('/admin/departments');
    return response.data;
  },

  // Create a new department
  createDepartment: async (data) => {
    const response = await axiosInstance.post('/admin/departments', data);
    return response.data;
  },

  // Update department details
  updateDepartment: async (id, data) => {
    const response = await axiosInstance.patch(`/admin/departments/${id}`, data);
    return response.data;
  },

  // Activate/Deactivate department
  updateDepartmentStatus: async (id, isActive) => {
    const response = await axiosInstance.patch(`/admin/departments/${id}/status?is_active=${isActive}`);
    return response.data;
  },
};