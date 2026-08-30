import axiosInstance from './axiosInstance';

export const analyticsService = {
  // Get overall dashboard metrics
  getAdminDashboard: async () => {
    const response = await axiosInstance.get('/admin/analytics/dashboard');
    return response.data;
  },

  // Get class-wise analytics
  getClassAnalytics: async () => {
    const response = await axiosInstance.get('/admin/analytics/class');
    return response.data;
  },

  // Get subject-wise analytics
  getSubjectAnalytics: async () => {
    const response = await axiosInstance.get('/admin/analytics/subject');
    return response.data;
  },

  // Get department-wise analytics
  getDepartmentAnalytics: async () => {
    const response = await axiosInstance.get('/admin/analytics/department');
    return response.data;
  },

  // Get monthly analytics (requires year and month)
  getMonthlyAnalytics: async (year, month) => {
    const response = await axiosInstance.get('/admin/analytics/monthly', {
      params: { year, month },
    });
    return response.data;
  },
};