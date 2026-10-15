import type { Investor } from '@/src/types';
import rawInvestors from '@/src/data/investors.json';
import { simulatedFetch } from './delay';

const investors = rawInvestors as Investor[];

export function getInvestors(signal?: AbortSignal): Promise<Investor[]> {
  return simulatedFetch(() => investors, signal);
}

export function getInvestorById(
  id: string,
  signal?: AbortSignal,
): Promise<Investor | null> {
  return simulatedFetch(() => {
    return investors.find((inv) => inv.id === id) ?? null;
  }, signal);
}
