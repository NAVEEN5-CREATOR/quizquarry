import axiosClient from './axiosClient';

export const questionApi = {
  getQuestionsByBank: (bankId) => axiosClient.get(`/questions?bankId=${bankId}`),
  getQuestionById: (id) => axiosClient.get(`/questions/${id}`),
  createQuestion: (data) => axiosClient.post('/questions', data),
  updateQuestion: (id, data) => axiosClient.put(`/questions/${id}`, data),
  deleteQuestion: (id) => axiosClient.delete(`/questions/${id}`),
  generateAiQuestions: (data) => axiosClient.post('/questions/ai-generate', data),
  getExplanation: (id) => axiosClient.get(`/questions/${id}/explanation`),
};
