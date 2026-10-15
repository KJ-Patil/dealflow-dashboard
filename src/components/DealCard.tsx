'use client';

import { memo } from 'react';
import Link from 'next/link';
import type { Deal } from '@/src/types';
import { formatINR } from '@/src/utils/format';

interface DealCardProps {
  deal: Deal;
  interested: boolean;
  onToggleInterest: (id: string) => void;
}

const RISK_STYLE: Record<string, string> = {
  Low: 'bg-success-dim text-success',
  Medium: 'bg-warning-dim text-warning',
  High: 'bg-danger-dim text-danger',
};

const STATUS_STYLE: Record<string, string> = {
  Open: 'bg-success-dim text-success',
  Funded: 'bg-accent-dim text-accent',
  Closed: 'bg-surface-inset text-content-muted',
};

export const DealCard = memo(function DealCard({
  deal,
  interested,
  onToggleInterest,
}: DealCardProps) {
  const progress =
    deal.targetAmount > 0
      ? Math.round((deal.raisedAmount / deal.targetAmount) * 100)
      : 0;

  return (
    <div className="rounded-xl border border-edge bg-surface-raised p-5 flex flex-col gap-3 hover:border-accent/40 transition-colors">
      {/* Header: badges + bookmark */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-accent-dim text-accent">
            {deal.industry}
          </span>
          <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-surface-inset text-content-dim">
            {deal.stage}
          </span>
        </div>
        <button
          onClick={() => onToggleInterest(deal.id)}
          className="shrink-0 p-1 rounded hover:bg-surface-dim transition-colors"
          aria-label={interested ? 'Remove from interests' : 'Save to interests'}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={interested ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            className={interested ? 'text-accent' : 'text-content-muted'}
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {/* Title + tagline */}
      <div>
        <h3 className="font-semibold text-content leading-tight">
          {deal.name}
        </h3>
        <p className="text-sm text-content-dim mt-0.5 line-clamp-2">
          {deal.tagline}
        </p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs text-content-muted">ROI</div>
          <div className="text-sm font-semibold text-content">
            {deal.roi}%
          </div>
        </div>
        <div>
          <div className="text-xs text-content-muted">Risk</div>
          <span
            className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded ${RISK_STYLE[deal.risk]}`}
          >
            {deal.risk}
          </span>
        </div>
        <div>
          <div className="text-xs text-content-muted">Min</div>
          <div className="text-sm font-semibold text-content">
            {formatINR(deal.minInvestment)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-content-muted mb-1">
          <span>
            {formatINR(deal.raisedAmount)} / {formatINR(deal.targetAmount)}
          </span>
          <span>{progress}%</span>
        </div>
        <div
          className="h-1.5 w-full rounded-full bg-surface-inset overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${progress}% funded`}
        >
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer: status + link */}
      <div className="flex items-center justify-between pt-1">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-md ${STATUS_STYLE[deal.status]}`}
        >
          {deal.status}
        </span>
        <Link
          href={`/deals/${deal.id}`}
          className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          View Deal &rarr;
        </Link>
      </div>
    </div>
  );
});
