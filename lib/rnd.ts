export interface RnDPaper {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  status: 'published' | 'under-review' | 'preprint';
  abstract: string;
  tags: string[];
  links: { label: string; url: string }[];
}

export interface RoadmapItem {
  title: string;
  detail: string;
  done?: boolean;
}

export interface RoadmapQuarter {
  id: string;
  label: string;
  theme: string;
  status: 'complete' | 'active' | 'planned';
  items: RoadmapItem[];
}

export const RND_GITHUB = {
  repoName: 'kingdomtradex/trading-engine',
  url: 'https://github.com/kingdomtradex/trading-engine',
  language: 'Python 3.11',
  license: 'Source-available (BSL-1.1)',
  version: 'v0.9.2-shell',
  description:
    'The reference implementation of the KingdomTradeX execution layer: signal ingestion, risk-gated position sizing, and tier-aware payout accounting. The public shell exposes the interfaces without proprietary alpha.',
  features: [
    'Event-driven bar pipeline with pluggable data adapters',
    'Risk engine: per-position caps, daily drawdown halt, tier payout guards',
    'Deterministic backtest harness with slippage + fee modeling',
    'Signed webhook contracts mirroring the production deposit pipeline',
  ],
  codeSnippet: [
    'class Signal(Enum):',
    '    BUY  = "buy"',
    '    SELL = "sell"',
    '',
    'class Strategy(ABC):',
    '    """Override on_bar to emit trading signals."""',
    '    @abstractmethod',
    '    def on_bar(self, bar: Bar) -> list[Signal]: ...',
    '',
    'class RiskEngine:',
    '    max_position_pct    = 0.02    # 2% of basis per position',
    '    daily_drawdown_halt = 0.10    # halt trading at -10% day',
    '    tier_payout_rates   = (0.0025, 0.005, 0.0075)',
  ].join('\n'),
};

export const RND_PAPERS: RnDPaper[] = [
  {
    id: 'p1',
    title: 'Adaptive Ensemble Execution for Cross-Asset Retail Portfolios',
    authors: ['KingdomTradeX Research'],
    venue: 'Journal of Computational Finance (under review)',
    year: 2026,
    status: 'under-review',
    abstract:
      'We study execution quality for small-capitalization multi-asset portfolios and propose an adaptive ensemble that blends momentum, mean-reversion, and volatility-targeting sub-strategies. On 2019-2025 cross-asset data the ensemble reduces tail drawdown versus single-strategy baselines while preserving daily accrual stability.',
    tags: ['execution', 'ensembles', 'risk'],
    links: [
      { label: 'Preprint', url: '#' },
      { label: 'DOI', url: '#' },
    ],
  },
  {
    id: 'p2',
    title: 'Stewardship-Constrained Portfolio Optimization: A Faith-Aligned Framework',
    authors: ['KingdomTradeX Research'],
    venue: 'Preprint',
    year: 2026,
    status: 'preprint',
    abstract:
      'We formalize stewardship constraints — drawdown limits, liquidity reserves, and transparent fee disclosure — as first-class terms in a convex portfolio optimization. The framework yields closed-form payout schedules compatible with tiered daily accrual products.',
    tags: ['optimization', 'compliance', 'ethics'],
    links: [{ label: 'Preprint', url: '#' }],
  },
  {
    id: 'p3',
    title: 'Latency-Aware Settlement Routing for Stablecoin Payment Rails',
    authors: ['KingdomTradeX Research'],
    venue: 'Preprint',
    year: 2025,
    status: 'preprint',
    abstract:
      'We measure settlement latency and fee variance across TRC-20, BEP-20, and ERC-20 stablecoin rails and present a routing policy that minimizes expected settlement cost under confirmation-time constraints. Results inform the dual-rail (TRC-20/BEP-20) deployment used in production.',
    tags: ['payments', 'stablecoins', 'routing'],
    links: [{ label: 'Preprint', url: '#' }],
  },
];

export const RND_ROADMAP: RoadmapQuarter[] = [
  {
    id: 'q3-26',
    label: 'Q3 2026',
    theme: 'Financial Engine Hardening',
    status: 'complete',
    items: [
      { title: 'Deposit → split → accrual pipeline', detail: '6/6 automated pipeline tests passing', done: true },
      { title: 'AI Engine reactor dashboard', detail: 'Live simulation locked to tier math', done: true },
      { title: 'Instant engine auto-forward', detail: 'USDT TRC-20/BEP-20 to self-custody', done: true },
      { title: 'Compliance & legal suite', detail: 'ToS, Privacy, Trading Agreement, MSB page', done: true },
    ],
  },
  {
    id: 'q4-26',
    label: 'Q4 2026',
    theme: 'Live Launch & Mobile',
    status: 'active',
    items: [
      { title: 'VPS production deployment', detail: 'Production mode + SSL + live webhooks' },
      { title: 'Live payment verification', detail: 'Real $100 deposit → split → payout test' },
      { title: 'Android application', detail: 'Expo client over the hardened API' },
      { title: 'Third-party security review', detail: 'Payout paths + webhook signing audit' },
    ],
  },
  {
    id: 'q1-27',
    label: 'Q1 2027',
    theme: 'Trading Engine v2',
    status: 'planned',
    items: [
      { title: 'Live engine integration', detail: 'Production strategies replace simulation' },
      { title: 'iOS application', detail: 'Shared Expo codebase' },
      { title: 'Verified performance reporting', detail: 'Monthly attested accrual reports' },
    ],
  },
  {
    id: 'q2-27',
    label: 'Q2 2027',
    theme: 'Institutional & Research',
    status: 'planned',
    items: [
      { title: 'Partner API', detail: 'Signed integrations for pastors & creators' },
      { title: 'First public paper publication', detail: 'Peer-reviewed venue target' },
      { title: 'Open-source backtest harness', detail: 'Community-auditable risk engine' },
    ],
  },
];
