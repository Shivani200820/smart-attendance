import axiosInstance from './axiosInstance';

export const authService = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
  changePassword: async (data) => {
    const response = await axiosInstance.post('/auth/change-password', data);
    return response.data;
  },
};