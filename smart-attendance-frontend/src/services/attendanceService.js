import axiosInstance from './axiosInstance';

export const attendanceService = {
  // Create Attendance Session (Start Attendance)
  createSession: async (timetableId) => {
    const response = await axiosInstance.post('/attendance/sessions', {
      timetable_id: timetableId,
    });
    return response.data;
  },

  // Close Attendance Session
  closeSession: async (sessionId) => {
    const response = await axiosInstance.post(`/attendance/sessions/${sessionId}/close`);
    return response.data;
  },

  // Get Session Live Stats
  getSessionStats: async (sessionId) => {
    const response = await axiosInstance.get(`/attendance/sessions/${sessionId}/stats`);
    return response.data;
  },

  // Get QR Data for a Session
  getQRData: async (sessionId) => {
    const response = await axiosInstance.get(`/attendance/qr/sessions/${sessionId}/qr`);
    return response.data;
  },
   // Mark Attendance using QR Token
  markAttendance: async (sessionToken) => {
    const response = await axiosInstance.post('/attendance/mark', {
      session_token: sessionToken,
    });
    return response.data;
  },
    // Expected endpoint: GET /api/v1/attendance/sessions/{session_id}/students
  getPresentStudents: async (sessionId) => {
    const response = await axiosInstance.get(`/attendance/sessions/${sessionId}/students`);
    return response.data;
  },
  // src/services/attendanceService.js (Add this method)
  getLowAttendance: async (params = {}) => {
    const response = await axiosInstance.get('/attendance/low-attendance', { params });
    return response.data;
  },
    correctAttendance: async (attendanceId, data) => {
    const response = await axiosInstance.patch(`/attendance/${attendanceId}`, data);
    return response.data;
  },
};