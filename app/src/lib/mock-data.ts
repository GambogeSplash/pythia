export interface SignalMarket {
  id: string;
  title: string;
  icon: string;
  priceYes: number;
  priceSpread: number;
  priceNo: number;
  rvol: number;
  rvolChange: number;
  swing: number;
  swingChange: number;
  swingDown?: boolean;
  tradesPerMin: number;
  tradesChange: number;
  slippage: number;
  slippageChange: number;
  // Vol Spike variant
  depth?: "Thin" | "Thick";
  notional?: number;
  notionalBuy?: number;
  notionalSell?: number;
  notionalTakerPct?: number;
  notionalTx?: number;
}

export interface ClosingMarket {
  id: string;
  title: string;
  icon: string;
  volume: string;
  liquidity: string;
  openInterest: string;
  priceYes: number;
  priceSpread: number;
  priceNo: number;
  timeLeft: string;
  goodDeal: {
    pctChange: number;
    fillQuality: "High Fill" | "OK Fill";
    flow: string;
    flowPct?: number;
  };
}

export interface MMOpportunity {
  id: string;
  title: string;
  icon: string;
  priceYes: number;
  priceSpread: number;
  priceNo: number;
  reward: number;
  volume: string;
  liquidity: string;
}

export interface TraderActivity {
  id: string;
  name: string;
  market: string;
  marketIcon: string;
  bet: "YES" | "NO";
  size: string;
  pnl: string;
  pnlPositive: boolean;
  pyScore: number;
  archetypes: string[];
}

export interface NewsItem {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  platform: "twitter" | "news";
  timeAgo: string;
  content: string;
  replyTo?: string;
  quotedPost?: {
    author: string;
    handle: string;
    content: string;
  };
  image?: string;
  marketCount?: number;
  tags?: { label: string; variant: "green" | "red" | "amber" | "blue" | "neutral" }[];
}

export const signalMarkets: SignalMarket[] = [
  {
    id: "1",
    title: "Will China invade Taiwan in Oct 2025?",
    icon: "🇨🇳",
    priceYes: 12,
    priceSpread: 2.1,
    priceNo: 86,
    rvol: 12.3,
    rvolChange: 3,
    swing: 23,
    swingChange: 3,
    tradesPerMin: 10.5,
    tradesChange: 3,
    slippage: 0.7,
    slippageChange: 3,
    depth: "Thin",
    notional: 432.4,
    notionalBuy: 230,
    notionalSell: 202,
    notionalTakerPct: 63,
    notionalTx: 321,
  },
  {
    id: "2",
    title: "S&P 500 to close above 6000 in 2025?",
    icon: "📈",
    priceYes: 12,
    priceSpread: 2.1,
    priceNo: 86,
    rvol: 3.3,
    rvolChange: 3,
    swing: 3,
    swingChange: -12,
    swingDown: true,
    tradesPerMin: 23,
    tradesChange: 3,
    slippage: 0,
    slippageChange: 3,
    depth: "Thick",
    notional: 432.4,
    notionalBuy: 230,
    notionalSell: 202,
    notionalTakerPct: 63,
    notionalTx: 321,
  },
  {
    id: "3",
    title: "Will Taiwan hold independence referendum in 2025?",
    icon: "🇹🇼",
    priceYes: 12,
    priceSpread: 2.1,
    priceNo: 86,
    rvol: 1.4,
    rvolChange: 3,
    swing: 19,
    swingChange: 3,
    tradesPerMin: 22,
    tradesChange: 3,
    slippage: 0.3,
    slippageChange: 3,
    depth: "Thin",
    notional: 432.4,
  },
  {
    id: "4",
    title: "Gold price to hit $3000/oz in 2025?",
    icon: "🥇",
    priceYes: 12,
    priceSpread: 2.1,
    priceNo: 86,
    rvol: 10,
    rvolChange: 3,
    swing: 1.4,
    swingChange: -12,
    swingDown: true,
    tradesPerMin: 10,
    tradesChange: 3,
    slippage: 2.4,
    slippageChange: 3,
    depth: "Thin",
    notional: 432.4,
  },
  {
    id: "5",
    title: "Will China invade Taiwan in Oct 2025?",
    icon: "🇨🇳",
    priceYes: 12,
    priceSpread: 2.1,
    priceNo: 86,
    rvol: 8,
    rvolChange: 3,
    swing: 10,
    swingChange: -12,
    swingDown: true,
    tradesPerMin: 544,
    tradesChange: 3,
    slippage: 0.9,
    slippageChange: 3,
    depth: "Thin",
    notional: 432.4,
  },
  {
    id: "6",
    title: "Will Ethereum ETF be approved by end of 2025?",
    icon: "⟠",
    priceYes: 12,
    priceSpread: 2.1,
    priceNo: 86,
    rvol: 21,
    rvolChange: 3,
    swing: 23,
    swingChange: 3,
    tradesPerMin: 2101,
    tradesChange: 3,
    slippage: 0.7,
    slippageChange: 3,
    depth: "Thin",
    notional: 432.4,
  },
];

