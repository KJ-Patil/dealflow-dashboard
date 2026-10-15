'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  toggleInterest,
  removeInterest,
  clearInterests,
} from '@/src/store/interestsSlice';

export function useInterests() {
  const dispatch = useAppDispatch();
  const savedDealIds = useAppSelector((s) => s.interests.savedDealIds);

  const toggle = useCallback(
    (dealId: string) => dispatch(toggleInterest(dealId)),
    [dispatch],
  );

  const remove = useCallback(
    (dealId: string) => dispatch(removeInterest(dealId)),
    [dispatch],
  );

  const clear = useCallback(() => dispatch(clearInterests()), [dispatch]);

  const isInterested = useCallback(
    (dealId: string) => savedDealIds.includes(dealId),
    [savedDealIds],
  );

  return { savedDealIds, toggle, remove, clear, isInterested };
}
