import type { Deal, Investment } from '@/src/types';
import rawDeals from '@/src/data/deals.json';
import rawInvestments from '@/src/data/investments.json';
import { simulatedFetch } from './delay';

const deals = rawDeals as Deal[];
const investments = rawInvestments as Investment[];

export interface CompanyOption {
  dealId: string;
  companyName: string;
}

export interface CompanyStats {
  dealId: string;
  companyName: string;
  totalFunding: number;
  investorCount: number;
  views: number;
  investmentCount: number;
  conversionRate: number;
  fundingByMonth: { month: string; amount: number }[];
  investorsByMonth: { month: string; count: number }[];
}

export function getCompanies(signal?: AbortSignal): Promise<CompanyOption[]> {
  return simulatedFetch(() => {
    return deals.map((d) => ({
      dealId: d.id,
      companyName: d.company.name,
    }));
  }, signal);
}

export function getCompanyStats(
  dealId: string,
  signal?: AbortSignal,
): Promise<CompanyStats | null> {
  return simulatedFetch(() => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return null;

    const dealInvestments = investments.filter((inv) => inv.dealId === dealId);
    const uniqueInvestors = new Set(dealInvestments.map((inv) => inv.investorId));

    const conversionRate =
      deal.views > 0
        ? Number(((dealInvestments.length / deal.views) * 100).toFixed(2))
        : 0;

    // Group investments by month
    const byMonth = new Map<string, { amount: number; investors: Set<string> }>();
    for (const inv of dealInvestments) {
      const month = inv.date.slice(0, 7); // YYYY-MM
      const entry = byMonth.get(month) ?? { amount: 0, investors: new Set() };
      entry.amount += inv.amount;
      entry.investors.add(inv.investorId);
      byMonth.set(month, entry);
    }

    const sortedMonths = [...byMonth.keys()].sort();
    const fundingByMonth = sortedMonths.map((m) => ({
      month: m,
      amount: byMonth.get(m)!.amount,
    }));
    const investorsByMonth = sortedMonths.map((m) => ({
      month: m,
      count: byMonth.get(m)!.investors.size,
    }));

    return {
      dealId: deal.id,
      companyName: deal.company.name,
      totalFunding: deal.raisedAmount,
      investorCount: uniqueInvestors.size,
      views: deal.views,
      investmentCount: dealInvestments.length,
      conversionRate,
      fundingByMonth,
      investorsByMonth,
    };
  }, signal);
}
