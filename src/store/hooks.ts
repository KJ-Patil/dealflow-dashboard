'use client';

import { useSelector, useDispatch, useStore } from 'react-redux';
import type { RootState, AppDispatch, AppStore } from './index';

export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppStore = useStore.withTypes<AppStore>();
