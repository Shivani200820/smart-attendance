import api from './api';

export const getStudentDashboard = async () => {
  const response = await api.get('/student/dashboard');
  return response.data; // StudentDashboardResponse
};

export const getAttendancePrediction = async () => {
  const response = await api.get('/student/attendance/prediction');
  return response.data; // AttendancePredictionResponse
};

export const getAttendanceRecovery = async () => {
  const response = await api.get('/student/attendance/recovery');
  return response.data; // AttendanceRecoveryResponse
};