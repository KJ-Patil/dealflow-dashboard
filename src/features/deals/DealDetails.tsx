'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchDealById, clearDealDetails } from '@/src/store/dealDetailsSlice';
import { useInterests } from '@/src/hooks/useInterests';
import { formatINR, formatPercent } from '@/src/utils/format';
import { StatCard } from '@/src/components/StatCard';
import { StatSkeleton } from '@/src/components/Skeleton';
import { ErrorState } from '@/src/components/ErrorState';
import { LazyLineChart, LazyBarChart } from '@/src/components/charts';

type Tab = 'overview' | 'projections' | 'risk';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'projections', label: 'ROI Projections' },
  { key: 'risk', label: 'Risk Analysis' },
];

const RISK_BADGE: Record<string, string> = {
  Low: 'bg-success-dim text-success',
  Medium: 'bg-warning-dim text-warning',
  High: 'bg-danger-dim text-danger',
};

const STATUS_BADGE: Record<string, string> = {
  Open: 'bg-success-dim text-success',
  Funded: 'bg-accent-dim text-accent',
  Closed: 'bg-surface-inset text-content-muted',
};

export default function DealDetails({ dealId }: { dealId: string }) {
  const dispatch = useAppDispatch();
  const { deal, loading, error } = useAppSelector((s) => s.dealDetails);
  const { isInterested, toggle } = useInterests();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [expandedRisk, setExpandedRisk] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchDealById(dealId));
    return () => {
      dispatch(clearDealDetails());
    };
  }, [dispatch, dealId]);

  if (loading || !deal) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-inset" />
        <div className="h-6 w-96 animate-pulse rounded bg-surface-inset" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => dispatch(fetchDealById(dealId))}
      />
    );
  }

  const progress =
    deal.targetAmount > 0
      ? Math.round((deal.raisedAmount / deal.targetAmount) * 100)
      : 0;

  const projectionData = deal.roiProjection.conservative.map((_, i) => ({
    year: `Year ${i + 1}`,
    conservative: deal.roiProjection.conservative[i],
    base: deal.roiProjection.base[i],
    optimistic: deal.roiProjection.optimistic[i],
  }));

  const riskBarData = deal.riskFactors.map((rf) => ({
    category: rf.category,
    score: rf.score,
  }));

  return (
    <div className="space-y-6">
      {/* Breadcrumb + save */}
      <div className="flex items-center justify-between">
        <Link
          href="/deals"
          className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
        >
          &larr; Back to Deals
        </Link>
        <button
          onClick={() => toggle(deal.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            isInterested(deal.id)
              ? 'bg-accent text-white border-accent'
              : 'border-edge text-content-dim hover:border-accent/50'
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isInterested(deal.id) ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {isInterested(deal.id) ? 'Saved' : 'Save to Interests'}
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-content">{deal.company.name}</h1>
        <p className="text-content-dim mt-1">{deal.tagline}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-accent-dim text-accent">
            {deal.industry}
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface-inset text-content-dim">
            {deal.stage}
          </span>
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-medium ${RISK_BADGE[deal.risk]}`}
          >
            {deal.risk} Risk
          </span>
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_BADGE[deal.status]}`}
          >
            {deal.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-edge">
        <div className="flex gap-0" role="tablist">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-accent text-accent'
                  : 'border-transparent text-content-dim hover:text-content'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Company info */}
          <div className="rounded-xl border border-edge bg-surface-raised p-5">
            <h3 className="text-sm font-semibold text-content mb-3">
              Company Information
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-content-muted">Founded</span>
                <p className="font-medium text-content">{deal.company.founded}</p>
              </div>
              <div>
                <span className="text-content-muted">Location</span>
                <p className="font-medium text-content">{deal.company.location}</p>
              </div>
              <div>
                <span className="text-content-muted">Employees</span>
                <p className="font-medium text-content">{deal.company.employees}</p>
              </div>
              <div>
                <span className="text-content-muted">Views</span>
                <p className="font-medium text-content">
                  {deal.views.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Financial metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Revenue" value={formatINR(deal.financials.revenue)} />
            <StatCard
              label="Growth"
              value={formatPercent(deal.financials.growth)}
              change={{
                value: formatPercent(deal.financials.growth),
                positive: deal.financials.growth > 0,
              }}
            />
            <StatCard
              label="EBITDA Margin"
              value={`${deal.financials.ebitdaMargin}%`}
            />
            <StatCard
              label="Valuation"
              value={formatINR(deal.financials.valuation)}
            />
            <StatCard label="Monthly Burn" value={formatINR(deal.financials.burn)} />
            <StatCard
              label="Runway"
              value={`${deal.financials.runway} months`}
            />
            <StatCard label="Target" value={formatINR(deal.targetAmount)} />
            <StatCard
              label="Raised"
              value={`${formatINR(deal.raisedAmount)} (${progress}%)`}
            />
          </div>

          {/* Funding progress */}
          <div className="rounded-xl border border-edge bg-surface-raised p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-content-dim">Funding Progress</span>
              <span className="font-medium text-content">{progress}%</span>
            </div>
            <div
              className="h-3 w-full rounded-full bg-surface-inset overflow-hidden"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-accent transition-all duration-700"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-content-muted mt-1">
              <span>{formatINR(deal.raisedAmount)}</span>
              <span>{formatINR(deal.targetAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projections' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-edge bg-surface-raised p-5">
            <h3 className="text-sm font-semibold text-content mb-1">
              ROI Projection (5 Years)
            </h3>
            <p className="text-xs text-content-muted mb-4">
              Cumulative return across three scenarios. Base ROI: {deal.roi}%
              annually.
            </p>
            <LazyLineChart
              data={projectionData}
              lines={[
                { dataKey: 'conservative', name: 'Conservative' },
                { dataKey: 'base', name: 'Base' },
                { dataKey: 'optimistic', name: 'Optimistic' },
              ]}
              xKey="year"
              yFormatter={(v: number) => `${v}%`}
              height={350}
              ariaLabel="ROI projection chart showing conservative, base, and optimistic scenarios over 5 years"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-edge bg-surface-raised p-4 text-center">
              <span className="text-xs text-content-muted">
                Conservative (5yr)
              </span>
              <p className="text-lg font-bold text-content">
                {deal.roiProjection.conservative[4]}%
              </p>
            </div>
            <div className="rounded-xl border border-edge bg-surface-raised p-4 text-center">
              <span className="text-xs text-content-muted">Base (5yr)</span>
              <p className="text-lg font-bold text-accent">
                {deal.roiProjection.base[4]}%
              </p>
            </div>
            <div className="rounded-xl border border-edge bg-surface-raised p-4 text-center">
              <span className="text-xs text-content-muted">
                Optimistic (5yr)
              </span>
              <p className="text-lg font-bold text-success">
                {deal.roiProjection.optimistic[4]}%
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-edge bg-surface-raised p-5">
            <h3 className="text-sm font-semibold text-content mb-4">
              Risk Factor Scores
            </h3>
            <LazyBarChart
              data={riskBarData}
              bars={[{ dataKey: 'score', name: 'Risk Score' }]}
              xKey="category"
              height={280}
              ariaLabel="Bar chart of risk factor scores by category"
            />
          </div>

          {/* Risk factors accordion */}
          <div className="rounded-xl border border-edge bg-surface-raised divide-y divide-edge overflow-hidden">
            {deal.riskFactors.map((rf, idx) => (
              <div key={idx}>
                <button
                  onClick={() =>
                    setExpandedRisk(expandedRisk === idx ? null : idx)
                  }
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface-dim transition-colors"
                  aria-expanded={expandedRisk === idx}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        rf.score >= 7
                          ? 'bg-danger-dim text-danger'
                          : rf.score >= 4
                            ? 'bg-warning-dim text-warning'
                            : 'bg-success-dim text-success'
                      }`}
                    >
                      {rf.score}/10
                    </span>
                    <span className="text-sm font-medium text-content">
                      {rf.category}
                    </span>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`text-content-muted transition-transform ${
                      expandedRisk === idx ? 'rotate-180' : ''
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expandedRisk === idx && (
                  <div className="px-5 pb-4 text-sm text-content-dim">
                    {rf.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
