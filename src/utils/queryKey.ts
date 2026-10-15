import type { DealQuery } from '@/src/types';

export function buildQueryKey(query: DealQuery): string {
  return JSON.stringify({
    f: query.filters,
    s: query.sort,
    p: query.page,
    ps: query.pageSize,
  });
}
