# InvestHub — Investor & Corporate Dashboard

A full-featured investment analytics and deal management dashboard built for the **Full Stack Developer – 3D Bharat** hiring assessment.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.4.1 (App Router, Turbopack) |
| Language | TypeScript (strict mode, zero `any`) |
| State | Redux Toolkit + react-redux |
| Charts | Recharts 3 (lazy-loaded, SSR-disabled) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Deployment | Vercel-ready (`next build` produces static + PPR output) |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── types/              # Shared TypeScript interfaces
│   └── index.ts
├── data/               # Static JSON datasets + generator
│   ├── deals.json      # 80 deals
│   ├── investors.json  # 15 investors
│   ├── investments.json # 202 investments
│   └── generateData.mjs # Seeded PRNG generator (node src/data/generateData.mjs)
├── services/           # Simulated API layer (no raw JSON imports in components)
│   ├── delay.ts        # simulatedFetch: 300-800ms delay, ~4% failure, AbortSignal
│   ├── dealService.ts  # queryDeals (filter/sort/paginate), getDealById, getAllDeals
│   ├── investorService.ts
│   ├── investmentService.ts
│   └── corporateService.ts
├── store/              # Redux Toolkit state management
│   ├── index.ts        # makeStore() factory for SSR safety
│   ├── hooks.ts        # Typed useAppSelector, useAppDispatch, useAppStore
│   ├── dealsSlice.ts   # Filters, cache (60s TTL), stale-request tracking
│   ├── dealDetailsSlice.ts
│   ├── investorSlice.ts
│   ├── corporateSlice.ts
│   ├── interestsSlice.ts # Saved deals (localStorage-persisted)
│   ├── uiSlice.ts      # Theme + error rate
│   └── listenerMiddleware.ts # Side effects: localStorage sync, theme toggle
├── hooks/              # Custom React hooks
│   ├── useDebounce.ts  # Generic debounce (350ms for search)
│   ├── useDealExplorer.ts # Wires filters → query → dispatch, AbortSignal cleanup
│   ├── useRecommendations.ts # Memoized scoring via getRecommendations()
│   └── useInterests.ts # toggle/remove/clear/isInterested
├── utils/
│   ├── format.ts       # formatINR (₹ lakh/crore), formatPercent, formatCompact
│   ├── queryKey.ts     # Stable JSON key for query cache
│   └── recommendation.ts # Score 0-100 with memoized Map cache
├── components/         # Shared UI components
│   ├── Providers.tsx   # Redux Provider + localStorage hydration
│   ├── Navbar.tsx      # Responsive nav, theme toggle, error rate slider
│   ├── DealCard.tsx    # React.memo deal card with bookmark
│   ├── StatCard.tsx    # Metric card with optional change indicator
│   ├── Skeleton.tsx    # 5 skeleton variants
│   ├── ErrorState.tsx  # Error display with retry
│   ├── EmptyState.tsx  # Empty state with optional action
│   └── charts/         # Recharts wrappers
│       ├── palette.ts  # Color-blind-safe palette (light/dark)
│       ├── LineChart.tsx
│       ├── BarChart.tsx
│       ├── PieChart.tsx
│       ├── ScatterChart.tsx
│       └── index.tsx   # Lazy exports via next/dynamic (ssr: false)
└── features/           # Page-level feature components
    ├── dashboard/DashboardPage.tsx
    ├── deals/DealExplorer.tsx
    ├── deals/DealDetails.tsx
    ├── investments/InvestmentsPage.tsx
    └── corporate/CorporatePage.tsx

app/
├── layout.tsx          # Root layout: fonts, dark-mode script, Suspense boundary
├── globals.css         # Full design system with CSS custom properties
├── page.tsx            # / → DashboardPage
├── deals/
│   ├── page.tsx        # /deals → DealExplorer
│   └── [id]/page.tsx   # /deals/:id → DealDetails (PPR dynamic route)
├── investments/
│   └── page.tsx        # /investments → InvestmentsPage
└── corporate/
    └── page.tsx        # /corporate → CorporatePage
```

## Architecture & Data Flow

```
User Action → Component → Hook/Dispatch → Redux Thunk → Service Layer → JSON Data
                                              ↓
                                         Slice Reducer → Store → useAppSelector → Re-render
