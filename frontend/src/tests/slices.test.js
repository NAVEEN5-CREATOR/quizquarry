import { describe, it, expect } from 'vitest';
import authReducer, { logout, clearError } from '../store/slices/authSlice';
import attemptReducer, {
  selectOption,
  toggleFlagQuestion,
  setCurrentQuestionIndex,
  clearActiveAttempt,
} from '../store/slices/attemptSlice';
import questionBankReducer, {
  setCurrentBank,
  clearBankStatus,
} from '../store/slices/questionBankSlice';

describe('Redux Slices Unit Tests', () => {
  describe('authSlice', () => {
    it('should handle initial state', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle logout action and clear authentication', () => {
      const loggedInState = {
        user: { id: 1, email: 'test@quizquarry.com', role: 'INSTRUCTOR' },
        token: 'sample-jwt-token',
        role: 'INSTRUCTOR',
        isAuthenticated: true,
        loading: false,
        error: null,
      };

      const nextState = authReducer(loggedInState, logout());
      expect(nextState.isAuthenticated).toBe(false);
      expect(nextState.user).toBe(null);
      expect(nextState.token).toBe(null);
      expect(nextState.role).toBe(null);
    });

    it('should clear error on clearError action', () => {
      const errorState = {
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        loading: false,
        error: 'Invalid credentials',
      };

      const nextState = authReducer(errorState, clearError());
      expect(nextState.error).toBe(null);
    });
  });

  describe('attemptSlice', () => {
    it('should record answer selection for questions', () => {
      const initialState = {
        activeAttempt: { id: 1, quizTitle: 'Java Test' },
        currentQuestionIndex: 0,
        selectedAnswers: {},
        flaggedQuestions: {},
        submittedResult: null,
      };

      const nextState = attemptReducer(
        initialState,
        selectOption({ questionId: 101, option: 'ArrayList' })
      );

      expect(nextState.selectedAnswers[101]).toBe('ArrayList');
    });

    it('should toggle flag for review on questions', () => {
      const initialState = {
        activeAttempt: { id: 1 },
        currentQuestionIndex: 0,
        selectedAnswers: {},
        flaggedQuestions: {},
      };

      // Flag question 42
      let state = attemptReducer(initialState, toggleFlagQuestion(42));
      expect(state.flaggedQuestions[42]).toBe(true);

      // Unflag question 42
      state = attemptReducer(state, toggleFlagQuestion(42));
      expect(state.flaggedQuestions[42]).toBe(false);
    });

    it('should update current question index for navigation', () => {
      const initialState = {
        currentQuestionIndex: 0,
        selectedAnswers: {},
        flaggedQuestions: {},
      };

      const nextState = attemptReducer(initialState, setCurrentQuestionIndex(3));
      expect(nextState.currentQuestionIndex).toBe(3);
    });

    it('should reset attempt state on clearActiveAttempt', () => {
      const activeState = {
        activeAttempt: { id: 5 },
        currentQuestionIndex: 2,
        selectedAnswers: { 1: 'A', 2: 'B' },
        flaggedQuestions: { 1: true },
        error: null,
      };

      const nextState = attemptReducer(activeState, clearActiveAttempt());
      expect(nextState.activeAttempt).toBe(null);
      expect(nextState.currentQuestionIndex).toBe(0);
      expect(Object.keys(nextState.selectedAnswers).length).toBe(0);
      expect(Object.keys(nextState.flaggedQuestions).length).toBe(0);
    });
  });

  describe('questionBankSlice', () => {
    it('should set currentBank and clear bank status', () => {
      const initialState = {
        banks: [],
        currentBank: null,
        loading: false,
        error: 'Some error',
        successMessage: 'Old message',
      };

      let state = questionBankReducer(
        initialState,
        setCurrentBank({ id: 1, title: 'Spring Boot Bank' })
      );
      expect(state.currentBank.title).toBe('Spring Boot Bank');

      state = questionBankReducer(state, clearBankStatus());
      expect(state.error).toBe(null);
      expect(state.successMessage).toBe(null);
    });
  });
});
