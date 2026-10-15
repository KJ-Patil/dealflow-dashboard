'use client';

import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchAllDeals } from '@/src/store/dealsSlice';
import { getRecommendations, type ScoredDeal } from '@/src/utils/recommendation';
import type { Investor } from '@/src/types';

export function useRecommendations(profile: Investor | null) {
  const dispatch = useAppDispatch();
  const allDeals = useAppSelector((s) => s.deals.allDeals);
  const allDealsLoaded = useAppSelector((s) => s.deals.allDealsLoaded);

  useEffect(() => {
    if (profile) {
      dispatch(fetchAllDeals());
    }
  }, [dispatch, profile]);

  const recommendations: ScoredDeal[] = useMemo(() => {
    if (!profile || allDeals.length === 0) return [];
    return getRecommendations(allDeals, profile);
  }, [allDeals, profile]);

  return {
    recommendations,
    loading: !!profile && !allDealsLoaded,
  };
}
