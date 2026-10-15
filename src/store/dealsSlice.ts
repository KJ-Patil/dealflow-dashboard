import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type {
  Deal,
  DealFilters,
  DealQuery,
  Industry,
  PaginatedResult,
  RiskLevel,
  SortOption,
  DealStatus,
} from '@/src/types';
import {
  queryDeals,
  getAllDeals as getAllDealsService,
} from '@/src/services/dealService';
import { buildQueryKey } from '@/src/utils/queryKey';

const CACHE_TTL = 60_000;

interface CachedResult {
  result: PaginatedResult<Deal>;
  timestamp: number;
}

interface DealsState {
  filters: DealFilters;
  sort: SortOption;
  page: number;
  cache: Record<string, CachedResult>;
  currentResult: PaginatedResult<Deal> | null;
  loading: boolean;
  error: string | null;
  latestRequestId: string;
  allDeals: Deal[];
  allDealsLoaded: boolean;
}

const initialState: DealsState = {
  filters: {},
  sort: 'bestMatch',
  page: 1,
  cache: {},
  currentResult: null,
  loading: false,
  error: null,
  latestRequestId: '',
  allDeals: [],
  allDealsLoaded: false,
};

interface FetchDealsPayload {
  result: PaginatedResult<Deal>;
  key: string;
  fromCache: boolean;
}

export const fetchDeals = createAsyncThunk<FetchDealsPayload, DealQuery>(
  'deals/fetch',
  async (query, { getState, signal }) => {
    const key = buildQueryKey(query);
    const state = (getState() as { deals: DealsState }).deals;
    const cached = state.cache[key];

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return { result: cached.result, key, fromCache: true };
    }

    const result = await queryDeals(query, signal);
    return { result, key, fromCache: false };
  },
);

export const fetchAllDeals = createAsyncThunk<Deal[], void>(
  'deals/fetchAll',
  async (_, { signal }) => getAllDealsService(signal),
  {
    condition: (_, { getState }) =>
      !(getState() as { deals: DealsState }).deals.allDealsLoaded,
  },
);

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
      state.page = 1;
    },
    setIndustryFilter(state, action: PayloadAction<Industry[]>) {
      state.filters.industry = action.payload.length
        ? action.payload
        : undefined;
      state.page = 1;
    },
    setRiskFilter(state, action: PayloadAction<RiskLevel[]>) {
      state.filters.risk = action.payload.length ? action.payload : undefined;
      state.page = 1;
    },
    setRoiRange(
      state,
      action: PayloadAction<{ min?: number; max?: number }>,
    ) {
      state.filters.roiMin = action.payload.min;
      state.filters.roiMax = action.payload.max;
      state.page = 1;
    },
    setInvestmentRange(
      state,
      action: PayloadAction<{ min?: number; max?: number }>,
    ) {
      state.filters.investmentMin = action.payload.min;
      state.filters.investmentMax = action.payload.max;
      state.page = 1;
    },
    setStatusFilter(state, action: PayloadAction<DealStatus[]>) {
      state.filters.status = action.payload.length
        ? action.payload
        : undefined;
      state.page = 1;
    },
    setSort(state, action: PayloadAction<SortOption>) {
      state.sort = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetFilters(state) {
      state.filters = {};
      state.sort = 'bestMatch';
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.loading = false;
        const { result, key, fromCache } = action.payload;
        state.currentResult = result;
        if (!fromCache) {
          state.cache[key] = { result, timestamp: Date.now() };
        }
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        if (action.meta.aborted || action.error.name === 'AbortError') return;
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch deals';
      })
      .addCase(fetchAllDeals.fulfilled, (state, action) => {
        state.allDeals = action.payload;
        state.allDealsLoaded = true;
      });
  },
});

export const {
  setSearch,
  setIndustryFilter,
  setRiskFilter,
  setRoiRange,
  setInvestmentRange,
  setStatusFilter,
  setSort,
  setPage,
  resetFilters,
} = dealsSlice.actions;

export default dealsSlice.reducer;
