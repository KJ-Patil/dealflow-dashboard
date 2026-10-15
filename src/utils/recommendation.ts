import type { Deal, Investor, RiskLevel, Industry } from '@/src/types';

export interface ScoredDeal extends Deal {
  matchScore: number;
}

const RISK_INDEX: Record<RiskLevel, number> = { Low: 0, Medium: 1, High: 2 };

function riskMatchScore(dealRisk: RiskLevel, appetite: RiskLevel): number {
  const diff = Math.abs(RISK_INDEX[dealRisk] - RISK_INDEX[appetite]);
  return Math.max(0, 1 - diff * 0.5);
}

function industryMatchScore(
  dealIndustry: Industry,
  preferred: Industry[],
): number {
  return preferred.includes(dealIndustry) ? 1 : 0;
}

function budgetScore(minInvestment: number, budgetMax: number): number {
  if (minInvestment <= budgetMax) return 1;
  const overRatio = minInvestment / budgetMax;
  return Math.max(0, 1 - (overRatio - 1));
}

function roiScore(roi: number, minRoi: number, maxRoi: number): number {
  if (maxRoi === minRoi) return 0.5;
  return Math.min(1, Math.max(0, (roi - minRoi) / (maxRoi - minRoi)));
}

const scoreCache = new Map<string, number>();

function computeScore(
  deal: Deal,
  investor: Investor,
  minRoi: number,
  maxRoi: number,
): number {
  const key = `${deal.id}:${investor.id}`;
  const cached = scoreCache.get(key);
  if (cached !== undefined) return cached;

  const score = Math.round(
    (riskMatchScore(deal.risk, investor.riskAppetite) * 0.3 +
      industryMatchScore(deal.industry, investor.preferredIndustries) * 0.25 +
      roiScore(deal.roi, minRoi, maxRoi) * 0.25 +
      budgetScore(deal.minInvestment, investor.budgetMax) * 0.2) *
      100,
  );

  scoreCache.set(key, score);
  return score;
}

export function getRecommendations(
  deals: Deal[],
  investor: Investor,
): ScoredDeal[] {
  const rois = deals.map((d) => d.roi);
  const minRoi = Math.min(...rois);
  const maxRoi = Math.max(...rois);

  return deals
    .filter((d) => d.status === 'Open')
    .map((deal) => ({
      ...deal,
      matchScore: computeScore(deal, investor, minRoi, maxRoi),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}
