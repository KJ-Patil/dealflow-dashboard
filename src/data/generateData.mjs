/**
 * Seeded data generator for the investor dashboard.
 * Run: node src/data/generateData.mjs
 *
 * Produces deals.json, investors.json, investments.json in this directory.
 * Uses Mulberry32 PRNG so output is deterministic for any given SEED.
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED = 42;
const DEAL_COUNT = 80;
const INVESTOR_COUNT = 15;

// ─── Seeded PRNG (Mulberry32) ────────────────────────────────────────────────

function createRng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = createRng(SEED);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN(arr, n) {
  const pool = [...arr];
  const result = [];
  for (let i = 0; i < Math.min(n, pool.length); i++) {
    const idx = Math.floor(rand() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 1) {
  return Number((rand() * (max - min) + min).toFixed(decimals));
}

function roundTo(n, step) {
  return Math.round(n / step) * step;
}

function padId(prefix, n) {
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

function isoDate(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function randomDate(startYear, startMonth, endYear, endMonth) {
  const start = new Date(startYear, startMonth - 1, 1).getTime();
  const end = new Date(endYear, endMonth - 1, 28).getTime();
  const ts = start + rand() * (end - start);
  const d = new Date(ts);
  return isoDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

// ─── Constants ───────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Fintech', 'HealthTech', 'EdTech', 'AgriTech', 'CleanTech',
  'SaaS', 'E-Commerce', 'Logistics', 'PropTech', 'InsurTech',
];

const STAGES = ['Seed', 'Pre-Series A', 'Series A', 'Series B', 'Series C', 'Growth'];
const RISK_LEVELS = ['Low', 'Medium', 'High'];
const STATUSES = ['Open', 'Funded', 'Closed'];

const LOCATIONS = [
  'Mumbai', 'Bangalore', 'Delhi NCR', 'Hyderabad', 'Pune',
  'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi',
  'Noida', 'Gurugram',
];

const COMPANY_NAMES = {
  Fintech: ['PaySetu', 'RupeeFlo', 'CashVault', 'FinZen', 'MoneyMint', 'LendKaro', 'WealthGrid', 'NiveshPro', 'CredBridge', 'DigiPay'],
  HealthTech: ['MedPulse', 'CareNest', 'VitalTrack', 'HealthBridge', 'DocConnect', 'PharmaEase', 'AyurTech', 'WellnessIQ', 'CureLink', 'DigiCare'],
  EdTech: ['LearnSphere', 'SkillForge', 'PathShala', 'VidyaAI', 'GuruCool', 'ClassBridge', 'ExamPilot', 'StudyMate', 'ShikshaLab', 'CourseHive'],
  AgriTech: ['FarmWise', 'KhetConnect', 'AgriPulse', 'CropSync', 'KisaanTech', 'HarvestIQ', 'SoilSense', 'MandiDirect'],
  CleanTech: ['GreenGrid', 'SolarNova', 'EcoCharge', 'CleanVolt', 'BioEnergy', 'WindHarvest', 'GreenMile', 'AquaPure'],
  SaaS: ['CloudNine', 'DataForge', 'SyncFlow', 'PipelineIQ', 'CodeCraft', 'APIStack', 'DevOpsHub', 'AnalytiQ'],
  'E-Commerce': ['ShopDesi', 'BazaarNow', 'DesiMart', 'QuickCart', 'UrbanHaat', 'KiranaMart', 'StyleLoom', 'TradeBox'],
  Logistics: ['FleetTrack', 'DeliverEase', 'CargoSync', 'RouteOptim', 'LastMileAI', 'PackTrack', 'FreightBridge', 'WareHaus'],
  PropTech: ['NestFinder', 'PropertyPulse', 'GharSearch', 'RealtyAI', 'PlotBuddy', 'RentEase', 'BuildTech', 'SpaceMatch'],
  InsurTech: ['CoverSmart', 'InsureWise', 'RiskShield', 'PolicyPilot', 'ClaimFast', 'SafeGuardAI', 'InsureBuddy', 'LifeShield'],
};

const TAGLINES = {
  Fintech: [
    'Making digital payments accessible to every Indian',
    'AI-powered lending for the underbanked',
    'Democratizing wealth management for millennials',
    'Next-gen payment infrastructure for businesses',
    'Bridging the credit gap for Indian MSMEs',
    'Smart savings platform for young professionals',
    'Instant cross-border remittances at zero cost',
    'Embedded finance APIs for modern apps',
    'Micro-investment platform for first-time investors',
    'Real-time fraud detection for digital commerce',
  ],
  HealthTech: [
    'Bringing quality healthcare to rural India',
    'AI diagnostics that save lives and time',
    'Connecting patients with specialists instantly',
    'Making preventive health mainstream',
    'Digital pharmacy with doorstep delivery',
    'Ayurveda meets modern medicine with data',
    'Wearable health monitoring for chronic conditions',
    'Telemedicine platform for tier-2 and tier-3 cities',
    'Streamlining hospital operations with AI',
    'Mental health support accessible to all Indians',
  ],
  EdTech: [
    'Personalised learning paths powered by AI',
    'Skill-based education for the future workforce',
    'Vernacular learning for Bharat',
    'Making competitive exam prep affordable',
    'Interactive classrooms for K-12 students',
    'Bridging the skill gap with micro-credentials',
    'AI tutoring that adapts to every student',
    'Gamified learning for young minds',
    'Upskilling platform for working professionals',
    'Live cohort-based courses from industry experts',
  ],
  AgriTech: [
    'Empowering farmers with data-driven decisions',
    'Farm-to-fork supply chain transparency',
    'Precision agriculture for Indian farmlands',
    'Direct market access for small farmers',
    'IoT-powered crop monitoring at scale',
    'Soil health analytics for better yields',
    'Agricultural drone services for modern farming',
    'Cold chain logistics for perishable produce',
  ],
  CleanTech: [
    'Affordable solar energy for Indian homes',
    'EV charging network for urban India',
    'Carbon credit marketplace for businesses',
    'Making industrial processes zero-emission',
    'Smart grid solutions for renewable energy',
    'Wind energy optimization with machine learning',
    'Last-mile green delivery infrastructure',
    'Water purification tech for rural communities',
  ],
  SaaS: [
    'No-code workflow automation for SMBs',
    'Data analytics platform built for India',
    'DevOps toolchain for fast-growing startups',
    'Customer engagement platform with vernacular support',
    'API-first infrastructure for developers',
    'Cloud cost optimization powered by AI',
    'Collaborative project management reimagined',
    'Intelligent document processing at scale',
  ],
  'E-Commerce': [
    'Hyper-local commerce for every neighbourhood',
    'Social commerce platform for creators',
    'B2B marketplace connecting manufacturers to retailers',
    'Quick commerce for daily essentials',
    'Fashion marketplace celebrating Indian designers',
    'Digital storefront for local kirana shops',
    'Sustainable fashion marketplace for conscious buyers',
    'Cross-border trade platform for Indian artisans',
  ],
  Logistics: [
    'Smart fleet management for Indian roads',
    'Same-day delivery infrastructure at scale',
    'AI-optimised route planning for logistics',
    'Warehousing solutions for D2C brands',
    'Drone delivery for hard-to-reach areas',
    'Real-time package tracking and analytics',
    'Freight marketplace connecting shippers and carriers',
    'Automated warehouse operations with robotics',
  ],
  PropTech: [
    'AI-powered property valuation for buyers',
    'End-to-end rental management platform',
    'Virtual property tours with AR technology',
    'Fractional real estate investment for everyone',
    'Smart home automation for Indian apartments',
    'Commercial real estate analytics platform',
    'Construction project management simplified',
    'Co-living spaces designed for young professionals',
  ],
  InsurTech: [
    'Insurance in 60 seconds with zero paperwork',
    'Parametric insurance for climate risks',
    'Health insurance that rewards healthy living',
    'Micro-insurance for gig economy workers',
    'Claims processing with AI in under 10 minutes',
    'Cyber insurance for small businesses',
    'Group insurance platform for startups',
    'Life insurance with transparent pricing',
  ],
};

// Stage-based parameter ranges: [min, max] in ₹
// All monetary values in absolute rupees
const L = 100_000;      // 1 Lakh
const Cr = 10_000_000;  // 1 Crore

const STAGE_CONFIG = {
  Seed:           { valuation: [1*Cr, 10*Cr],    target: [50*L, 2*Cr],     revenue: [0, 50*L],       minInvest: [1*L, 10*L],    employees: [5, 20],    burn: [5*L, 20*L],   roi: [18, 35], growth: [10, 50],  ebitda: [-40, 5],   runway: [6, 18]  },
  'Pre-Series A': { valuation: [5*Cr, 25*Cr],    target: [1*Cr, 5*Cr],     revenue: [20*L, 2*Cr],    minInvest: [5*L, 25*L],    employees: [15, 50],   burn: [15*L, 40*L],  roi: [15, 30], growth: [20, 80],  ebitda: [-30, 10],  runway: [8, 20]  },
  'Series A':     { valuation: [20*Cr, 100*Cr],  target: [5*Cr, 20*Cr],    revenue: [1*Cr, 10*Cr],   minInvest: [10*L, 50*L],   employees: [30, 150],  burn: [30*L, 80*L],  roi: [12, 25], growth: [30, 100], ebitda: [-20, 15],  runway: [10, 24] },
  'Series B':     { valuation: [80*Cr, 500*Cr],  target: [15*Cr, 60*Cr],   revenue: [5*Cr, 40*Cr],   minInvest: [25*L, 1*Cr],   employees: [100, 500], burn: [60*L, 2*Cr],  roi: [10, 22], growth: [25, 70],  ebitda: [-10, 20],  runway: [12, 30] },
  'Series C':     { valuation: [300*Cr, 2000*Cr],target: [40*Cr, 150*Cr],  revenue: [20*Cr, 100*Cr], minInvest: [50*L, 2*Cr],   employees: [300, 2000],burn: [1*Cr, 5*Cr],  roi: [8, 18],  growth: [15, 50],  ebitda: [0, 25],    runway: [14, 36] },
  Growth:         { valuation: [1000*Cr,5000*Cr],target: [100*Cr, 500*Cr], revenue: [50*Cr, 300*Cr], minInvest: [1*Cr, 5*Cr],   employees: [500, 5000],burn: [2*Cr, 10*Cr], roi: [5, 15],  growth: [10, 40],  ebitda: [5, 30],    runway: [18, 48] },
};

const RISK_FACTOR_POOL = {
  Market: [
    'Limited market penetration in tier-2/3 cities',
    'Market size dependent on regulatory changes',
    'Customer acquisition cost trending upward',
    'Market dominated by established incumbents',
    'Seasonal demand fluctuations in core segment',
  ],
  Regulatory: [
    'Pending regulatory approval for key product',
    'New compliance requirements may increase costs',
    'Data privacy regulations could impact model',
    'Licensing requirements under government review',
    'Cross-border transaction regulations evolving',
  ],
  Technology: [
    'Core platform requires scaling investment',
    'Dependency on third-party APIs for critical functions',
    'AI model accuracy needs continued improvement',
    'Legacy system migration partially complete',
    'Cybersecurity infrastructure needs strengthening',
  ],
  Team: [
    'Key leadership position currently unfilled',
    'High attrition rate in engineering team',
    'Limited experience in target market segment',
    'Founding team concentrated in single domain',
    'Board composition lacks sector expertise',
  ],
  Financial: [
    'Revenue concentrated among top 3 clients',
    'Burn rate exceeds initial projections',
    'Unit economics not yet positive',
    'Working capital cycle longer than average',
    'Currency exposure on international revenue',
  ],
  Competition: [
    'Well-funded competitor launched similar product',
    'Price pressure in commoditised segments',
    'Low barriers to entry in core market',
    'Large tech company exploring adjacent space',
    'Open-source alternatives gaining traction',
  ],
  Execution: [
    'Geographic expansion timeline aggressive',
    'Product-market fit not fully validated',
    'Supply chain depends on single vendor',
    'Go-to-market strategy untested in new regions',
    'Operational scaling challenges in last mile',
  ],
};

const RISK_CATEGORIES = Object.keys(RISK_FACTOR_POOL);

// ─── Investor names ──────────────────────────────────────────────────────────

const INVESTOR_TEMPLATES = [
  { name: 'Rajesh Mehta',            type: 'Angel' },
  { name: 'Priya Sharma',            type: 'Angel' },
  { name: 'Vikram Reddy',            type: 'Angel' },
  { name: 'Anita Deshmukh',          type: 'Angel' },
  { name: 'Suresh Gupta',            type: 'Angel' },
  { name: 'Vanguard India Ventures', type: 'VC' },
  { name: 'Nexgen Capital Fund',     type: 'VC' },
  { name: 'Pinnacle Venture Partners',type: 'VC' },
  { name: 'BlueRock Ventures',       type: 'VC' },
  { name: 'Summit India PE',         type: 'PE' },
  { name: 'Meridian Capital Group',  type: 'PE' },
  { name: 'Crestview India Fund',    type: 'PE' },
  { name: 'Kapoor Family Office',    type: 'Family Office' },
  { name: 'Singhania Investments',   type: 'Family Office' },
  { name: 'Thapar Capital',          type: 'Family Office' },
];

const INVESTOR_BUDGET = {
  Angel:          { min: [5*L, 15*L],   max: [25*L, 75*L] },
  VC:             { min: [1*Cr, 5*Cr],  max: [20*Cr, 75*Cr] },
  PE:             { min: [10*Cr, 30*Cr],max: [100*Cr, 300*Cr] },
  'Family Office':{ min: [50*L, 5*Cr],  max: [25*Cr, 100*Cr] },
};

// ─── Deal generation ─────────────────────────────────────────────────────────

const usedNames = new Set();

function generateDeal(index) {
  const industry = INDUSTRIES[index % INDUSTRIES.length];
  const stage = pick(STAGES);
  const cfg = STAGE_CONFIG[stage];

  // Pick a unique company name
  const namesForIndustry = COMPANY_NAMES[industry];
  let name;
  for (const candidate of namesForIndustry) {
    if (!usedNames.has(candidate)) {
      name = candidate;
      break;
    }
  }
  if (!name) {
    name = `${pick(namesForIndustry)}${randInt(2, 9)}`;
  }
  usedNames.add(name);

  const risk = pick(RISK_LEVELS);
  const roi = randFloat(cfg.roi[0], cfg.roi[1], 1);
  const targetAmount = roundTo(randInt(cfg.target[0], cfg.target[1]), L);
  const status = pick(STATUSES);

  let raisedAmount;
  if (status === 'Funded') {
    raisedAmount = targetAmount;
  } else if (status === 'Closed') {
    raisedAmount = roundTo(randInt(Math.floor(targetAmount * 0.1), Math.floor(targetAmount * 0.6)), L);
  } else {
    raisedAmount = roundTo(randInt(Math.floor(targetAmount * 0.2), Math.floor(targetAmount * 0.9)), L);
  }

  const createdAt = randomDate(2024, 10, 2026, 8);
  const views = randInt(50, 5000);
  const founded = randInt(2015, 2024);

  // Financials
  const revenue = roundTo(randInt(cfg.revenue[0], cfg.revenue[1]), L);
  const growth = randFloat(cfg.growth[0], cfg.growth[1], 1);
  const ebitdaMargin = randFloat(cfg.ebitda[0], cfg.ebitda[1], 1);
  const burn = roundTo(randInt(cfg.burn[0], cfg.burn[1]), L);
  const valuation = roundTo(randInt(cfg.valuation[0], cfg.valuation[1]), L);
  const runway = randInt(cfg.runway[0], cfg.runway[1]);

  // ROI projection: 5 years, cumulative %
  const baseRate = roi / 100;
  const conservativeRate = baseRate * randFloat(0.55, 0.75, 2);
  const optimisticRate = baseRate * randFloat(1.3, 1.6, 2);
  const roiProjection = {
    conservative: [],
    base: [],
    optimistic: [],
  };
  for (let y = 1; y <= 5; y++) {
    roiProjection.conservative.push(Number(((Math.pow(1 + conservativeRate, y) - 1) * 100).toFixed(1)));
    roiProjection.base.push(Number(((Math.pow(1 + baseRate, y) - 1) * 100).toFixed(1)));
    roiProjection.optimistic.push(Number(((Math.pow(1 + optimisticRate, y) - 1) * 100).toFixed(1)));
  }

  // Risk factors: 3-5 per deal
  const factorCount = randInt(3, 5);
  const categories = pickN(RISK_CATEGORIES, factorCount);
  const riskFactors = categories.map((cat) => ({
    category: cat,
    score: randInt(2, 9),
    note: pick(RISK_FACTOR_POOL[cat]),
  }));

  return {
    id: padId('deal', index + 1),
    name,
    tagline: pick(TAGLINES[industry]),
    industry,
    stage,
    risk,
    roi,
    minInvestment: roundTo(randInt(cfg.minInvest[0], cfg.minInvest[1]), L),
    targetAmount,
    raisedAmount,
    status,
    createdAt,
    views,
    company: {
      name: `${name} Pvt. Ltd.`,
      founded,
      location: pick(LOCATIONS),
      employees: randInt(cfg.employees[0], cfg.employees[1]),
    },
    financials: { revenue, growth, ebitdaMargin, burn, valuation, runway },
    roiProjection,
    riskFactors,
  };
}

// ─── Investor generation ─────────────────────────────────────────────────────

function generateInvestor(index) {
  const template = INVESTOR_TEMPLATES[index];
  const { type } = template;
  const budgetCfg = INVESTOR_BUDGET[type];

  return {
    id: padId('inv', index + 1),
    name: template.name,
    type,
    riskAppetite: pick(RISK_LEVELS),
    budgetMin: roundTo(randInt(budgetCfg.min[0], budgetCfg.min[1]), L),
    budgetMax: roundTo(randInt(budgetCfg.max[0], budgetCfg.max[1]), L),
    preferredIndustries: pickN(INDUSTRIES, randInt(2, 4)),
  };
}

// ─── Investment generation ───────────────────────────────────────────────────

function generateInvestments(deals, investors) {
  const investments = [];
  let invIdx = 0;

  for (const deal of deals) {
    if (deal.raisedAmount === 0) continue;

    // 1-4 investors per deal
    const investorCount = Math.min(randInt(1, 4), investors.length);
    const selectedInvestors = pickN(investors, investorCount);

    let remaining = deal.raisedAmount;

    for (let i = 0; i < selectedInvestors.length; i++) {
      const isLast = i === selectedInvestors.length - 1;
      const amount = isLast
        ? remaining
        : roundTo(Math.floor(remaining * randFloat(0.2, 0.6, 2)), L);

      if (amount <= 0) continue;
      remaining -= amount;

      // Investment date: between deal creation and Sep 2026
      const dealDate = new Date(deal.createdAt);
      const startYear = dealDate.getFullYear();
      const startMonth = dealDate.getMonth() + 2; // at least 1 month after creation
      const date = randomDate(
        startYear,
        Math.min(startMonth, 12),
        2026,
        9,
      );

      investments.push({
        id: padId('invest', ++invIdx),
        investorId: selectedInvestors[i].id,
        dealId: deal.id,
        amount,
        date,
      });
    }
  }

  return investments;
}

// ─── Generate and write ──────────────────────────────────────────────────────

const deals = Array.from({ length: DEAL_COUNT }, (_, i) => generateDeal(i));
const investors = Array.from({ length: INVESTOR_COUNT }, (_, i) => generateInvestor(i));
const investments = generateInvestments(deals, investors);

const write = (filename, data) => {
  const path = join(__dirname, filename);
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  ${filename}: ${data.length} records`);
};

console.log('Generating data (seed=%d)...', SEED);
write('deals.json', deals);
write('investors.json', investors);
write('investments.json', investments);
console.log('Done.');