```

1. **Components** never import JSON data directly — all data flows through the service layer.
2. **Services** wrap sync data access in `simulatedFetch()`, adding random delay (300-800ms), configurable error rate (~4%), and AbortSignal support.
3. **Redux Thunks** manage async state (loading/fulfilled/rejected) and handle caching, stale-request IDs, and conditional fetching.
4. **Listener Middleware** handles side effects: persisting interests and theme to localStorage, syncing error rate to the service layer, toggling the `.dark` CSS class.

## Key Features

### Dashboard (`/`)
- Portfolio stats: total invested, active deals, weighted avg ROI
- Investment growth line chart (cumulative)
- Industry distribution donut chart
- Risk vs ROI scatter plot
- Top 6 personalized deal recommendations with match scores

### Deal Explorer (`/deals`)
- Multi-filter: industry, risk, status (toggle chips), ROI range, investment range
- Debounced search (350ms)
- 6 sort options
- Paginated grid (12 per page) with ellipsis pagination
- Previous results stay visible during loading (opacity overlay)
- Query cache with 60-second TTL

### Deal Details (`/deals/:id`)
- 3-tab layout: Overview, ROI Projections, Risk Analysis
- Overview: company info, 8 financial stat cards, funding progress bar
- Projections: 3-scenario line chart + 5-year summary
- Risk: bar chart + expandable accordion with score badges
- Save to interests button

### Investments (`/investments`)
- Saved deals grid with remove/clear actions
- Holdings table: all investments in saved deals, sorted by date
- Total invested summary

### Corporate (`/corporate`)
- Company selector dropdown (80 companies)
- 4 stat cards with icons: funding, investors, views, conversion rate
- Funding trend bar chart (monthly)
- Investor activity line chart (monthly)
- Company summary panel

## Performance Optimizations

| Technique | Where |
|-----------|-------|
| `React.memo` | DealCard |
| Lazy loading (`next/dynamic`, `ssr: false`) | All chart components |
| Debounced search (350ms) | DealExplorer via useDebounce |
| Query cache (60s TTL) | dealsSlice |
| Stale request tracking | dealsSlice (latestRequestId) |
| Conditional fetch | fetchAllDeals, fetchAllInvestments (skip if loaded) |
| Memoized recommendations | Map cache keyed by `dealId:investorId` |
| AbortSignal cleanup | useDealExplorer (abort on filter change) |
| CSS custom properties | Single paint for theme switch (no Tailwind re-class) |
| Inline dark-mode script | Prevents FOUC on page load |

## Recommendation Engine

Score formula (0-100):

```
score = riskMatch × 0.30
      + industryMatch × 0.25
      + roiAttractiveness × 0.25
      + budgetCompatibility × 0.20
```

- **riskMatch**: 1.0 if deal risk equals investor appetite, -0.5 per level difference
- **industryMatch**: 1.0 if deal industry is in investor preferences, 0 otherwise
- **roiAttractiveness**: normalized ROI within dataset min/max
- **budgetCompatibility**: 1.0 if min investment ≤ budget max, degrades linearly above

Results are memoized in a `Map<string, number>` keyed by `${dealId}:${investorId}`.

## Dark Mode

- CSS custom properties on `:root` and `.dark` selector
- Tailwind v4 `@custom-variant dark (&:where(.dark, .dark *))` for class-based switching
- Inline `<script>` reads `localStorage('theme')` before first paint — zero flash
- `suppressHydrationWarning` on `<html>` for server/client class mismatch
- Listener middleware syncs Redux state, localStorage, and DOM class

## Simulated Backend

All backend behavior is simulated in the frontend:
- `simulatedFetch()` adds 300-800ms random delay to every "API call"
- ~4% random failure rate (configurable 0-50% via navbar slider)
- AbortSignal support for request cancellation
- Components handle loading, error, and empty states

## Data Generation

Mock data is generated with a seeded PRNG (Mulberry32, seed=42) for deterministic, reproducible output:

```bash
node src/data/generateData.mjs
```

- 80 deals with stage-consistent financials (Seed companies have small valuations, Growth-stage have large)
- 15 investors (5 Angel, 4 VC, 3 PE, 3 Family Office)
- 202 investments where amounts sum to each deal's `raisedAmount`
- ROI projections compound over 5 years across 3 scenarios
- 3-5 risk factors per deal

## Deploy

```bash
# Vercel (recommended)
npx vercel

# Or any Node.js host
npm run build
npm start
```
