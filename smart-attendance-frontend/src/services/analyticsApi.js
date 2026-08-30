import api from './api';

export const getLowAttendance = async (params = {}) => {
  const response = await api.get('/attendance/low-attendance', { params });
  return response.data;
};

export const getClassAnalytics = async () => {
  const response = await api.get('/admin/analytics/class');
  return response.data;
};

export const getSubjectAnalytics = async () => {
  const response = await api.get('/admin/analytics/subject');
  return response.data;
};

export const getDepartmentAnalytics = async () => {
  const response = await api.get('/admin/analytics/department');
  return response.data;
};

export const getMonthlyAnalytics = async (year, month) => {
  const response = await api.get('/admin/analytics/monthly', { params: { year, month } });
  return response.data;
};