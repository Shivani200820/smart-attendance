import axiosInstance from './axiosInstance';

export const classService = {
  getClasses: async () => {
    const response = await axiosInstance.get('/admin/classes');
    return response.data;
  },
  createClass: async (data) => {
    const response = await axiosInstance.post('/admin/classes', data);
    return response.data;
  },
  updateClass: async (id, data) => {
    const response = await axiosInstance.put(`/admin/classes/${id}`, data);
    return response.data;
  },
  deleteClass: async (id) => {
    const response = await axiosInstance.delete(`/admin/classes/${id}`);
    return response.data;
  },
};