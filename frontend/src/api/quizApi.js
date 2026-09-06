import axiosClient from './axiosClient';

export const quizApi = {
  getAllQuizzes: () => axiosClient.get('/quizzes'),
  getQuizById: (id) => axiosClient.get(`/quizzes/${id}`),
  createQuiz: (quizData) => axiosClient.post('/quizzes', quizData),
  updateQuiz: (id, quizData) => axiosClient.put(`/quizzes/${id}`, quizData),
  publishQuiz: (id) => axiosClient.patch(`/quizzes/${id}/publish`),
  deleteQuiz: (id) => axiosClient.delete(`/quizzes/${id}`),
};