export const closingMarkets: ClosingMarket[] = [
  {
    id: "1",
    title: "Will China invade Taiwan in Oct 2025?",
    icon: "🇨🇳",
    volume: "$6.1K",
    liquidity: "$5k",
    openInterest: "$12.2k",
    priceYes: 12,
    priceSpread: 2.1,
    priceNo: 86,
    timeLeft: "4m",
    goodDeal: { pctChange: 1.3, fillQuality: "High Fill", flow: "Buy 84%" },
  },
  {
    id: "2",
    title: "Will Andrew Cuomo win the 2025 NYC mayoral election?",
    icon: "🗽",
    volume: "$12.3M",
    liquidity: "$15k",
    openInterest: "$83.9k",
    priceYes: 12,
    priceSpread: 2.1,
    priceNo: 86,
    timeLeft: "42m",
    goodDeal: { pctChange: 0.4, fillQuality: "OK Fill", flow: "Buy 86%" },
  },
  {
    id: "3",
    title: "Will Zohran Mamdani win the 2025 NYC mayoral election?",
    icon: "🗳️",
    volume: "$25.3M",
    liquidity: "$245k",
    openInterest: "$152.2k",
    priceYes: 12,
    priceSpread: 2.1,
    priceNo: 86,
    timeLeft: "1d",
    goodDeal: { pctChange: 1.3, fillQuality: "High Fill", flow: "Buying" },
  },
  {
    id: "4",
    title: "Will Ethereum hit $6,000 by December 31?",
    icon: "⟠",
    volume: "$12.3M",
    liquidity: "$15k",
    openInterest: "$83.9k",
    priceYes: 12,
    priceSpread: 2.1,
    priceNo: 86,
    timeLeft: "1d",
    goodDeal: { pctChange: -0.2, fillQuality: "OK Fill", flow: "Sell 54%", flowPct: 54 },
  },
];

export const mmOpportunities: MMOpportunity[] = [
  { id: "1", title: "Over $4B committed to the MegaETH publ...", icon: "Ⓜ️", priceYes: 12, priceSpread: 2.1, priceNo: 86, reward: 200, volume: "$2.1M", liquidity: "$24k" },
  { id: "2", title: "Khamenei out as Supreme Leader of Iran...", icon: "🇮🇷", priceYes: 12, priceSpread: 2.1, priceNo: 86, reward: 190, volume: "$12K", liquidity: "$24k" },
  { id: "3", title: "Netherlands Election: DENK vs BBB", icon: "🇳🇱", priceYes: 12, priceSpread: 2.1, priceNo: 86, reward: 195, volume: "$2.1M", liquidity: "$24k" },
  { id: "4", title: "Netherlands Election: FVD vs SP", icon: "🇳🇱", priceYes: 12, priceSpread: 2.1, priceNo: 86, reward: 185, volume: "$2.1M", liquidity: "$24k" },
  { id: "5", title: "Will ChatGPT be #1 Free App in the US Ap...", icon: "🤖", priceYes: 12, priceSpread: 2.1, priceNo: 86, reward: 180, volume: "$2.1M", liquidity: "$24k" },
  { id: "6", title: "Will Trump strike a drug boat on October 2...", icon: "🚢", priceYes: 12, priceSpread: 2.1, priceNo: 86, reward: 130, volume: "$2.1M", liquidity: "$24k" },
  { id: "7", title: "Khamenei out as Supreme Leader of Iran...", icon: "🇮🇷", priceYes: 14, priceSpread: 5, priceNo: 73, reward: 100, volume: "$2.1M", liquidity: "$24k" },
];

