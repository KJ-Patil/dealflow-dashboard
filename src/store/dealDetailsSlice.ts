import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Deal } from '@/src/types';
import { getDealById } from '@/src/services/dealService';

interface DealDetailsState {
  deal: Deal | null;
  loading: boolean;
  error: string | null;
}

const initialState: DealDetailsState = {
  deal: null,
  loading: false,
  error: null,
};

export const fetchDealById = createAsyncThunk<Deal | null, string>(
  'dealDetails/fetch',
  async (id, { signal }) => getDealById(id, signal),
);

const dealDetailsSlice = createSlice({
  name: 'dealDetails',
  initialState,
  reducers: {
    clearDealDetails(state) {
      state.deal = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDealById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDealById.fulfilled, (state, action) => {
        state.loading = false;
        state.deal = action.payload;
      })
      .addCase(fetchDealById.rejected, (state, action) => {
        if (action.meta.aborted || action.error.name === 'AbortError') return;
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch deal details';
      });
  },
});

export const { clearDealDetails } = dealDetailsSlice.actions;
export default dealDetailsSlice.reducer;
