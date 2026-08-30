import api from './api';

// Teacher: Create Session
export const createAttendanceSession = async (timetableId) => {
  const response = await api.post('/attendance/sessions', { timetable_id: timetableId });
  return response.data; // AttendanceSessionResponse
};

// Get QR Data for Session
export const getQRData = async (sessionId) => {
  const response = await api.get(`/attendance/qr/sessions/${sessionId}/qr`);
  return response.data;
};

// Get Live Session Stats
export const getSessionStats = async (sessionId) => {
  const response = await api.get(`/attendance/sessions/${sessionId}/stats`);
  return response.data;
};

// Close Session
export const closeAttendanceSession = async (sessionId) => {
  const response = await api.post(`/attendance/sessions/${sessionId}/close`);
  return response.data;
};

// Student: Mark Attendance
export const markAttendance = async (sessionToken) => {
  const response = await api.post('/attendance/mark', { session_token: sessionToken });
  return response.data; // AttendanceMarkResponse
};

// Teacher: Get Today's Classes
export const getTodayClasses = async () => {
  const response = await api.get('/teacher/today-classes');
  return response.data; // Array of TodayClassResponse
};

export const correctAttendance = async (attendanceId, data) => {
  const response = await api.patch(`/attendance/${attendanceId}`, data);
  return response.data;
};

export const getStudentAttendanceHistory = async (limit = 50, offset = 0) => {
  const response = await api.get('/student/attendance', { params: { limit, offset } });
  return response.data;
};