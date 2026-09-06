import axiosClient from './axiosClient';

export const attemptApi = {
  startAttempt: (quizId) => axiosClient.post(`/attempts/start/${quizId}`),
  submitAttempt: (attemptId, answers) => axiosClient.post(`/attempts/${attemptId}/submit`, { answers }),
  getAttempt: (attemptId) => axiosClient.get(`/attempts/${attemptId}`),
  getAttemptResult: (attemptId) => axiosClient.get(`/attempts/results/${attemptId}`),
  getLeaderboard: (quizId) => axiosClient.get('/attempts/leaderboard', { params: quizId ? { quizId } : {} }),
  getInstructorReport: () => axiosClient.get('/attempts/instructor-report'),
  getSubmissionStats: () => axiosClient.get('/attempts/submission-stats'),
};
