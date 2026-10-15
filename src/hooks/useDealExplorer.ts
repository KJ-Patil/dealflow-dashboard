'use client';

import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  fetchDeals,
  setSearch,
  setIndustryFilter,
  setRiskFilter,
  setRoiRange,
  setInvestmentRange,
  setStatusFilter,
  setSort,
  setPage,
  resetFilters,
} from '@/src/store/dealsSlice';
import { useDebounce } from './useDebounce';
import { buildQueryKey } from '@/src/utils/queryKey';
import type { DealQuery, Industry, RiskLevel, DealStatus, SortOption } from '@/src/types';

export function useDealExplorer() {
  const dispatch = useAppDispatch();
  const { filters, sort, page, currentResult, loading, error } =
    useAppSelector((s) => s.deals);

  const debouncedSearch = useDebounce(filters.search ?? '', 350);

  // Build query with debounced search
  const query: DealQuery = useMemo(
    () => ({
      filters: { ...filters, search: debouncedSearch || undefined },
      sort,
      page,
      pageSize: 12,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearch, filters.industry, filters.risk, filters.roiMin,
     filters.roiMax, filters.investmentMin, filters.investmentMax,
     filters.status, sort, page],
  );

  const queryKey = useMemo(() => buildQueryKey(query), [query]);

  useEffect(() => {
    const promise = dispatch(fetchDeals(query));
    return () => {
      promise.abort();
    };
    // queryKey is a stable string derived from query contents
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, queryKey]);

  return {
    results: currentResult,
    loading,
    error,
    filters,
    sort,
    page,
    setSearch: (v: string) => dispatch(setSearch(v)),
    setIndustry: (v: Industry[]) => dispatch(setIndustryFilter(v)),
    setRisk: (v: RiskLevel[]) => dispatch(setRiskFilter(v)),
    setRoiRange: (min?: number, max?: number) =>
      dispatch(setRoiRange({ min, max })),
    setInvestmentRange: (min?: number, max?: number) =>
      dispatch(setInvestmentRange({ min, max })),
    setStatus: (v: DealStatus[]) => dispatch(setStatusFilter(v)),
    setSort: (v: SortOption) => dispatch(setSort(v)),
    setPage: (v: number) => dispatch(setPage(v)),
    resetFilters: () => dispatch(resetFilters()),
  };
}
