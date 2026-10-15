import type {
  Deal,
  DealFilters,
  DealQuery,
  PaginatedResult,
  SortOption,
} from '@/src/types';
import rawDeals from '@/src/data/deals.json';
import { simulatedFetch } from './delay';

const deals = rawDeals as Deal[];

function matchesSearch(deal: Deal, search: string): boolean {
  const q = search.toLowerCase();
  return (
    deal.name.toLowerCase().includes(q) ||
    deal.tagline.toLowerCase().includes(q) ||
    deal.industry.toLowerCase().includes(q) ||
    deal.company.name.toLowerCase().includes(q)
  );
}

function applyFilters(items: Deal[], filters: DealFilters): Deal[] {
  let result = items;

  if (filters.search) {
    result = result.filter((d) => matchesSearch(d, filters.search!));
  }
  if (filters.industry?.length) {
    result = result.filter((d) => filters.industry!.includes(d.industry));
  }
  if (filters.risk?.length) {
    result = result.filter((d) => filters.risk!.includes(d.risk));
  }
  if (filters.roiMin != null) {
    result = result.filter((d) => d.roi >= filters.roiMin!);
  }
  if (filters.roiMax != null) {
    result = result.filter((d) => d.roi <= filters.roiMax!);
  }
  if (filters.investmentMin != null) {
    result = result.filter((d) => d.minInvestment >= filters.investmentMin!);
  }
  if (filters.investmentMax != null) {
    result = result.filter((d) => d.minInvestment <= filters.investmentMax!);
  }
  if (filters.status?.length) {
    result = result.filter((d) => filters.status!.includes(d.status));
  }

  return result;
}

const RISK_ORDER = { Low: 0, Medium: 1, High: 2 } as const;

function applySort(items: Deal[], sort: SortOption): Deal[] {
  const sorted = [...items];

  switch (sort) {
    case 'roi':
      return sorted.sort((a, b) => b.roi - a.roi);
    case 'risk':
      return sorted.sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk]);
    case 'amount':
      return sorted.sort((a, b) => a.minInvestment - b.minInvestment);
    case 'newest':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'bestMatch':
    default:
      return sorted;
  }
}

function paginate(
  items: Deal[],
  page: number,
  pageSize: number,
): PaginatedResult<Deal> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export function queryDeals(
  query: DealQuery,
  signal?: AbortSignal,
): Promise<PaginatedResult<Deal>> {
  return simulatedFetch(() => {
    const filtered = applyFilters(deals, query.filters);
    const sorted = applySort(filtered, query.sort);
    return paginate(sorted, query.page, query.pageSize);
  }, signal);
}

export function getDealById(
  id: string,
  signal?: AbortSignal,
): Promise<Deal | null> {
  return simulatedFetch(() => {
    return deals.find((d) => d.id === id) ?? null;
  }, signal);
}

export function getAllDeals(signal?: AbortSignal): Promise<Deal[]> {
  return simulatedFetch(() => deals, signal);
}
