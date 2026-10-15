import type { Investment } from '@/src/types';
import rawInvestments from '@/src/data/investments.json';
import { simulatedFetch } from './delay';

const investments = rawInvestments as Investment[];

export function getAllInvestments(signal?: AbortSignal): Promise<Investment[]> {
  return simulatedFetch(() => investments, signal);
}
