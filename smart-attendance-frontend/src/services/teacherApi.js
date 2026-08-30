import api from './api';

// ==========================================
// Teacher Dashboard
// ==========================================
export const getTeacherDashboard = async () => {
  const response = await api.get('/teacher/dashboard');
  return response.data; // TeacherDashboardResponse
};

// ==========================================
// Teacher Classes
// ==========================================
export const getTodayClasses = async () => {
  const response = await api.get('/teacher/today-classes');
  return response.data; // Array of TodayClassResponse
};

export const getTeacherClasses = async () => {
  const response = await api.get('/teacher/classes');
  return response.data; // Array of TeacherClassResponse
};

// ==========================================
// Teacher Subjects
// ==========================================
export const getTeacherSubjects = async () => {
  const response = await api.get('/teacher/subjects');
  return response.data; // Array of TeacherSubjectResponse
};

// ==========================================
// Teacher Sessions (History)
// ==========================================
export const getTeacherSessions = async (limit = 20) => {
  const response = await api.get('/teacher/sessions', { params: { limit } });
  return response.data; // Array of TeacherSessionResponse
};

// ==========================================
// Teacher Analytics
// ==========================================
export const getTeacherAnalytics = async () => {
  const response = await api.get('/teacher/analytics');
  return response.data;
};