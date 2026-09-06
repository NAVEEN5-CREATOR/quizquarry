import axiosClient from './axiosClient';

export const bankApi = {
  getAllBanks: () => axiosClient.get('/banks'),
  getBankById: (id) => axiosClient.get(`/banks/${id}`),
  createBank: (bankData) => axiosClient.post('/banks', bankData),
  updateBank: (id, bankData) => axiosClient.put(`/banks/${id}`, bankData),
  deleteBank: (id) => axiosClient.delete(`/banks/${id}`),
};
