import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Investor, Investment } from '@/src/types';
import { getInvestors } from '@/src/services/investorService';
import { getAllInvestments } from '@/src/services/investmentService';

interface InvestorState {
  investors: Investor[];
  currentProfile: Investor | null;
  investments: Investment[];
  investmentsLoaded: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: InvestorState = {
  investors: [],
  currentProfile: null,
  investments: [],
  investmentsLoaded: false,
  loading: false,
  error: null,
};

export const fetchInvestors = createAsyncThunk<Investor[], void>(
  'investor/fetchAll',
  async (_, { signal }) => getInvestors(signal),
);

export const fetchAllInvestments = createAsyncThunk<Investment[], void>(
  'investor/fetchInvestments',
  async (_, { signal }) => getAllInvestments(signal),
  {
    condition: (_, { getState }) =>
      !(getState() as { investor: InvestorState }).investor.investmentsLoaded,
  },
);

const investorSlice = createSlice({
  name: 'investor',
  initialState,
  reducers: {
    setCurrentProfile(state, action: { payload: string }) {
      state.currentProfile =
        state.investors.find((inv) => inv.id === action.payload) ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestors.fulfilled, (state, action) => {
        state.loading = false;
        state.investors = action.payload;
        if (!state.currentProfile && action.payload.length > 0) {
          state.currentProfile = action.payload[0];
        }
      })
      .addCase(fetchInvestors.rejected, (state, action) => {
        if (action.meta.aborted || action.error.name === 'AbortError') return;
        state.loading = false;
        state.error =
          action.error.message ?? 'Failed to fetch investor profiles';
      })
      .addCase(fetchAllInvestments.fulfilled, (state, action) => {
        state.investments = action.payload;
        state.investmentsLoaded = true;
      });
  },
});

export const { setCurrentProfile } = investorSlice.actions;
export default investorSlice.reducer;
