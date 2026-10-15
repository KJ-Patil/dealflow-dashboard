'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  fetchCompanies,
  fetchCompanyStats,
  selectCompany,
} from '@/src/store/corporateSlice';
import { StatCard } from '@/src/components/StatCard';
import { StatSkeleton } from '@/src/components/Skeleton';
import { ErrorState } from '@/src/components/ErrorState';
import { LazyBarChart, LazyLineChart } from '@/src/components/charts';
import { formatINR, formatINRShort, formatCompact } from '@/src/utils/format';

export default function CorporatePage() {
  const dispatch = useAppDispatch();
  const {
    companies,
    selectedDealId,
    stats,
    companiesLoading,
    statsLoading,
    error,
  } = useAppSelector((s) => s.corporate);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  useEffect(() => {
    if (companies.length > 0 && !selectedDealId) {
      dispatch(selectCompany(companies[0].dealId));
    }
  }, [companies, selectedDealId, dispatch]);

  useEffect(() => {
    if (selectedDealId) {
      dispatch(fetchCompanyStats(selectedDealId));
    }
  }, [selectedDealId, dispatch]);

  const handleCompanyChange = (dealId: string) => {
    dispatch(selectCompany(dealId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content">
            Corporate Dashboard
          </h1>
          <p className="text-sm text-content-dim mt-1">
            Company performance and investor analytics
          </p>
        </div>

        {/* Company selector */}
        <select
          value={selectedDealId ?? ''}
          onChange={(e) => handleCompanyChange(e.target.value)}
          disabled={companiesLoading || companies.length === 0}
          className="px-4 py-2.5 text-sm rounded-lg border border-edge bg-surface text-content focus:outline-none focus:border-accent disabled:opacity-50 min-w-[220px]"
          aria-label="Select company"
        >
          {companiesLoading ? (
            <option>Loading companies...</option>
          ) : (
            companies.map((c) => (
              <option key={c.dealId} value={c.dealId}>
                {c.companyName}
              </option>
            ))
          )}
        </select>
      </div>

      {error && !statsLoading && (
        <ErrorState
          message={error}
          onRetry={() => {
            if (selectedDealId) dispatch(fetchCompanyStats(selectedDealId));
            else dispatch(fetchCompanies());
          }}
        />
      )}

      {/* Stat cards */}
      {statsLoading || !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Funding"
            value={formatINR(stats.totalFunding)}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
          <StatCard
            label="Investors"
            value={String(stats.investorCount)}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <StatCard
            label="Page Views"
            value={formatCompact(stats.views)}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            }
          />
          <StatCard
            label="Conversion Rate"
            value={`${stats.conversionRate}%`}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            }
          />
        </div>
      )}

      {/* Charts */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funding by month */}
          <div className="rounded-xl border border-edge bg-surface-raised p-5">
            <h3 className="text-sm font-semibold text-content mb-1">
              Funding Trend
            </h3>
            <p className="text-xs text-content-muted mb-4">
              Monthly investment amounts received
            </p>
            {stats.fundingByMonth.length > 0 ? (
              <LazyBarChart
                data={stats.fundingByMonth}
                bars={[{ dataKey: 'amount', name: 'Amount' }]}
                xKey="month"
                height={300}
                yFormatter={(v: number) => formatINRShort(v)}
                ariaLabel={`Funding trend for ${stats.companyName}`}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-content-muted">
                No funding data available
              </div>
            )}
          </div>

          {/* Investors by month */}
          <div className="rounded-xl border border-edge bg-surface-raised p-5">
            <h3 className="text-sm font-semibold text-content mb-1">
              Investor Activity
            </h3>
            <p className="text-xs text-content-muted mb-4">
              Unique investors per month
            </p>
            {stats.investorsByMonth.length > 0 ? (
              <LazyLineChart
                data={stats.investorsByMonth}
                lines={[{ dataKey: 'count', name: 'Investors' }]}
                xKey="month"
                height={300}
                ariaLabel={`Investor activity for ${stats.companyName}`}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-content-muted">
                No investor data available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Company summary */}
      {stats && !statsLoading && (
        <div className="rounded-xl border border-edge bg-surface-raised p-5">
          <h3 className="text-sm font-semibold text-content mb-3">
            Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-content-muted">Company</span>
              <p className="font-medium text-content">{stats.companyName}</p>
            </div>
            <div>
              <span className="text-content-muted">Total Investments</span>
              <p className="font-medium text-content">
                {stats.investmentCount}
              </p>
            </div>
            <div>
              <span className="text-content-muted">Active Months</span>
              <p className="font-medium text-content">
                {stats.fundingByMonth.length}
              </p>
            </div>
            <div>
              <span className="text-content-muted">Avg per Investment</span>
              <p className="font-medium text-content">
                {stats.investmentCount > 0
                  ? formatINR(
                      Math.round(stats.totalFunding / stats.investmentCount),
                    )
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
