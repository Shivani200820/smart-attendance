import api from './api';

// ==========================================
// Analytics
// ==========================================
export const getAdminDashboardAnalytics = async () => {
  const response = await api.get('/admin/analytics/dashboard');
  return response.data;
};

// ==========================================
// Students
// ==========================================
export const getStudents = async (params = {}) => {
  const response = await api.get('/admin/students', { params });
  return response.data;
};

export const createStudent = async (studentData) => {
  const response = await api.post('/admin/students', studentData);
  return response.data;
};

// ==========================================
// Teachers
// ==========================================
export const getTeachers = async () => {
  const response = await api.get('/admin/teachers');
  return response.data;
};

export const createTeacher = async (data) => {
  const response = await api.post('/admin/teachers', data);
  return response.data;
};

export const updateTeacher = async (teacherId, data) => {
  const response = await api.put(`/admin/teachers/${teacherId}`, data);
  return response.data;
};

export const deleteTeacher = async (teacherId) => {
  const response = await api.delete(`/admin/teachers/${teacherId}`);
  return response.data;
};

export const toggleTeacherStatus = async (teacherId, isActive) => {
  const response = await api.patch(
    `/admin/teachers/${teacherId}/status`,
    { is_active: isActive }
  );
  return response.data;
};

// ==========================================
// Departments
// ==========================================
export const getDepartments = async () => {
  const response = await api.get('/admin/departments');
  return response.data;
};

export const createDepartment = async (data) => {
  const response = await api.post('/admin/departments', data);
  return response.data;
};

export const updateDepartment = async (departmentId, data) => {
  const response = await api.patch(`/admin/departments/${departmentId}`, data);
  return response.data;
};

export const deleteDepartment = async (departmentId) => {
  const response = await api.delete(`/admin/departments/${departmentId}`);
  return response.data;
};

// ==========================================
// Classes
// ==========================================
export const getClasses = async () => {
  const response = await api.get('/admin/classes');
  return response.data;
};

export const createClass = async (data) => {
  const response = await api.post('/admin/classes', data);
  return response.data;
};

export const updateClass = async (classId, data) => {
  const response = await api.put(`/admin/classes/${classId}`, data);
  return response.data;
};

export const deleteClass = async (classId) => {
  const response = await api.delete(`/admin/classes/${classId}`);
  return response.data;
};

// ==========================================
// Subjects
// ==========================================
export const getSubjects = async () => {
  const response = await api.get('/admin/subjects');
  return response.data;
};

export const createSubject = async (data) => {
  const response = await api.post('/admin/subjects', data);
  return response.data;
};

export const updateSubject = async (subjectId, data) => {
  const response = await api.put(`/admin/subjects/${subjectId}`, data);
  return response.data;
};

export const deleteSubject = async (subjectId) => {
  const response = await api.delete(`/admin/subjects/${subjectId}`);
  return response.data;
};

// ==========================================
// Timetable
// ==========================================
export const getTimetables = async () => {
  const response = await api.get('/admin/timetable');
  return response.data;
};

export const createTimetable = async (data) => {
  const response = await api.post('/admin/timetable', data);
  return response.data;
};

export const updateTimetable = async (timetableId, data) => {
  const response = await api.put(`/admin/timetable/${timetableId}`, data);
  return response.data;
};

export const deleteTimetable = async (timetableId) => {
  const response = await api.delete(`/admin/timetable/${timetableId}`);
  return response.data;
};