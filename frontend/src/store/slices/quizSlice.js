import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { quizApi } from '../../api/quizApi';

export const fetchQuizzes = createAsyncThunk(
  'quiz/fetchQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await quizApi.getAllQuizzes();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch quizzes');
    }
  }
);

export const createQuiz = createAsyncThunk(
  'quiz/createQuiz',
  async (quizData, { rejectWithValue }) => {
    try {
      const response = await quizApi.createQuiz(quizData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create quiz');
    }
  }
);

export const updateQuiz = createAsyncThunk(
  'quiz/updateQuiz',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await quizApi.updateQuiz(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update quiz');
    }
  }
);

export const publishQuiz = createAsyncThunk(
  'quiz/publishQuiz',
  async (id, { rejectWithValue }) => {
    try {
      const response = await quizApi.publishQuiz(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to publish quiz');
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quiz/deleteQuiz',
  async (id, { rejectWithValue }) => {
    try {
      await quizApi.deleteQuiz(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete quiz');
    }
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    quizzes: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearQuizStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.quizzes.unshift(action.payload);
        state.successMessage = 'Quiz created successfully!';
      })
      .addCase(publishQuiz.fulfilled, (state, action) => {
        const index = state.quizzes.findIndex((q) => q.id === action.payload.id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
        state.successMessage = 'Quiz published for student taking!';
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const index = state.quizzes.findIndex((q) => q.id === action.payload.id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
        state.successMessage = 'Quiz updated successfully!';
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter((q) => q.id !== action.payload);
        state.successMessage = 'Quiz deleted successfully!';
      });
  },
});

export const { clearQuizStatus } = quizSlice.actions;
export default quizSlice.reducer;
