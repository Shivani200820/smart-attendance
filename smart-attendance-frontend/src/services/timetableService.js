import axiosInstance from './axiosInstance';

export const timetableService = {
  getTimetables: async () => {
    const response = await axiosInstance.get('/admin/timetable');
    return response.data;
  },
  createTimetable: async (data) => {
    const response = await axiosInstance.post('/admin/timetable', data);
    return response.data;
  },
  updateTimetable: async (id, data) => {
    const response = await axiosInstance.put(`/admin/timetable/${id}`, data);
    return response.data;
  },
  deleteTimetable: async (id) => {
    const response = await axiosInstance.delete(`/admin/timetable/${id}`);
    return response.data;
  },
  updateTimetableStatus: async (id, isActive) => {
    const response = await axiosInstance.patch(`/admin/timetable/${id}/status?is_active=${isActive}`);
    return response.data;
  },
};