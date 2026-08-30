import api from './api';

export const getDailyReport = async (reportDate) => {
  const response = await api.get('/reports/daily', { params: { report_date: reportDate } });
  return response.data;
};

export const getMonthlyReport = async (year, month) => {
  const response = await api.get('/reports/monthly', { params: { year, month } });
  return response.data;
};

export const getLowAttendanceReport = async (params = {}) => {
  const response = await api.get('/reports/low-attendance', { params });
  return response.data;
};