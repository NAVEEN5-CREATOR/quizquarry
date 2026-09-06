import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attemptApi } from '../../api/attemptApi';

export const startAttempt = createAsyncThunk(
  'attempt/startAttempt',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await attemptApi.startAttempt(quizId);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to start quiz attempt');
    }
  }
);

export const submitAttempt = createAsyncThunk(
  'attempt/submitAttempt',
  async ({ attemptId, answers }, { rejectWithValue }) => {
    try {
      const response = await attemptApi.submitAttempt(attemptId, answers);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to submit quiz attempt');
    }
  }
);

export const fetchAttempt = createAsyncThunk(
  'attempt/fetchAttempt',
  async (attemptId, { rejectWithValue }) => {
    try {
      const response = await attemptApi.getAttempt(attemptId);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch attempt details');
    }
  }
);

export const fetchAttemptResult = createAsyncThunk(
  'attempt/fetchAttemptResult',
  async (attemptId, { rejectWithValue }) => {
    try {
      const response = await attemptApi.getAttemptResult(attemptId);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch attempt result');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'attempt/fetchLeaderboard',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await attemptApi.getLeaderboard(quizId);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch leaderboard');
    }
  }
);

const attemptSlice = createSlice({
  name: 'attempt',
  initialState: {
    activeAttempt: null, // metadata, questions
    currentQuestionIndex: 0,
    selectedAnswers: {}, // questionId -> option string
    flaggedQuestions: {}, // questionId -> boolean
    submittedResult: null,
    leaderboard: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {
    selectOption: (state, action) => {
      const { questionId, option } = action.payload;
      state.selectedAnswers[questionId] = option;
    },
    toggleFlagQuestion: (state, action) => {
      const questionId = action.payload;
      state.flaggedQuestions[questionId] = !state.flaggedQuestions[questionId];
    },
    setCurrentQuestionIndex: (state, action) => {
      state.currentQuestionIndex = action.payload;
    },
    clearActiveAttempt: (state) => {
      state.activeAttempt = null;
      state.currentQuestionIndex = 0;
      state.selectedAnswers = {};
      state.flaggedQuestions = {};
      state.error = null;
    },
    clearAttemptStatus: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start Attempt
      .addCase(startAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.activeAttempt = action.payload;
        state.currentQuestionIndex = 0;
        state.selectedAnswers = {};
        state.flaggedQuestions = {};
      })
      .addCase(startAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit Attempt
      .addCase(submitAttempt.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitAttempt.fulfilled, (state, action) => {
        state.submitting = false;
        state.submittedResult = action.payload;
        state.activeAttempt = null;
      })
      .addCase(submitAttempt.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      // Fetch Result
      .addCase(fetchAttemptResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttemptResult.fulfilled, (state, action) => {
        state.loading = false;
        state.submittedResult = action.payload;
      })
      .addCase(fetchAttemptResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Leaderboard
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload;
      });
  },
});

export const {
  selectOption,
  toggleFlagQuestion,
  setCurrentQuestionIndex,
  clearActiveAttempt,
  clearAttemptStatus,
} = attemptSlice.actions;
export default attemptSlice.reducer;
