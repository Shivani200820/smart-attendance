import axiosInstance from './axiosInstance';

export const studentService = {
  // Get all students (with optional search)
  getStudents: async (params = {}) => {
    const response = await axiosInstance.get('/admin/students', { params });
    return response.data;
  },

  // Get a single student by ID
  getStudent: async (studentId) => {
    const response = await axiosInstance.get(`/admin/students/${studentId}`);
    return response.data;
  },

  // Create a new student
  createStudent: async (studentData) => {
    const response = await axiosInstance.post('/admin/students', studentData);
    return response.data;
  },

  // Update an existing student
  updateStudent: async (studentId, studentData) => {
    const response = await axiosInstance.put(`/admin/students/${studentId}`, studentData);
    return response.data;
  },

  // Activate/Deactivate a student
  updateStudentStatus: async (studentId, isActive) => {
    // Note: Adjust endpoint if your backend uses a specific status endpoint
    // For now, we'll use a PATCH request to update the status
    const response = await axiosInstance.patch(`/admin/students/${studentId}`, { is_active: isActive });
    return response.data;
  },
    // Student Dashboard APIs
  getStudentDashboard: async () => {
    const response = await axiosInstance.get('/student/dashboard');
    return response.data;
  },

  getSubjectAttendance: async () => {
    const response = await axiosInstance.get('/student/attendance/subjects');
    return response.data;
  },
  // src/services/studentService.js (Add these methods)
  getAttendancePrediction: async () => {
    const response = await axiosInstance.get('/student/attendance/prediction');
    return response.data;
  },

  getAttendanceRecovery: async () => {
    const response = await axiosInstance.get('/student/attendance/recovery');
    return response.data;
  },
};