export const traderActivities: TraderActivity[] = [
  { id: "1", name: "KawakamiTok", market: "Fed decrease interest by 50+ bps", marketIcon: "🏦", bet: "YES", size: "$56k", pnl: "$6.2k", pnlPositive: true, pyScore: 80, archetypes: ["Arb", "Trnd"] },
  { id: "2", name: "MiyamotoRiko", market: "Will OpenAI IPO by end of 2025?", marketIcon: "🤖", bet: "YES", size: "$101k", pnl: "$53.2k", pnlPositive: true, pyScore: 68, archetypes: ["Bot", "Deg"] },
  { id: "3", name: "KamiyaKokona", market: "Will Zohran Mamdani win NYC race?", marketIcon: "🗳️", bet: "NO", size: "$450k", pnl: "-$503", pnlPositive: false, pyScore: 83.5, archetypes: ["MM", "Bot"] },
  { id: "4", name: "AidaYudai", market: "Fed increases interest by 25+ bps?", marketIcon: "🏦", bet: "YES", size: "$45k", pnl: "$34", pnlPositive: true, pyScore: 95.2, archetypes: ["Bot", "Arb", "Insd"] },
  { id: "5", name: "ShimaTakashi", market: "Will Donald Trump win Nobel Peace?", marketIcon: "🏆", bet: "YES", size: "$56k", pnl: "$1k", pnlPositive: true, pyScore: 99.3, archetypes: ["Arb", "Trnd"] },
  { id: "6", name: "DoiYukiko", market: "Will Joe Biden withdraw from race?", marketIcon: "🇺🇸", bet: "NO", size: "$23k", pnl: "$56k", pnlPositive: true, pyScore: 56.9, archetypes: ["MM", "Trnd"] },
  { id: "7", name: "AndouYukio", market: "Oil prices above $120/barrel in 2025?", marketIcon: "🛢️", bet: "YES", size: "$12k", pnl: "-$61k", pnlPositive: false, pyScore: 64.2, archetypes: ["Insd"] },
  { id: "8", name: "IkedaSuzuka", market: "Jerome Powell out as Fed Chair?", marketIcon: "🏦", bet: "NO", size: "$46k", pnl: "$115k", pnlPositive: true, pyScore: 70, archetypes: ["Alp", "Trnd", "MM"] },
  { id: "9", name: "TejimaKouzou", market: "Will Lewis Hamilton win?", marketIcon: "🏎️", bet: "NO", size: "$56k", pnl: "-$42", pnlPositive: false, pyScore: 40.6, archetypes: ["Arb", "MM"] },
];

