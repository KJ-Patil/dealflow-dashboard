'use client';

import dynamic from 'next/dynamic';
import { ChartSkeleton } from '../Skeleton';

export const LazyLineChart = dynamic(() => import('./LineChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

export const LazyBarChart = dynamic(() => import('./BarChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

export const LazyPieChart = dynamic(() => import('./PieChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

export const LazyScatterChart = dynamic(() => import('./ScatterChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
