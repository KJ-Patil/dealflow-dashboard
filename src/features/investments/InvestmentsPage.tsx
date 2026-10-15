'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchAllDeals } from '@/src/store/dealsSlice';
import { fetchInvestors, fetchAllInvestments } from '@/src/store/investorSlice';
import { useInterests } from '@/src/hooks/useInterests';
import { DealCard } from '@/src/components/DealCard';
import { EmptyState } from '@/src/components/EmptyState';
import { CardSkeleton, TableRowSkeleton } from '@/src/components/Skeleton';
import { formatINR } from '@/src/utils/format';
import type { Deal, Investment, Investor } from '@/src/types';

interface HoldingRow {
  deal: Deal;
  investor: Investor;
  investment: Investment;
}

export default function InvestmentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { savedDealIds, toggle, remove, clear, isInterested } = useInterests();
  const allDeals = useAppSelector((s) => s.deals.allDeals);
  const allDealsLoaded = useAppSelector((s) => s.deals.allDealsLoaded);
  const investors = useAppSelector((s) => s.investor.investors);
  const investments = useAppSelector((s) => s.investor.investments);
  const investmentsLoaded = useAppSelector((s) => s.investor.investmentsLoaded);
  const loading = useAppSelector(
    (s) => s.deals.loading || s.investor.loading,
  );

  useEffect(() => {
    dispatch(fetchAllDeals());
    dispatch(fetchInvestors());
    dispatch(fetchAllInvestments());
  }, [dispatch]);

  const savedDeals = useMemo(() => {
    if (!allDealsLoaded) return [];
    return savedDealIds
      .map((id) => allDeals.find((d) => d.id === id))
      .filter((d): d is Deal => d != null);
  }, [savedDealIds, allDeals, allDealsLoaded]);

  const holdings = useMemo<HoldingRow[]>(() => {
    if (!investmentsLoaded || !allDealsLoaded || investors.length === 0) return [];

    const dealMap = new Map(allDeals.map((d) => [d.id, d]));
    const investorMap = new Map(investors.map((inv) => [inv.id, inv]));

    return investments
      .filter((inv) => savedDealIds.includes(inv.dealId))
      .map((inv) => {
        const deal = dealMap.get(inv.dealId);
        const investor = investorMap.get(inv.investorId);
        if (!deal || !investor) return null;
        return { deal, investor, investment: inv };
      })
      .filter((row): row is HoldingRow => row != null)
      .sort(
        (a, b) =>
          new Date(b.investment.date).getTime() -
          new Date(a.investment.date).getTime(),
      );
  }, [investments, investmentsLoaded, allDeals, allDealsLoaded, investors, savedDealIds]);

  const totalInvested = useMemo(
    () => holdings.reduce((sum, h) => sum + h.investment.amount, 0),
    [holdings],
  );

  const dataReady = allDealsLoaded && investmentsLoaded;

  return (
    <div className="space-y-8">
      {/* Saved deals section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-content">My Interests</h1>
            <p className="text-sm text-content-dim mt-1">
              Deals you&apos;ve saved for later review
            </p>
          </div>
          {savedDealIds.length > 0 && (
            <button
              onClick={clear}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-danger/30 text-danger hover:bg-danger-dim transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {!dataReady && loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : savedDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDeals.map((deal) => (
              <div key={deal.id} className="relative group">
                <DealCard
                  deal={deal}
                  interested={isInterested(deal.id)}
                  onToggleInterest={toggle}
                />
                <button
                  onClick={() => remove(deal.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-surface-raised border border-edge shadow-sm hover:bg-danger-dim hover:border-danger/30 transition-all"
                  aria-label={`Remove ${deal.name} from interests`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-content-muted hover:text-danger"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No saved deals"
            description="Browse the Deal Explorer and bookmark deals you're interested in."
            action={{ label: 'Explore Deals', onClick: () => router.push('/deals') }}
          />
        )}

        {savedDeals.length === 0 && dataReady && (
          <div className="mt-2 text-center">
            <Link
              href="/deals"
              className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Browse Deal Explorer &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* Holdings table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-content">Holdings</h2>
            <p className="text-sm text-content-dim mt-1">
              Investment activity in your saved deals
            </p>
          </div>
          {holdings.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-content-muted uppercase tracking-wide">
                Total Invested
              </p>
              <p className="text-lg font-bold text-content">
                {formatINR(totalInvested)}
              </p>
            </div>
          )}
        </div>

        {!dataReady ? (
          <div className="rounded-xl border border-edge bg-surface-raised overflow-hidden">
            {Array.from({ length: 5 }, (_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </div>
        ) : holdings.length > 0 ? (
          <div className="rounded-xl border border-edge bg-surface-raised overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-surface-dim text-xs font-medium text-content-muted uppercase tracking-wide border-b border-edge">
              <div className="col-span-3">Deal</div>
              <div className="col-span-3">Investor</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-right">Date</div>
            </div>
            {/* Rows */}
            <div className="divide-y divide-edge">
              {holdings.map((row) => (
                <div
                  key={row.investment.id}
                  className="grid grid-cols-12 gap-4 px-5 py-3 text-sm hover:bg-surface-dim transition-colors items-center"
                >
                  <div className="col-span-3">
                    <Link
                      href={`/deals/${row.deal.id}`}
                      className="font-medium text-content hover:text-accent transition-colors"
                    >
                      {row.deal.name}
                    </Link>
                    <p className="text-xs text-content-muted">
                      {row.deal.industry}
                    </p>
                  </div>
                  <div className="col-span-3 text-content-dim">
                    {row.investor.name}
                  </div>
                  <div className="col-span-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-surface-inset text-content-dim">
                      {row.investor.type}
                    </span>
                  </div>
                  <div className="col-span-2 text-right font-medium text-content">
                    {formatINR(row.investment.amount)}
                  </div>
                  <div className="col-span-2 text-right text-content-muted">
                    {new Date(row.investment.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-edge bg-surface-raised p-8 text-center">
            <p className="text-sm text-content-dim">
              {savedDealIds.length > 0
                ? 'No investments found for your saved deals.'
                : 'Save some deals first to see related holdings here.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