export const newsItems: NewsItem[] = [
  {
    id: "1",
    author: "Elon Musk",
    handle: "@elon",
    avatar: "EM",
    platform: "twitter",
    timeAgo: "10s",
    replyTo: "@pelumialesh",
    content: "we will launch Grokipedia tomorrow!",
    quotedPost: {
      author: "Pelumi",
      handle: "@pelumialesh",
      content: "i don't think elon plans to launch grokipedia anytime soon, nothin so far.",
    },
    marketCount: 2,
    tags: [
      { label: "Recommend to snipe now", variant: "amber" },
    ],
  },
  {
    id: "2",
    author: "Wall Street Journal",
    handle: "",
    avatar: "WSJ",
    platform: "news",
    timeAgo: "10s",
    content: "Two U.S. Navy Aircraft From Same Carrier Crash Into South China Sea",
    marketCount: 12,
  },
  {
    id: "3",
    author: "Donald J Trump",
    handle: "@DonaldTrump",
    avatar: "DT",
    platform: "twitter",
    timeAgo: "10s",
    content: "I am pleased to announce that the great Dan Scavino, in addition to remaining Deputy Chief of Staff of the Trump Administration, will head the White House Presidential Personnel Office, replacing Sergio Gor.",
    marketCount: 12,
    tags: [
      { label: "Bullish on 3 of your positions", variant: "green" },
      { label: "Momentum building", variant: "blue" },
    ],
  },
  {
    id: "4",
    author: "Elon Musk",
    handle: "@elon",
    avatar: "EM",
    platform: "twitter",
    timeAgo: "10s",
    replyTo: "@pelumialesh",
    content: "insane",
    quotedPost: {
      author: "Pelumi",
      handle: "@pelumialesh",
      content: "A German left wing politician claimed her own attackers were White Native Germans instead of admitting they were",
    },
    marketCount: 2,
    tags: [
      { label: "Bearish on 2 of your positions", variant: "red" },
    ],
  },
];

// ── New Markets ──────────────────────────────────────────────────────

export interface NewMarket {
  id: string;
  title: string;
  icon: string;
  category: string;
  createdAgo: string;
  volume: string;
  liquidity: string;
  priceYes: number;
  priceSpread: number;
  priceNo: number;
  earlySignal: "hot" | "warming" | "quiet";
}

export const newMarkets: NewMarket[] = [
  { id: "1", title: "Will Apple announce AR glasses at WWDC 2026?", icon: "🍎", category: "Tech", createdAgo: "2h", volume: "$1.2K", liquidity: "$800", priceYes: 32, priceSpread: 4.2, priceNo: 64, earlySignal: "hot" },
  { id: "2", title: "UK to rejoin EU single market by 2030?", icon: "🇬🇧", category: "Politics", createdAgo: "4h", volume: "$430", liquidity: "$200", priceYes: 8, priceSpread: 1.5, priceNo: 90, earlySignal: "quiet" },
  { id: "3", title: "Will SpaceX Starship reach orbit in Q2 2026?", icon: "🚀", category: "Science", createdAgo: "6h", volume: "$3.4K", liquidity: "$1.2K", priceYes: 67, priceSpread: 3.1, priceNo: 30, earlySignal: "warming" },
  { id: "4", title: "Netflix to surpass 300M subscribers in 2026?", icon: "📺", category: "Business", createdAgo: "8h", volume: "$890", liquidity: "$450", priceYes: 55, priceSpread: 2.8, priceNo: 42, earlySignal: "warming" },
  { id: "5", title: "Will Bitcoin ETF see $50B inflows by July?", icon: "₿", category: "Crypto", createdAgo: "12h", volume: "$8.9K", liquidity: "$3.1K", priceYes: 41, priceSpread: 5.0, priceNo: 54, earlySignal: "hot" },
  { id: "6", title: "Taylor Swift to headline Coachella 2027?", icon: "🎵", category: "Culture", createdAgo: "1d", volume: "$210", liquidity: "$90", priceYes: 15, priceSpread: 2.0, priceNo: 83, earlySignal: "quiet" },
];

// ── Calendar Events ──────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "expiry" | "event" | "speech" | "economic";
  marketsAffected: number;
  icon: string;
  importance: "high" | "medium" | "low";
}

