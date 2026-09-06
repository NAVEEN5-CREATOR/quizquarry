import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bankApi } from '../../api/bankApi';

export const fetchBanks = createAsyncThunk(
  'questionBank/fetchBanks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bankApi.getAllBanks();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch question banks');
    }
  }
);

export const createBank = createAsyncThunk(
  'questionBank/createBank',
  async (bankData, { rejectWithValue }) => {
    try {
      const response = await bankApi.createBank(bankData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create question bank');
    }
  }
);

export const updateBank = createAsyncThunk(
  'questionBank/updateBank',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await bankApi.updateBank(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update question bank');
    }
  }
);

export const deleteBank = createAsyncThunk(
  'questionBank/deleteBank',
  async (id, { rejectWithValue }) => {
    try {
      await bankApi.deleteBank(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete question bank');
    }
  }
);

const questionBankSlice = createSlice({
  name: 'questionBank',
  initialState: {
    banks: [],
    currentBank: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setCurrentBank: (state, action) => {
      state.currentBank = action.payload;
    },
    clearBankStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanks.fulfilled, (state, action) => {
        state.loading = false;
        state.banks = action.payload;
      })
      .addCase(fetchBanks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBank.fulfilled, (state, action) => {
        state.banks.unshift(action.payload);
        state.successMessage = 'Question bank created successfully!';
      })
      .addCase(updateBank.fulfilled, (state, action) => {
        const index = state.banks.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.banks[index] = action.payload;
        }
        state.successMessage = 'Question bank updated successfully!';
      })
      .addCase(deleteBank.fulfilled, (state, action) => {
        state.banks = state.banks.filter((b) => b.id !== action.payload);
        state.successMessage = 'Question bank deleted successfully!';
      });
  },
});

export const { setCurrentBank, clearBankStatus } = questionBankSlice.actions;
export default questionBankSlice.reducer;
