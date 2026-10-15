'use client';

import { useState } from 'react';
import { useDealExplorer } from '@/src/hooks/useDealExplorer';
import { useInterests } from '@/src/hooks/useInterests';
import { DealCard } from '@/src/components/DealCard';
import { CardSkeleton } from '@/src/components/Skeleton';
import { ErrorState } from '@/src/components/ErrorState';
import { EmptyState } from '@/src/components/EmptyState';
import type { Industry, RiskLevel, DealStatus, SortOption } from '@/src/types';

const INDUSTRIES: Industry[] = [
  'Fintech', 'HealthTech', 'EdTech', 'AgriTech', 'CleanTech',
  'SaaS', 'E-Commerce', 'Logistics', 'PropTech', 'InsurTech',
];
const RISK_LEVELS: RiskLevel[] = ['Low', 'Medium', 'High'];
const STATUSES: DealStatus[] = ['Open', 'Funded', 'Closed'];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'bestMatch', label: 'Best Match' },
  { value: 'roi', label: 'ROI (High to Low)' },
  { value: 'risk', label: 'Risk (Low to High)' },
  { value: 'amount', label: 'Amount (Low to High)' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name', label: 'Name (A-Z)' },
];

function FilterChips<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: T[];
  selected: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <div>
      <span className="text-xs font-medium text-content-muted uppercase tracking-wide">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() =>
                onChange(
                  active
                    ? selected.filter((v) => v !== opt)
                    : [...selected, opt],
                )
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                active
                  ? 'bg-accent text-white border-accent'
                  : 'bg-surface border-edge text-content-dim hover:border-accent/50'
              }`}
              aria-pressed={active}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== -1) {
      pages.push(-1);
    }
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-sm rounded-lg border border-edge text-content-dim hover:bg-surface-dim disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === -1 ? (
          <span key={`e-${i}`} className="px-2 text-content-muted">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
              p === page
                ? 'bg-accent text-white'
                : 'border border-edge text-content-dim hover:bg-surface-dim'
            }`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded-lg border border-edge text-content-dim hover:bg-surface-dim disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </nav>
  );
}

export default function DealExplorer() {
  const {
    results,
    loading,
    error,
    filters,
    sort,
    setSearch,
    setIndustry,
    setRisk,
    setRoiRange,
    setInvestmentRange,
    setStatus,
    setSort,
    setPage,
    resetFilters,
  } = useDealExplorer();

  const { isInterested, toggle } = useInterests();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasFilters = !!(
    filters.search ||
    filters.industry?.length ||
    filters.risk?.length ||
    filters.roiMin != null ||
    filters.roiMax != null ||
    filters.investmentMin != null ||
    filters.investmentMax != null ||
    filters.status?.length
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-content">Deal Explorer</h1>
        <p className="text-sm text-content-dim mt-1">
          Browse and filter investment opportunities
        </p>
      </div>

      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search deals, industries, companies..."
            value={filters.search ?? ''}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-edge bg-surface text-content placeholder:text-content-muted focus:outline-none focus:border-accent transition-colors"
            aria-label="Search deals"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-3 py-2.5 text-sm rounded-lg border border-edge bg-surface text-content focus:outline-none focus:border-accent"
          aria-label="Sort deals"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button
          className="sm:hidden px-4 py-2.5 text-sm rounded-lg border border-edge text-content-dim hover:bg-surface-dim transition-colors"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          Filters {hasFilters && '*'}
        </button>
      </div>

      {/* Filters panel */}
      <div className={`space-y-4 ${filtersOpen ? '' : 'hidden sm:block'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FilterChips
            label="Industry"
            options={INDUSTRIES}
            selected={filters.industry ?? []}
            onChange={setIndustry}
          />
          <FilterChips
            label="Risk Level"
            options={RISK_LEVELS}
            selected={filters.risk ?? []}
            onChange={setRisk}
          />
          <FilterChips
            label="Status"
            options={STATUSES}
            selected={filters.status ?? []}
            onChange={setStatus}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-medium text-content-muted uppercase tracking-wide">
              ROI Range (%)
            </span>
            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="number"
                placeholder="Min"
                value={filters.roiMin ?? ''}
                onChange={(e) =>
                  setRoiRange(
                    e.target.value ? Number(e.target.value) : undefined,
                    filters.roiMax,
                  )
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-edge bg-surface text-content placeholder:text-content-muted focus:outline-none focus:border-accent"
              />
              <span className="text-content-muted">&ndash;</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.roiMax ?? ''}
                onChange={(e) =>
                  setRoiRange(
                    filters.roiMin,
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-edge bg-surface text-content placeholder:text-content-muted focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-content-muted uppercase tracking-wide">
              Min Investment Range
            </span>
            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="number"
                placeholder="Min (₹)"
                value={filters.investmentMin ?? ''}
                onChange={(e) =>
                  setInvestmentRange(
                    e.target.value ? Number(e.target.value) : undefined,
                    filters.investmentMax,
                  )
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-edge bg-surface text-content placeholder:text-content-muted focus:outline-none focus:border-accent"
              />
              <span className="text-content-muted">&ndash;</span>
              <input
                type="number"
                placeholder="Max (₹)"
                value={filters.investmentMax ?? ''}
                onChange={(e) =>
                  setInvestmentRange(
                    filters.investmentMin,
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-edge bg-surface text-content placeholder:text-content-muted focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Result count */}
      {results && (
        <p className="text-sm text-content-dim">
          Showing{' '}
          <span className="font-medium text-content">{results.total}</span>{' '}
          {results.total === 1 ? 'deal' : 'deals'}
          {loading && (
            <span className="ml-2 text-content-muted">(updating...)</span>
          )}
        </p>
      )}

      {/* Error state */}
      {error && !loading && (
        <ErrorState
          message={error}
          onRetry={() =>
            setSearch(filters.search ?? '')
          }
        />
      )}

      {/* Results grid */}
      {loading && !results ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : results && results.items.length > 0 ? (
        <>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
              loading ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            {results.items.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                interested={isInterested(deal.id)}
                onToggleInterest={toggle}
              />
            ))}
          </div>
          <Pagination
            page={results.page}
            totalPages={results.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        !loading &&
        !error && (
          <EmptyState
            title="No deals found"
            description="Try adjusting your filters or search terms."
            action={hasFilters ? { label: 'Reset filters', onClick: resetFilters } : undefined}
          />
        )
      )}
    </div>
  );
}