export const calendarEvents: CalendarEvent[] = [
  { id: "1", title: "Fed Interest Rate Decision", date: "Mar 19", time: "2:00 PM ET", type: "economic", marketsAffected: 34, icon: "🏦", importance: "high" },
  { id: "2", title: "China GDP Q1 2026 Release", date: "Mar 20", time: "9:30 AM ET", type: "economic", marketsAffected: 12, icon: "🇨🇳", importance: "high" },
  { id: "3", title: "NYC Mayoral Election", date: "Mar 22", time: "All day", type: "event", marketsAffected: 8, icon: "🗽", importance: "high" },
  { id: "4", title: "Trump Address to Congress", date: "Mar 24", time: "9:00 PM ET", type: "speech", marketsAffected: 19, icon: "🇺🇸", importance: "medium" },
  { id: "5", title: "Ethereum ETF Decision Deadline", date: "Mar 28", time: "5:00 PM ET", type: "expiry", marketsAffected: 6, icon: "⟠", importance: "high" },
  { id: "6", title: "ECB Monetary Policy Meeting", date: "Apr 2", time: "7:45 AM ET", type: "economic", marketsAffected: 15, icon: "🇪🇺", importance: "medium" },
  { id: "7", title: "Apple WWDC 2026", date: "Apr 7", time: "10:00 AM PT", type: "event", marketsAffected: 4, icon: "🍎", importance: "low" },
  { id: "8", title: "Gold futures contract expiry", date: "Apr 10", time: "1:30 PM ET", type: "expiry", marketsAffected: 3, icon: "🥇", importance: "low" },
];

// ── Leaderboard Traders ──────────────────────────────────────────────

export interface LeaderboardTrader {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  pnl: string;
  pnlPositive: boolean;
  winRate: number;
  trades: number;
  pyScore: number;
  archetype: string;
  archetypeVariant: "green" | "blue" | "amber" | "red" | "neutral";
  isWashTrader?: boolean;
}

export const leaderboardTraders: LeaderboardTrader[] = [
  { id: "1", rank: 1, name: "ShimaTakashi", avatar: "ST", pnl: "+$1.24M", pnlPositive: true, winRate: 78.3, trades: 1243, pyScore: 99.3, archetype: "Alpha", archetypeVariant: "green" },
  { id: "2", rank: 2, name: "AidaYudai", avatar: "AY", pnl: "+$892K", pnlPositive: true, winRate: 72.1, trades: 3412, pyScore: 95.2, archetype: "Arb", archetypeVariant: "neutral" },
  { id: "3", rank: 3, name: "IkedaSuzuka", avatar: "IS", pnl: "+$743K", pnlPositive: true, winRate: 69.8, trades: 892, pyScore: 88.1, archetype: "Contrarian", archetypeVariant: "blue" },
  { id: "4", rank: 4, name: "KawakamiTok", avatar: "KT", pnl: "+$521K", pnlPositive: true, winRate: 65.4, trades: 2104, pyScore: 80.0, archetype: "Momentum", archetypeVariant: "neutral" },
  { id: "5", rank: 5, name: "MiyamotoRiko", avatar: "MR", pnl: "+$498K", pnlPositive: true, winRate: 61.2, trades: 5621, pyScore: 68.0, archetype: "Bot", archetypeVariant: "blue" },
  { id: "6", rank: 6, name: "DoiYukiko", avatar: "DY", pnl: "+$312K", pnlPositive: true, winRate: 58.7, trades: 1876, pyScore: 56.9, archetype: "MM", archetypeVariant: "neutral" },
  { id: "7", rank: 7, name: "KamiyaKokona", avatar: "KK", pnl: "+$287K", pnlPositive: true, winRate: 55.2, trades: 4310, pyScore: 83.5, archetype: "MM", archetypeVariant: "neutral" },
  { id: "8", rank: 8, name: "AndouYukio", avatar: "AYu", pnl: "-$61K", pnlPositive: false, winRate: 42.1, trades: 823, pyScore: 64.2, archetype: "Insider", archetypeVariant: "amber", isWashTrader: true },
  { id: "9", rank: 9, name: "TejimaKouzou", avatar: "TK", pnl: "+$198K", pnlPositive: true, winRate: 53.6, trades: 2901, pyScore: 40.6, archetype: "Degen", archetypeVariant: "red" },
  { id: "10", rank: 10, name: "NakamuraYui", avatar: "NY", pnl: "+$156K", pnlPositive: true, winRate: 51.8, trades: 1456, pyScore: 72.4, archetype: "Analyst", archetypeVariant: "green" },
];

// ── PnL Traders (Best / Worst) ───────────────────────────────────────

export interface PnlTrader {
  id: string;
  name: string;
  avatar: string;
  pnl: string;
  pnlAmount: number;
  market: string;
  marketIcon: string;
  timeframe: string;
}

