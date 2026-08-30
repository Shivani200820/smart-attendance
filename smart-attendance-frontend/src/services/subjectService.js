import axiosInstance from './axiosInstance';

export const subjectService = {
  getSubjects: async () => {
    const response = await axiosInstance.get('/admin/subjects');
    return response.data;
  },
  createSubject: async (data) => {
    const response = await axiosInstance.post('/admin/subjects', data);
    return response.data;
  },
  updateSubject: async (id, data) => {
    const response = await axiosInstance.put(`/admin/subjects/${id}`, data);
    return response.data;
  },
  deleteSubject: async (id) => {
    const response = await axiosInstance.delete(`/admin/subjects/${id}`);
    return response.data;
  },
};