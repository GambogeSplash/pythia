# CLAUDE.md — Pythia · Full Product Brief
**Version:** March 2026 | Read this at the start of every session. Single source of truth.

---

## What is Pythia?

Pythia is a **market intelligence and trading automation platform for prediction markets** — the Bloomberg Terminal meets Polymarket, built for retail traders and serious analysts who deserve quant-grade tools, but currently have none.

**Tagline:** *The quant desk for prediction markets. Built for everyone.*

**Core value props:**
- Enterprise-level analytics — signal heatmaps, trader intelligence, wash-trade filtering, insider detection — democratized for retail
- Agentic bots — arbitrage, alpha hunting, portfolio management — previously only available to quant desks
- Market making democratized — every user becomes a liquidity provider
- Modular dashboard — fully customizable; users pin only what matters to their strategy
- Cross-venue aggregation — Polymarket, Kalshi, Opinion Labs, Limitless, Myriad — one unified terminal

**The opportunity:**
Prediction markets hit $63.5B in total volume in 2025 (4x YoY growth), crossed $13B in monthly volume by end of year, and are entering 2026 with institutional money (ICE put $2B into Polymarket; Kalshi raised at an $11B valuation), mainstream distribution (CNN, CNBC, Robinhood partnerships), and 170+ third-party ecosystem tools already building around Polymarket alone. The space is massive, fast-moving, and the analytics/intelligence layer is still severely underbuilt relative to traditional financial markets.

---

## Brand

**Name origin:** Oracle of Delphi — foresight, data-driven prophecy, truth-seeking through collective intelligence.

**Tagline directions:**
- *"The quant desk for prediction markets."*
- *"Intelligence for the information economy."*
- *"Every signal. Every edge. Every market."*

**Style keywords:** Modern minimalism · Data-dense · Elegant intelligence · Futuristic precision · Terminal-native

**Color palette:**
```
--pythia-green:       #00FF85   /* Primary signal — intelligence, edge, foresight */
--pythia-black:       #080808   /* Base background */
--surface-1:          #0D0D0D   /* Card backgrounds */
--surface-2:          #111111   /* Elevated surfaces */
--surface-3:          #161616   /* Modals, dropdowns */
--border-subtle:      #1E1E1E
--border-default:     #2A2A2A
--text-primary:       #F0F0F0
--text-secondary:     #888888
--text-muted:         #444444
--signal-green:       #00FF85   /* Positive / bull */
--signal-red:         #FF3B3B   /* Negative / bear / warning */
--signal-amber:       #FFB800   /* Caution / neutral / thin liquidity */
--signal-blue:        #4DA6FF   /* Informational / institutional */
--signal-purple:      #9B59FF   /* AI-generated / Pythia Score */
```

**Mood:** Black terminal with flashes of green signal. Think Reuters Eikon meets a crypto quant desk. Not a sportsbook. Not a casino. A data engine.

**Typography:**
- Display / data numbers: `JetBrains Mono` or `IBM Plex Mono` — monospace, tabular nums, data-native
- UI / headings: `Syne` — geometric, clean authority
- Body copy: `DM Sans` — readable, neutral
- Rule: ALL market data numbers must use monospace + `font-variant-numeric: tabular-nums`

