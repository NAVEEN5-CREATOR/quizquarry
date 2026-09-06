import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import questionBankReducer from './slices/questionBankSlice';
import questionReducer from './slices/questionSlice';
import quizReducer from './slices/quizSlice';
import attemptReducer from './slices/attemptSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    questionBank: questionBankReducer,
    question: questionReducer,
    quiz: quizReducer,
    attempt: attemptReducer,
  },
});

export default store;
