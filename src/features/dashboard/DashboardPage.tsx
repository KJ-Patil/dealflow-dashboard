'use client';

import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchAllDeals } from '@/src/store/dealsSlice';
import { fetchInvestors, fetchAllInvestments } from '@/src/store/investorSlice';
import { useRecommendations } from '@/src/hooks/useRecommendations';
import { useInterests } from '@/src/hooks/useInterests';
import { formatINR, formatINRShort } from '@/src/utils/format';
import { StatCard } from '@/src/components/StatCard';
import { DealCard } from '@/src/components/DealCard';
import { StatSkeleton, CardSkeleton } from '@/src/components/Skeleton';
import { ErrorState } from '@/src/components/ErrorState';
import {
  LazyLineChart,
  LazyPieChart,
  LazyBarChart,
} from '@/src/components/charts';
import type { Deal, Investment, RiskLevel } from '@/src/types';

function computeStats(deals: Deal[], investments: Investment[]) {
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const activeDeals = deals.filter((d) => d.status === 'Open').length;

  const dealROI = new Map(deals.map((d) => [d.id, d.roi]));
  let weightedSum = 0;
  let totalWeight = 0;
  for (const inv of investments) {
    const roi = dealROI.get(inv.dealId);
    if (roi !== undefined) {
      weightedSum += roi * inv.amount;
      totalWeight += inv.amount;
    }
  }
  const avgROI = totalWeight > 0 ? weightedSum / totalWeight : 0;

  const riskCounts: Record<RiskLevel, number> = { Low: 0, Medium: 0, High: 0 };
  for (const d of deals) riskCounts[d.risk]++;

  return { totalInvested, activeDeals, avgROI, riskCounts };
}

function computeGrowthData(investments: Investment[]) {
  const sorted = [...investments].sort((a, b) => a.date.localeCompare(b.date));
  const byMonth = new Map<string, number>();
  for (const inv of sorted) {
    const month = inv.date.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + inv.amount);
  }
  let cumulative = 0;
  return [...byMonth.entries()].map(([month, amount]) => {
    cumulative += amount;
    return { month, amount, cumulative };
  });
}