export const bestPnlTraders: PnlTrader[] = [
  { id: "1", name: "ShimaTakashi", avatar: "ST", pnl: "+$342K", pnlAmount: 342000, market: "Fed decrease interest by 50+ bps", marketIcon: "🏦", timeframe: "24h" },
  { id: "2", name: "AidaYudai", avatar: "AY", pnl: "+$198K", pnlAmount: 198000, market: "Will OpenAI IPO by end of 2025?", marketIcon: "🤖", timeframe: "24h" },
  { id: "3", name: "IkedaSuzuka", avatar: "IS", pnl: "+$156K", pnlAmount: 156000, market: "Gold price to hit $3000/oz", marketIcon: "🥇", timeframe: "24h" },
  { id: "4", name: "MiyamotoRiko", avatar: "MR", pnl: "+$89K", pnlAmount: 89000, market: "Will Ethereum ETF be approved?", marketIcon: "⟠", timeframe: "24h" },
  { id: "5", name: "KawakamiTok", avatar: "KT", pnl: "+$67K", pnlAmount: 67000, market: "NYC Mayoral Election", marketIcon: "🗽", timeframe: "24h" },
];

export const worstPnlTraders: PnlTrader[] = [
  { id: "1", name: "TejimaKouzou", avatar: "TK", pnl: "-$421K", pnlAmount: -421000, market: "Will China invade Taiwan?", marketIcon: "🇨🇳", timeframe: "24h" },
  { id: "2", name: "AndouYukio", avatar: "AYu", pnl: "-$203K", pnlAmount: -203000, market: "S&P 500 above 6000 in 2025?", marketIcon: "📈", timeframe: "24h" },
  { id: "3", name: "SaitouHaruki", avatar: "SH", pnl: "-$147K", pnlAmount: -147000, market: "Oil prices above $120/barrel", marketIcon: "🛢️", timeframe: "24h" },
  { id: "4", name: "FujitaMasato", avatar: "FM", pnl: "-$98K", pnlAmount: -98000, market: "Trump wins Nobel Peace Prize?", marketIcon: "🏆", timeframe: "24h" },
  { id: "5", name: "OkadaRina", avatar: "OR", pnl: "-$56K", pnlAmount: -56000, market: "Will Lewis Hamilton win?", marketIcon: "🏎️", timeframe: "24h" },
];

// ── Trending Markets ─────────────────────────────────────────────────

export interface TrendingMarket {
  id: string;
  title: string;
  icon: string;
  category: string;
  priceYes: number;
  change24h: number;
  volume24h: string;
  volumeDelta: number;
  momentum: "surging" | "rising" | "fading" | "crashing";
  trades1h: number;
}

export const trendingMarkets: TrendingMarket[] = [
  { id: "1", title: "Fed decrease interest by 50+ bps", icon: "🏦", category: "Macro", priceYes: 34, change24h: 12.4, volume24h: "$4.2M", volumeDelta: 340, momentum: "surging", trades1h: 892 },
  { id: "2", title: "Will China invade Taiwan in Oct 2025?", icon: "🇨🇳", category: "Politics", priceYes: 12, change24h: 8.2, volume24h: "$1.8M", volumeDelta: 180, momentum: "rising", trades1h: 445 },
  { id: "3", title: "Will OpenAI IPO by end of 2025?", icon: "🤖", category: "Tech", priceYes: 67, change24h: -5.3, volume24h: "$3.1M", volumeDelta: -20, momentum: "fading", trades1h: 312 },
  { id: "4", title: "Gold price to hit $3000/oz in 2025?", icon: "🥇", category: "Macro", priceYes: 78, change24h: 3.1, volume24h: "$890K", volumeDelta: 45, momentum: "rising", trades1h: 156 },
  { id: "5", title: "Will Ethereum hit $6,000 by December 31?", icon: "⟠", category: "Crypto", priceYes: 23, change24h: -15.6, volume24h: "$5.6M", volumeDelta: -120, momentum: "crashing", trades1h: 1203 },
  { id: "6", title: "NYC Mayoral Election: Cuomo to win?", icon: "🗽", category: "Politics", priceYes: 45, change24h: 6.7, volume24h: "$2.3M", volumeDelta: 90, momentum: "rising", trades1h: 534 },
];

