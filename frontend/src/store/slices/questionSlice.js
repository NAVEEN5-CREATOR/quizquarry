import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { questionApi } from '../../api/questionApi';

export const fetchQuestions = createAsyncThunk(
  'question/fetchQuestions',
  async (bankId, { rejectWithValue }) => {
    try {
      const response = await questionApi.getQuestionsByBank(bankId);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch questions');
    }
  }
);

export const createQuestion = createAsyncThunk(
  'question/createQuestion',
  async (questionData, { rejectWithValue }) => {
    try {
      const response = await questionApi.createQuestion(questionData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create question');
    }
  }
);

export const updateQuestion = createAsyncThunk(
  'question/updateQuestion',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await questionApi.updateQuestion(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update question');
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  'question/deleteQuestion',
  async (id, { rejectWithValue }) => {
    try {
      await questionApi.deleteQuestion(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete question');
    }
  }
);

export const generateAiQuestions = createAsyncThunk(
  'question/generateAiQuestions',
  async (aiRequest, { rejectWithValue }) => {
    try {
      const response = await questionApi.generateAiQuestions(aiRequest);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'AI Question Generation failed');
    }
  }
);

const questionSlice = createSlice({
  name: 'question',
  initialState: {
    questions: [],
    loading: false,
    aiLoading: false,
    error: null,
    aiError: null,
    successMessage: null,
  },
  reducers: {
    clearQuestionStatus: (state) => {
      state.error = null;
      state.aiError = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.questions.unshift(action.payload);
        state.successMessage = 'Question created successfully!';
      })
      // Update
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.questions.findIndex((q) => q.id === action.payload.id);
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
        state.successMessage = 'Question updated successfully!';
      })
      // Delete
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter((q) => q.id !== action.payload);
        state.successMessage = 'Question deleted successfully!';
      })
      // AI Generate
      .addCase(generateAiQuestions.pending, (state) => {
        state.aiLoading = true;
        state.aiError = null;
      })
      .addCase(generateAiQuestions.fulfilled, (state, action) => {
        state.aiLoading = false;
        // Prepend all generated questions
        state.questions = [...action.payload, ...state.questions];
        state.successMessage = `Successfully generated and saved ${action.payload.length} questions using Gemini AI!`;
      })
      .addCase(generateAiQuestions.rejected, (state, action) => {
        state.aiLoading = false;
        state.aiError = action.payload;
      });
  },
});

export const { clearQuestionStatus } = questionSlice.actions;
export default questionSlice.reducer;
