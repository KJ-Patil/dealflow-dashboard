export type RiskLevel = 'Low' | 'Medium' | 'High';

export type Industry =
  | 'Fintech'
  | 'HealthTech'
  | 'EdTech'
  | 'AgriTech'
  | 'CleanTech'
  | 'SaaS'
  | 'E-Commerce'
  | 'Logistics'
  | 'PropTech'
  | 'InsurTech';

export type Stage =
  | 'Seed'
  | 'Pre-Series A'
  | 'Series A'
  | 'Series B'
  | 'Series C'
  | 'Growth';

export type DealStatus = 'Open' | 'Funded' | 'Closed';

export type InvestorType = 'Angel' | 'VC' | 'PE' | 'Family Office';

export type SortOption =
  | 'bestMatch'
  | 'roi'
  | 'risk'
  | 'amount'
  | 'newest'
  | 'name';

export interface Company {
  name: string;
  founded: number;
  location: string;
  employees: number;
}

export interface Financials {
  revenue: number;
  growth: number;
  ebitdaMargin: number;
  burn: number;
  valuation: number;
  runway: number;
}

export interface RoiProjection {
  conservative: number[];
  base: number[];
  optimistic: number[];
}

export interface RiskFactor {
  category: string;
  score: number;
  note: string;
}

export interface Deal {
  id: string;
  name: string;
  tagline: string;
  industry: Industry;
  stage: Stage;
  risk: RiskLevel;
  roi: number;
  minInvestment: number;
  targetAmount: number;
  raisedAmount: number;
  status: DealStatus;
  createdAt: string;
  views: number;
  company: Company;
  financials: Financials;
  roiProjection: RoiProjection;
  riskFactors: RiskFactor[];
}

export interface Investor {
  id: string;
  name: string;
  type: InvestorType;
  riskAppetite: RiskLevel;
  budgetMin: number;
  budgetMax: number;
  preferredIndustries: Industry[];
}

export interface Investment {
  id: string;
  investorId: string;
  dealId: string;
  amount: number;
  date: string;
}

export interface DealFilters {
  search?: string;
  industry?: Industry[];
  risk?: RiskLevel[];
  roiMin?: number;
  roiMax?: number;
  investmentMin?: number;
  investmentMax?: number;
  status?: DealStatus[];
}

export interface DealQuery {
  filters: DealFilters;
  sort: SortOption;
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