// ── Anomaly Items ────────────────────────────────────────────────────

export interface AnomalyItem {
  id: string;
  type: "whale" | "insider" | "wash" | "divergence";
  title: string;
  market: string;
  marketIcon: string;
  trader?: string;
  size?: string;
  timestamp: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
}

export const anomalyItems: AnomalyItem[] = [
  { id: "1", type: "whale", title: "Large position entry", market: "Fed decrease interest by 50+ bps", marketIcon: "🏦", trader: "0x7a3f...9e2d", size: "$1.2M", timestamp: "2m ago", severity: "critical", description: "Whale entered $1.2M YES position. Largest single trade in 7 days." },
  { id: "2", type: "insider", title: "Anomalous early positioning", market: "Trump Address to Congress", marketIcon: "🇺🇸", trader: "0x4b2c...1f8a", size: "$340K", timestamp: "15m ago", severity: "high", description: "Position entered 4h before breaking news. 3rd flagged trade from this wallet." },
  { id: "3", type: "wash", title: "Circular trading pattern", market: "Netherlands Election: DENK vs BBB", marketIcon: "🇳🇱", trader: "0x9d1e...3c7b", size: "$89K", timestamp: "1h ago", severity: "medium", description: "5 wallets identified in circular pattern. Volume inflated ~$89K." },
  { id: "4", type: "divergence", title: "Cross-platform price gap", market: "Will Ethereum ETF be approved?", marketIcon: "⟠", size: "4.2¢", timestamp: "3m ago", severity: "high", description: "Polymarket: 23¢ YES | Kalshi: 27.2¢ YES. Gap exceeds normal arb threshold." },
  { id: "5", type: "whale", title: "Large position exit", market: "Gold price to hit $3000/oz", marketIcon: "🥇", trader: "0x2f8d...6a1c", size: "$560K", timestamp: "22m ago", severity: "medium", description: "Known whale exited full NO position. Was 3rd largest holder." },
  { id: "6", type: "insider", title: "Pre-announcement accumulation", market: "Apple WWDC AR Glasses", marketIcon: "🍎", trader: "0x8c4a...5d9e", size: "$210K", timestamp: "2h ago", severity: "high", description: "Cluster of 4 wallets accumulated simultaneously before any public info." },
];

// ── Portfolio ────────────────────────────────────────────────────────

export interface PortfolioPosition {
  id: string;
  market: string;
  marketIcon: string;
  side: "YES" | "NO";
  size: string;
  avgEntry: number;
  currentPrice: number;
  pnl: string;
  pnlPct: number;
  pnlPositive: boolean;
  venue: string;
  expiry: string;
}

export const portfolioPositions: PortfolioPosition[] = [
  { id: "1", market: "Fed decrease interest by 50+ bps", marketIcon: "🏦", side: "YES", size: "$12.4K", avgEntry: 28, currentPrice: 34, pnl: "+$2.6K", pnlPct: 21.4, pnlPositive: true, venue: "Polymarket", expiry: "Mar 19" },
  { id: "2", market: "Will China invade Taiwan?", marketIcon: "🇨🇳", side: "NO", size: "$8.1K", avgEntry: 88, currentPrice: 86, pnl: "-$184", pnlPct: -2.3, pnlPositive: false, venue: "Polymarket", expiry: "Oct 31" },
  { id: "3", market: "NYC Mayoral Election: Cuomo", marketIcon: "🗽", side: "YES", size: "$5.6K", avgEntry: 41, currentPrice: 45, pnl: "+$547", pnlPct: 9.8, pnlPositive: true, venue: "Kalshi", expiry: "Mar 22" },
  { id: "4", market: "Will Ethereum hit $6,000?", marketIcon: "⟠", side: "YES", size: "$3.2K", avgEntry: 31, currentPrice: 23, pnl: "-$827", pnlPct: -25.8, pnlPositive: false, venue: "Polymarket", expiry: "Dec 31" },
  { id: "5", market: "Gold price to hit $3000/oz", marketIcon: "🥇", side: "YES", size: "$15.8K", avgEntry: 72, currentPrice: 78, pnl: "+$1.3K", pnlPct: 8.3, pnlPositive: true, venue: "Kalshi", expiry: "Dec 31" },
];