**Design references:**
- [takeprofit.com/platform](https://takeprofit.com/platform) — widget modularity, data density, dark terminal
- [verso.trading](https://verso.trading) — Bloomberg-style institutional interface (direct competitor)
- [polymarketanalytics.com](https://polymarketanalytics.com) — trader profiles, market data layout
- Reuters Eikon / Bloomberg Terminal — information hierarchy, density without clutter

---

## Market Context (March 2026)

### Scale
- $63.5B total prediction market volume in 2025 (up from $15.8B in 2024)
- $13B+ monthly notional volume sustained as of end of 2025
- New single-day high: $701.7M. New weekly high: $5B+
- Polymarket: ~$21.5B 2025 volume | Kalshi: ~$17.1B | Opinion Labs: fast-emerging third player
- Kalshi valued at $11B after Series E | Polymarket valued at $9B after ICE's $2B investment

### Key structural shifts
- **Institutional entry is real:** 10% of prop traders are already trading prediction contracts; 35% have interest. ForecastEx (Interactive Brokers) is positioning as the "serious trader's" prediction market.
- **Sports has become the volume driver:** Kalshi processed $43.1B in sports volume in 2025. Super Bowl 2026 alone hit $1B in a single day. Predictions are not just political anymore.
- **Mention markets are a new high-growth category:** Kalshi launched them in fall 2025 — trading on whether specific words appear in speeches, press conferences, or social posts. Already comparable to mid-tier sports events in volume.
- **Continuous/non-binary markets are emerging:** Opinion Labs introduced probability distribution markets (e.g., "distribution of Fed cuts in 2026") rather than simple Yes/No. Pythia's analytics must support these.
- **170+ third-party ecosystem tools** exist around Polymarket alone. The space is live and competitive.
- **Regulatory consolidation:** CFTC is the primary federal regulator. Several U.S. states are fighting platforms. This affects which markets can be displayed and how data is framed.
- **Wash trading is a known problem:** Research shows wash trading peaked near 60% of Polymarket volume in 2024. Any analytics platform that doesn't filter for this will have garbage data.
- **Insider trading concerns are live:** The "AlphaRaccoon" scandal (correctly predicted 22/23 Google Year in Search outcomes) put anomalous early positioning in the spotlight. Detection tools are in demand.

### Direct competitors / ecosystem tools (know these)
| Tool | What they do | Threat level |
|---|---|---|
| **Verso** | Bloomberg-style terminal, YC-backed, AI news→contract mapping via LLM, 73% accuracy, Kalshi-first | High |
| **Stand.trade** | Advanced terminal, whale alerts, copy trading, 8 markets at once | High |
| **Polymarket Analytics** | Trader profiles, P/L history, cross-venue market search, real-time activity | Medium |
| **Fireplace.gg** | Social feed — activity stream of followed accounts, copy trading, comments | Medium |
| **ArbBets / EventArb** | Automated cross-platform arbitrage (Polymarket vs Kalshi) | Medium |
| **OkBet** | Telegram bot — copy trading, group leaderboards, social trading in chat | Medium |
| **Polymtrade** | Heavy-duty terminal — multi-panel layout, order book, keyboard hotkeys, batch orders | Medium |
| **Omenstrat** | Autonomous AI agent that autonomously finds markets, runs predictions, places trades | High (future) |
| **Betmoar** | Trading terminal | Low-Medium |
| **Polytrend** | Market trend analytics | Low |

**Pythia's differentiation vs Verso (closest competitor):**
Verso is institutional-first, Kalshi-only (for now), and analytics-focused. Pythia is retail-first with institutional depth, cross-venue from day one, and layers in bots + market making that Verso doesn't touch. Pythia is also social — traders have profiles, scores, archetypes, followers. Verso is a terminal. Pythia is a platform.

---

## Product Architecture

### Three core layers:

---

### Layer 1: Analytics (MVP)
The front-facing quant intelligence layer. Every widget is modular, pinnable, resizable.

#### 1.1 Signal Heatmap Dashboard
- Live grid of all markets — each cell pulses with color representing signal state
- Color states: Green (strong signal/momentum), Amber (caution/thin liquidity), Red (bearish/fading), Blue (institutional activity detected), Purple (Pythia Score anomaly)
- Sortable/filterable by: venue, category, volume, RVOL, price change, expiry, liquidity score, Pythia Score
- Supports binary markets AND continuous/distribution markets (Opinion Labs-style)
- Each card shows: title, current price(s), 24h change, volume, RVOL, liquidity indicator, expiry countdown, Pythia Score badge

#### 1.2 Market Detail Page
- Full chart with price history, volume bars, OI overlay
- Order book depth visualization
- Liquidity health indicator — can the user enter? How much will their bet move the market?
- Crowd vs. Expert positioning breakdown (separate analytics for each segment)
- Top traders in this market + their current stance
- Relevant news and research (via tag graph)
- Mention market support — shows keyword tracking, speech/event calendar linkage
- Continuous market support — shows probability distribution curves, not just binary prices
- Cross-venue price comparison (same event on Polymarket vs Kalshi vs Opinion)
- Settlement risk indicator — flags when the same event uses different oracle mechanisms across venues (Polymarket uses UMA oracle, Kalshi uses CFTC-regulated settlement)

#### 1.3 Trader Intelligence & Profiles
First-class social layer. Every trader has a public profile.

**Pythia Trader Score (PTS):** Single composite number (0–100) shown prominently
- Sub-scores: Skill · Alpha Timing · Risk Management · Robustness · Contrarianism
- One-liner archetype: e.g. *"Disciplined contrarian. Enters early, sizes responsibly."*
- Archetype badges: Contrarian | Momentum Rider | Analyst | Degen | Whale | Market Maker | Bot

**Profile metrics:**
- Win rate, realized PnL, Sharpe ratio, max drawdown, Kelly score
- Win streak, market focus (politics/sports/macro/crypto), category ranking
- Alpha Timing — scatter chart showing where crowd was positioned vs. where this trader entered
- Herd Index — how often they go against consensus
- Followers / copiers count
- Public bot strategies (if they've published any)
- Wash trade flag — if detected, shown clearly; filtered out of leaderboards by default

**Leaderboard views:**
- Global leaderboard (wash-trade filtered, segment-classified)
- By category: Politics, Sports, Macro, Crypto, Mentions, Culture
- By venue: Polymarket, Kalshi, Opinion Labs, etc.
- Insider watch list — wallets flagged for anomalous early positioning (see 1.8)

#### 1.4 Sentiment Engine
- NLP-driven market emotion tracker — multi-source: Twitter/X, Reddit, news, Telegram channels, forums
- Per-market sentiment score + trend (rising/falling/stable)
- Sentiment vs. price divergence indicator — when crowd sentiment and price diverge, that's alpha
- Source breakdown — which channels are moving sentiment most
- Sentiment timeline overlaid on price chart

#### 1.5 Trending & Momentum Feed
- Real-time feed of markets with notable price/volume moves
- Volume delta rankings — what's moving NOW vs. 1h ago, 24h ago
- Momentum score — price velocity + volume acceleration composite
- New market radar — newly created markets with early signal
- Category-level trending (e.g. "Macro contracts heating up")

#### 1.6 Correlation Board
- Cross-market linkage explorer
- BTC price vs. crypto regulation market — how correlated?
- Political outcome A vs. political outcome B
- Sports event correlation chains (e.g. team performance → player-specific markets)
- Macro event cascade maps — Fed rate decision → multiple downstream markets

#### 1.7 Narrative Tracker
- Maps real-world news/events to market price shifts
- Timeline view: "This article → this price move"
- Powered by same LLM tag graph as news/research layer
- Shows which narratives are currently "live" and affecting open markets
- Forward-looking: upcoming events (speeches, earnings, elections, economic data releases) linked to open markets that will be affected

#### 1.8 Anomaly & Integrity Layer (differentiator)
- **Wash trade detector:** Flags wallets with circular trading patterns; filtered out of all leaderboards by default, can be toggled on
- **Insider positioning radar:** Surfaces wallets that entered large positions significantly before major price moves (pre-news entries); shows P/L timeline vs. news timeline
- **Whale alerts:** Real-time feed of large position entries (configurable threshold)
- **Manipulation risk score:** Per-market score indicating how susceptible a market is to large-wallet influence based on liquidity depth and position concentration
- **Cross-platform price divergence:** Flags when the same event on Polymarket and Kalshi diverges beyond what arbitrage would explain — potential manipulation signal OR settlement risk signal

#### 1.9 Liquidity & Spread Dashboard
- Order book health per market — bid/ask depth, spread width
- Liquidity score (0–100) — how easily can a user enter/exit at fair price?
- Market-making opportunity scanner — shows thin markets where MM yield is highest
- Spread history chart — how has liquidity evolved over time

#### 1.10 Portfolio Overview
- Holdings across all connected venues
- Realized + unrealized P/L
- Exposure breakdown by category, venue, expiry window
- Bias tracker — are you over-indexed on one outcome type or category?
- Position sizing suggestions based on Kelly criterion (optional)
- Hedging suggestions — related markets that could offset risk

#### 1.11 Event Calendar
- Upcoming market expiries with countdown
- Key real-world events that will affect open markets: Fed meetings, elections, earnings calls, scheduled speeches, sporting events
- "Markets affected" linked from each calendar event
- Mention market calendar: scheduled speeches/press conferences where keyword markets are live

#### 1.12 Pythia Score (proprietary AI signal)
- Per-market AI-derived confidence score on whether the current price is correctly set
- Inputs: price momentum, volume, liquidity quality, sentiment, historical accuracy of similar markets, trader segment positioning divergence, cross-venue comparison
- Score: 0–100. High = "market looks correctly priced." Low = "potential mispricing / alpha opportunity."
- NOT a bet recommendation — an interpretation tool
- Shown on every market card as a badge

#### 1.13 Cross-Venue Aggregated Search
- Search 1,500+ markets across Polymarket, Kalshi, Opinion Labs, Limitless, Myriad in one query
- Best price finder — same event listed on multiple venues, surface best entry price
- Arbitrage opportunity flag — when the same event has meaningful price divergence
- Market-type filter: binary | continuous/distribution | mentions | sports | macro | crypto | culture

---

### Layer 2: Bots (Phase 2, but design-ready from day one)
The quant automation layer. No-code bot builder for retail, code-accessible for advanced users.

#### 2.1 Bot Types

**Arbitrage Bot**
- Single-market arb: detects when YES + NO < $1 on same venue (structural mispricing)
- Cross-platform arb: Polymarket vs. Kalshi price divergence — auto-executes both legs simultaneously
- Fee-aware: factors in all fees and slippage before flagging opportunity
- Settlement-aware: flags resolution risk when same event uses different oracle mechanisms

**Momentum Bots**
- Detects trending probability swings and rides or fades them
- Configurable: momentum rider (follow the trend) or contrarian (fade overextended moves)
- Signal-triggered: fires when analytics heatmap hits thresholds

**Alpha Bots**
- Scans for Pythia Score anomalies — markets where AI detects potential mispricing
- Monitors insider wallet clusters for early positioning patterns
- Sentiment-price divergence exploitation

**Event-Driven Bots (News Reactors)**
- Monitors live news feeds for configurable keywords
- When triggered, evaluates affected markets and places pre-set orders
- Latency-sensitive — designed for fastest possible signal-to-trade path

**Portfolio Management Bots**
- Exposure rebalancer — maintains target allocation by category or venue
- Drawdown guard — reduces position sizes when portfolio is down X%
- Kelly-based position sizer — auto-calculates optimal position sizes

**Copy Trading Bot**
- Follow one or more traders by wallet address
- Configurable: full copy, scaled copy (e.g., 50% of their size), category-specific copy
- Whitelist/blacklist specific market types

#### 2.2 Bot Infrastructure
- No-code bot builder: drag-and-drop logic blocks, if/then triggers, parameter sliders
- Paper trading mode: simulate bot performance on live data before deploying real capital
- Bot marketplace: users can publish, fork, and license strategies
- Performance analytics: each bot has its own P/L dashboard, signal accuracy log, trade history
- Kill switch: one-click pause on all active bots

---

### Layer 3: Market Making (Phase 3)
The liquidity infrastructure layer. Democratize what market makers currently do.

- **Auto-MM Pool:** Users contribute capital slices; Pythia distributes algorithmically across markets based on risk/return profiles
- **Intelligent AMM Curves:** Dynamic spreads and inventory management using analytics layer signals
- **Gamified MM Rewards:** Yield + Pythia reputation points + leaderboard presence for LPs
- **MM Opportunity Scanner:** Shows which markets are thin enough that MM is profitable (integrated with Liquidity Dashboard)
- **MM-as-a-Service API:** Prediction market platforms can plug in Pythia liquidity bots to bootstrap depth
- **Position & Risk Dashboard:** Real-time view of LP exposure, earned yield, pending settlements

---

## Venue Integrations

### Priority order:
1. **Polymarket** — MVP. Largest volume, richest data, open API. On-chain via Polygon.
2. **Kalshi** — MVP or fast follow. CFTC-regulated, sports + macro dominance, demo API available.
3. **Opinion Labs** — Phase 2. Fast-emerging third player, continuous/distribution markets, $10B+ volume in 55 days.
4. **Limitless** — Phase 2. Base L2, high-frequency trading, L2-native users.
5. **Myriad** — Phase 2. Multi-chain (Abstract, Linea, Celo), AMM model, 511K users.
6. **ForecastEx (Interactive Brokers)** — Phase 3. Institutional/macro-focused, "serious trader" segment.
7. **Robinhood / Kalshi** — Phase 3. Via Kalshi data partnership (same markets, broader audience).

### Venue connector design rule:
Core schema must be venue-agnostic. Each venue has its own connector that normalizes to internal entities. Adding a new venue must require zero changes to core analytics.

### Known API/technical notes:
- **Polymarket:** CLOB, WebSocket for live order book (not polling), hybrid off-chain matching + on-chain settlement on Polygon, USDC, EIP-712 signing + L2 HMAC auth, UMA Optimistic Oracle for resolution
- **Kalshi:** REST API, demo environment with mock funds, must agree to developer terms, CFTC-regulated settlement, fiat USD, separate production + demo credentials
- **Cross-venue arb:** Simultaneous execution required — partial fill handling and "no orphan legs" rule is critical

---

## Data Model (Core Entities)

### Relational (Postgres)
- `Venue` — id, name, slug, metadata
- `Market` — id, venue_id, venue_market_id, title, description, market_type (binary | continuous | mentions | categorical), status, resolution info, tags
- `Outcome` — id, market_id, label, payout params
- `Trader` — id, venue_id, address/user_id, segment (crowd | expert | bot | whale | wash_trader), metadata
- `Tag` — id, slug, label, tag_type (entity | event | topic | market_type | keyword)
- `MarketTag`, `NewsTag`, `ResearchTag` — join tables
- `NewsItem` — source, url, title, summary, published_at, sentiment_score
- `ResearchItem` — type (conference | report | earnings | speech), title, occurred_at, url
- `AppUser` — Pythia account (separate from on-chain trader identity)
- `BotConfig` — bot type, parameters, owner, status, paper vs live
- `Alert` — user_id, trigger_type, conditions, delivery_channel, active

### Time-Series / Events
- `TradeEvent` — venue, market, trader, timestamp, side, size, price, is_wash_trade_flagged
- `PricePoint` — market, outcome, timestamp, price, bid, ask, volume_interval
- `VolumeSnapshot` — market, timestamp, volume_cumulative, trade_count, OI
- `TraderStatsGlobal` — trader, as_of, win_rate, PnL, Sharpe, drawdown, segment, archetype
- `TraderMarketStats` — trader, market, trades, net_position, avg_entry, PnL_market
- `MarketMetricSnapshot` — market, timestamp, last_price, change_24h, RVOL, liquidity_score, pythia_score, manipulation_risk_score
- `SentimentSnapshot` — market, timestamp, score, label, source breakdown
- `SegmentMetricSnapshot` — market, segment, net_position, volume, trader_count
- `AnomalyEvent` — market, trader (optional), type (wash_trade | insider_signal | whale_entry | price_divergence), timestamp, severity, metadata

---

## API Design

REST + JSON, versioned at `/v1/`

```
Markets & Heatmap
  GET /v1/heatmap
  GET /v1/markets
  GET /v1/markets/:id
  GET /v1/markets/:id/history
  GET /v1/markets/:id/traders
  GET /v1/markets/:id/segments
  GET /v1/markets/:id/research
  GET /v1/markets/:id/anomalies
  GET /v1/markets/search

Tags & Themes
  GET /v1/tags
  GET /v1/tags/:slug/markets

Traders
  GET /v1/traders/top
  GET /v1/traders/:id
  GET /v1/traders/:id/markets
  GET /v1/traders/:id/stats

Sentiment
  GET /v1/markets/:id/sentiment

Anomalies & Integrity
  GET /v1/anomalies/whales
  GET /v1/anomalies/insider-signals
  GET /v1/anomalies/divergence

Cross-Venue
  GET /v1/aggregated/search
  GET /v1/aggregated/arbitrage
  GET /v1/aggregated/best-price/:eventId

Portfolio (auth required)
  GET /v1/portfolio
  GET /v1/portfolio/exposure
  POST /v1/portfolio/connect-venue

Bots (auth required)
  GET /v1/bots
  POST /v1/bots
  PUT /v1/bots/:id
  DELETE /v1/bots/:id
  GET /v1/bots/:id/performance
  POST /v1/bots/:id/toggle

Alerts (auth required)
  GET /v1/alerts
  POST /v1/alerts
  DELETE /v1/alerts/:id

Auth
  POST /v1/auth/signup
  POST /v1/auth/login
  POST /v1/auth/logout
  GET /v1/auth/me
```

### Performance targets:
- Heatmap / list endpoints: < 300ms p95
- Market detail: < 500ms p95
- Anomaly feeds: < 200ms p95 (hot path)
- WebSocket: live price/volume updates sub-5s

---

## Tech Stack

### Frontend
- **Next.js 14+** (App Router) + **TypeScript**
- **Tailwind CSS** — dark-mode-only, custom design tokens
- **Framer Motion** — animations, widget transitions
- **TradingView Lightweight Charts** — price/volume charts (fast, purpose-built for finance)
- **Recharts** — secondary charts (sentiment, trader P/L, distribution curves)
- **dnd-kit** — drag-and-drop widget grid
- **Zustand** — global state
- **React Query** — data fetching + cache
- **Socket.io client** — live data feeds

### Backend
- **Node.js + Fastify** (or Python + FastAPI — confirm with dev)
- **PostgreSQL** — primary relational + time-series (partitioned tables)
- **Redis** — cache for hot endpoints (heatmap, top traders, live anomaly feeds)
- **BullMQ** — job queue for ingestion, metrics computation, sentiment aggregation, trader classification
- **WebSocket server** — real-time price + anomaly feeds

### Data Infrastructure
- **Goldsky** or **The Graph** — on-chain Polymarket data indexing (Goldsky powers polymarketanalytics.com)
- **Polymarket CLOB API** — WebSocket for live order book
- **Kalshi REST API** — polling + webhook where supported
- **News/sentiment sources:** Aylien, NewsAPI, Twitter/X API, Reddit API
- Custom NLP pipeline (or OpenAI embeddings) for news → market tag mapping

### AI / ML
- **OpenAI GPT-4o / Claude Sonnet** — news impact scoring, Narrative Tracker, natural language market search
- LLM embeddings for semantic market ↔ news mapping (similar to Verso's approach, but cross-venue)
- Pythia Score model v1: rule-based composite (price momentum + volume + sentiment + segment divergence). v2: gradient boosted ML model.
- Wash trade classifier: graph-based circular trade detection
- Insider signal detector: time-series anomaly detection on wallet entry timing vs. news events

### Deployment
- **Vercel** — frontend
- **Railway or Fly.io** — backend services
- **Neon or Supabase** — managed Postgres

---

## Design System Rules

1. **Dark only.** Every component assumes black background. No light mode in MVP.
2. **Color carries meaning. Always.** Never use color decoratively.
   - Green = positive signal, profit, bullish, confirmed
   - Red = loss, bearish, warning, anomaly
   - Amber = caution, thin liquidity, neutral drift
   - Blue = informational, institutional signal
   - Purple = AI-generated, Pythia Score, model output
3. **Numbers get special treatment.** All market data uses monospace + `tabular-nums`. Price changes always show sign (+ or -).
4. **Modular widgets.** Every dashboard section is self-contained, resizable, pinnable, closeable.
5. **Data density is intentional.** Dense AND legible. Every element earns its space.
6. **Animations are purposeful.** Live data pulses. Load fades in. Anomaly alerts flash once. No decorative spinning.
7. **Empty states matter.** Every widget has: loading skeleton → empty state → populated state. No spinners.
8. **Wash-trade filtered by default.** Every leaderboard, every metric. Toggle to include raw data.
9. **Mobile-responsive but desktop-first.** The terminal is a desktop product. Mobile gets: trending feed, portfolio, alerts, key market cards.

---

## User Types

| Type | Description | What they need most |
|---|---|---|
| **Retail trader / degen** | Active Polymarket/Kalshi user, regular bets | Signal heatmap, trending feed, Pythia Score, alerts |
| **Analyst / researcher** | Uses prediction markets as information signals | Narrative Tracker, Correlation Board, Sentiment Engine |
| **Quant / power user** | Multiple strategies, wants automation | Bots layer, API access, advanced screening, anomaly detection |
| **Institutional / prop trader** | Emerging segment, serious capital | ForecastEx integration, liquidity dashboard, risk management |
| **Market maker** | Provides liquidity, earns yield | MM layer, liquidity scanner, yield dashboard |
| **Copy trader** | Follows top performers, limited time | Leaderboard, copy bot, whale alerts, follow system |

---

## MVP Scope (Build Order)

1. **Design system + component library** — tokens, Button, Badge, Card, MetricPill, SignalDot, SkeletonLoader
2. **App shell** — sidebar nav, top bar, command palette (Cmd+K), widget grid layout system
3. **Signal Heatmap Dashboard** — hero screen, market cards with signal states, filters/sort
4. **Market Detail Page** — price chart (TradingView), liquidity depth, trader breakdown, news links
5. **Trader Profiles + Leaderboard** — Pythia Score, archetype, stats, wash-trade filter
6. **Trending + Volume Movers Feed** — real-time ranked feed
7. **Cross-Venue Search + Arbitrage Scanner** — unified market search, best-price finder
8. **Polymarket live data integration** — via Goldsky + CLOB API WebSocket
9. **Kalshi live data integration** — REST API + polling
10. **Anomaly Feed** — whale alerts, insider signals, wash-trade flags
11. **Alerts system** — user-configured alerts for any metric or event
12. **Auth + Portfolio** — connect wallets, track positions, see P/L

### Phase 2 (post-MVP):
Opinion Labs integration, Sentiment Engine (NLP), Correlation Board, Narrative Tracker, Bot builder (Arbitrage + Copy Trading first), Pythia Score ML model

### Phase 3:
Full bots marketplace, Market Making layer, Institutional tier, Mobile app, Pythia API (sell data access), Token/reputation system for MM rewards

---

## Analytics Widget Roadmap

| Widget | Status |
|---|---|
| Market closing soon | Launched |
| New markets | Launched |
| Market calendar | In progress |
| Leaderboards (wash-trade filtered) | In progress |
| Best/Worst PnL | In progress |
| Signal Heatmap | Not started |
| Cross-venue market search | Not started |
| Arbitrage scanner | Not started |
| Anomaly feed (whale / insider / wash) | Not started |
| Trader profile + Pythia Score | Not started |
| Sentiment engine | Not started |
| Correlation board | Not started |
| Narrative tracker | Not started |
| Continuous market support | Not started |
| Mention market analytics | Not started |
| Bot builder | Not started |
| MM layer | Not started |

---

## Potential Partnerships

| Partner | Value |
|---|---|
| **Goldsky** | On-chain Polymarket data indexing infrastructure |
| **Elastics.ai** | AI/ML layer for signal scoring, NLP |
| **Dune Analytics** | On-chain data queries, public dashboards |
| **Intercontinental Exchange (ICE)** | Polymarket data licensing |
| **The Graph** | Decentralized on-chain indexing |
| **UMA Protocol** | Oracle data for Polymarket resolution tracking |
| **Kalshi** | Official data partnership (they have deals with CNN, CNBC) |

---

## Regulatory Notes (affects product decisions)

- CFTC is primary U.S. federal regulator for event contracts
- Pythia is an analytics/tooling layer, NOT a trading venue — different regulatory exposure
- Do NOT frame features as "betting recommendations" — frame as "market intelligence" and "signal interpretation"
- Wash trade detection and insider flagging: frame as transparency and education, not accusation
- Settlement risk display (cross-platform divergence): important disclosure for cross-venue arb users
- Bot execution features may need geo-restrictions depending on legal counsel

---

## Session Notes

> Active decisions and open questions — update each session.

- [ ] Confirm final tech stack (Node vs Python backend)
- [ ] Confirm Goldsky data licensing for Polymarket on-chain data
- [ ] Finalize Pythia Score v1 formula (rule-based before ML model)
- [ ] Confirm wash-trade detection methodology
- [ ] Apply for Kalshi developer API credentials
- [ ] Legal review on geo-restrictions for bot execution
- [ ] Figma screens to be shared — reference for all visual decisions
- [ ] Decide on token/reputation system scope for Phase 3