function computeIndustryData(deals: Deal[]) {
  const counts = new Map<string, number>();
  for (const d of deals) counts.set(d.industry, (counts.get(d.industry) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function computeRiskRoiData(deals: Deal[]) {
  const groups: Record<RiskLevel, { sum: number; count: number; min: number; max: number }> = {
    Low: { sum: 0, count: 0, min: Infinity, max: -Infinity },
    Medium: { sum: 0, count: 0, min: Infinity, max: -Infinity },
    High: { sum: 0, count: 0, min: Infinity, max: -Infinity },
  };
  for (const d of deals) {
    const g = groups[d.risk];
    g.sum += d.roi;
    g.count++;
    g.min = Math.min(g.min, d.roi);
    g.max = Math.max(g.max, d.roi);
  }
  return (['Low', 'Medium', 'High'] as RiskLevel[]).map((level) => {
    const g = groups[level];
    return {
      risk: level,
      avgRoi: g.count > 0 ? Number((g.sum / g.count).toFixed(1)) : 0,
      minRoi: g.count > 0 ? g.min : 0,
      maxRoi: g.count > 0 ? g.max : 0,
      deals: g.count,
    };
  });
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const allDeals = useAppSelector((s) => s.deals.allDeals);
  const allDealsLoaded = useAppSelector((s) => s.deals.allDealsLoaded);
  const currentProfile = useAppSelector((s) => s.investor.currentProfile);
  const investorError = useAppSelector((s) => s.investor.error);
  const investments = useAppSelector((s) => s.investor.investments);
  const investmentsLoaded = useAppSelector((s) => s.investor.investmentsLoaded);

  useEffect(() => {
    dispatch(fetchAllDeals());
    dispatch(fetchInvestors());
    dispatch(fetchAllInvestments());
  }, [dispatch]);

  const { recommendations, loading: recsLoading } =
    useRecommendations(currentProfile);
  const { isInterested, toggle } = useInterests();

  const dataReady = allDealsLoaded && investmentsLoaded;

  const stats = useMemo(
    () => (dataReady ? computeStats(allDeals, investments) : null),
    [allDeals, investments, dataReady],
  );

  const growthData = useMemo(
    () => (dataReady ? computeGrowthData(investments) : []),
    [investments, dataReady],
  );

  const industryData = useMemo(
    () => (dataReady ? computeIndustryData(allDeals) : []),
    [allDeals, dataReady],
  );

  const riskRoiData = useMemo(
    () => (dataReady ? computeRiskRoiData(allDeals) : []),
    [allDeals, dataReady],
  );

  if (investorError) {
    return (
      <ErrorState
        message={investorError}
        onRetry={() => {
          dispatch(fetchInvestors());
          dispatch(fetchAllInvestments());
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-content">
          Investor Dashboard
        </h1>
        {currentProfile && (
          <p className="text-sm text-content-dim mt-1">
            Welcome, {currentProfile.name} &middot;{' '}
            {currentProfile.type} &middot; Risk appetite:{' '}
            {currentProfile.riskAppetite}
          </p>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!stats ? (
          Array.from({ length: 4 }, (_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Invested"
              value={formatINR(stats.totalInvested)}
            />
            <StatCard
              label="Active Deals"
              value={String(stats.activeDeals)}
            />
            <StatCard
              label="Avg ROI (Weighted)"
              value={`${stats.avgROI.toFixed(1)}%`}
            />
            <div className="rounded-xl border border-edge bg-surface-raised p-5">
              <span className="text-xs font-medium text-content-muted uppercase tracking-wide">
                Risk Distribution
              </span>
              <div className="flex items-center gap-3 mt-2">
                {(['Low', 'Medium', 'High'] as RiskLevel[]).map((level) => (
                  <div key={level} className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        level === 'Low'
                          ? 'bg-success'
                          : level === 'Medium'
                            ? 'bg-warning'
                            : 'bg-danger'
                      }`}
                    />
                    <span className="text-sm text-content-dim">
                      {level}:{' '}
                      <span className="font-semibold text-content">
                        {stats.riskCounts[level]}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-edge bg-surface-raised p-5">
          <h2 className="text-sm font-semibold text-content mb-4">
            Investment Growth Over Time
          </h2>
          {dataReady ? (
            <LazyLineChart
              data={growthData}
              lines={[
                { dataKey: 'cumulative', name: 'Cumulative (₹)' },
              ]}
              xKey="month"
              yFormatter={(v: number) => formatINRShort(v)}
              yLabel="Amount (₹)"
              ariaLabel="Cumulative investment growth over time"
            />
          ) : null}
        </div>

        <div className="rounded-xl border border-edge bg-surface-raised p-5">
          <h2 className="text-sm font-semibold text-content mb-4">
            Industry Distribution
          </h2>
          {dataReady ? (
            <LazyPieChart
              data={industryData}
              innerRadius={50}
              height={350}
              ariaLabel="Deals distribution across industries"
            />
          ) : null}
        </div>
      </div>

      {/* Risk vs ROI bar chart */}
      <div className="rounded-xl border border-edge bg-surface-raised p-5">
        <h2 className="text-sm font-semibold text-content mb-1">
          Average ROI by Risk Level
        </h2>
        <p className="text-xs text-content-muted mb-4">
          Average annual return for each risk category
        </p>
        {dataReady ? (
          <LazyBarChart
            data={riskRoiData}
            bars={[
              { dataKey: 'avgRoi', name: 'Avg ROI (%)' },
              { dataKey: 'maxRoi', name: 'Max ROI (%)' },
            ]}
            xKey="risk"
            height={300}
            yFormatter={(v: number) => `${v}%`}
            yLabel="ROI (%)"
            ariaLabel="Bar chart comparing average ROI across Low, Medium, and High risk levels"
          />
        ) : null}
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-lg font-semibold text-content mb-4">
          Recommended for You
        </h2>
        {recsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-sm text-content-dim">
            No recommendations available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 6).map((deal) => (
              <div key={deal.id} className="relative">
                <span className="absolute -top-2 -right-2 z-10 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {deal.matchScore}%
                </span>
                <DealCard
                  deal={deal}
                  interested={isInterested(deal.id)}
                  onToggleInterest={toggle}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