export interface PortfolioSummary {
  totalValue: string;
  totalPnl: string;
  totalPnlPct: number;
  pnlPositive: boolean;
  positions: number;
  venues: number;
  exposure: { category: string; pct: number }[];
}

export const portfolioSummary: PortfolioSummary = {
  totalValue: "$45.1K",
  totalPnl: "+$3.44K",
  totalPnlPct: 8.3,
  pnlPositive: true,
  positions: 5,
  venues: 2,
  exposure: [
    { category: "Macro", pct: 42 },
    { category: "Politics", pct: 30 },
    { category: "Crypto", pct: 18 },
    { category: "Commodities", pct: 10 },
  ],
};

// ── Sentiment Engine ──────────────────────────────────────────────────

export type SentimentTrend = "rising" | "falling" | "stable";

export interface SentimentSource {
  twitter: number;
  reddit: number;
  news: number;
  telegram: number;
}

export interface SentimentMarket {
  id: string;
  title: string;
  icon: string;
  score: number;
  trend: SentimentTrend;
  trendDelta: number;
  priceDirection: "up" | "down";
  sentimentDirection: "up" | "down";
  divergence: boolean;
  sparkline: number[];
  sources: SentimentSource;
}

export const sentimentMarkets: SentimentMarket[] = [
  { id: "1", title: "Fed decrease interest by 50+ bps", icon: "\u{1F3E6}", score: 78, trend: "rising", trendDelta: 12, priceDirection: "up", sentimentDirection: "up", divergence: false, sparkline: [42, 45, 48, 44, 52, 58, 63, 68, 72, 75, 78], sources: { twitter: 45, reddit: 25, news: 20, telegram: 10 } },
  { id: "2", title: "Will China invade Taiwan in Oct 2025?", icon: "\u{1F1E8}\u{1F1F3}", score: 31, trend: "falling", trendDelta: -8, priceDirection: "down", sentimentDirection: "up", divergence: true, sparkline: [55, 52, 48, 50, 44, 40, 38, 35, 33, 32, 31], sources: { twitter: 35, reddit: 15, news: 40, telegram: 10 } },
  { id: "3", title: "Will OpenAI IPO by end of 2025?", icon: "\u{1F916}", score: 64, trend: "rising", trendDelta: 5, priceDirection: "down", sentimentDirection: "up", divergence: true, sparkline: [50, 48, 52, 55, 53, 57, 59, 61, 60, 63, 64], sources: { twitter: 50, reddit: 30, news: 12, telegram: 8 } },
  { id: "4", title: "Gold price to hit $3000/oz in 2025?", icon: "\u{1F947}", score: 72, trend: "stable", trendDelta: 1, priceDirection: "up", sentimentDirection: "up", divergence: false, sparkline: [70, 71, 69, 72, 71, 73, 72, 70, 71, 72, 72], sources: { twitter: 20, reddit: 10, news: 55, telegram: 15 } },
  { id: "5", title: "Will Ethereum hit $6,000 by December 31?", icon: "\u27E0", score: 23, trend: "falling", trendDelta: -16, priceDirection: "down", sentimentDirection: "down", divergence: false, sparkline: [60, 55, 48, 42, 38, 35, 30, 28, 26, 24, 23], sources: { twitter: 40, reddit: 35, news: 10, telegram: 15 } },
  { id: "6", title: "NYC Mayoral Election: Cuomo to win?", icon: "\u{1F5FD}", score: 56, trend: "rising", trendDelta: 9, priceDirection: "up", sentimentDirection: "down", divergence: true, sparkline: [35, 38, 40, 42, 45, 48, 50, 51, 53, 55, 56], sources: { twitter: 55, reddit: 20, news: 18, telegram: 7 } },
];
