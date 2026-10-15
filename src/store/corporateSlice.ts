import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  getCompanies,
  getCompanyStats as getCompanyStatsService,
  type CompanyOption,
  type CompanyStats,
} from '@/src/services/corporateService';

interface CorporateState {
  companies: CompanyOption[];
  selectedDealId: string | null;
  stats: CompanyStats | null;
  companiesLoading: boolean;
  statsLoading: boolean;
  error: string | null;
}

const initialState: CorporateState = {
  companies: [],
  selectedDealId: null,
  stats: null,
  companiesLoading: false,
  statsLoading: false,
  error: null,
};

export const fetchCompanies = createAsyncThunk<CompanyOption[], void>(
  'corporate/fetchCompanies',
  async (_, { signal }) => getCompanies(signal),
);

export const fetchCompanyStats = createAsyncThunk<
  CompanyStats | null,
  string
>('corporate/fetchStats', async (dealId, { signal }) =>
  getCompanyStatsService(dealId, signal),
);

const corporateSlice = createSlice({
  name: 'corporate',
  initialState,
  reducers: {
    selectCompany(state, action: PayloadAction<string>) {
      state.selectedDealId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.companiesLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companiesLoading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        if (action.meta.aborted || action.error.name === 'AbortError') return;
        state.companiesLoading = false;
        state.error = action.error.message ?? 'Failed to fetch companies';
      })
      .addCase(fetchCompanyStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCompanyStats.rejected, (state, action) => {
        if (action.meta.aborted || action.error.name === 'AbortError') return;
        state.statsLoading = false;
        state.error =
          action.error.message ?? 'Failed to fetch company statistics';
      });
  },
});

export const { selectCompany } = corporateSlice.actions;
export default corporateSlice.reducer;
