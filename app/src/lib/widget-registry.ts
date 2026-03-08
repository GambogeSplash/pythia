import type { WidgetConfig } from "@/components/ui/widget-grid";

// Lazy imports to keep bundle splitting
import { SignalWidget } from "@/components/widgets/signal-widget";
import { MMOpportunitiesWidget } from "@/components/widgets/mm-opportunities-widget";
import { NewsFeedWidget } from "@/components/widgets/news-feed-widget";
import { TradersActivityWidget } from "@/components/widgets/traders-activity-widget";
import { ClosingSoonWidget } from "@/components/widgets/closing-soon-widget";
import { MarketChartWidget } from "@/components/widgets/market-chart-widget";
import { TVChartWidget } from "@/components/widgets/tv-chart-widget";
import { NewMarketsWidget } from "@/components/widgets/new-markets-widget";
import { CalendarWidget } from "@/components/widgets/calendar-widget";
import { LeaderboardWidget } from "@/components/widgets/leaderboard-widget";
import { PnlWidget } from "@/components/widgets/pnl-widget";
import { TrendingWidget } from "@/components/widgets/trending-widget";
import { AnomalyWidget } from "@/components/widgets/anomaly-widget";
import { PortfolioWidget } from "@/components/widgets/portfolio-widget";
import { CorrelationWidget } from "@/components/widgets/correlation-widget";
import { SentimentWidget } from "@/components/widgets/sentiment-widget";
import { NarrativeWidget } from "@/components/widgets/narrative-widget";
import { AISignalsWidget } from "@/components/widgets/ai-signals-widget";

export const ALL_WIDGETS: WidgetConfig[] = [
  {
    id: "signal",
    title: "Signal (Politics)",
    component: SignalWidget,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: "mm-opportunities",
    title: "Top MM Opportunities",
    component: MMOpportunitiesWidget,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: "news-feed",
    title: "News Feed",
    component: NewsFeedWidget,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: "traders-activity",
    title: "Traders Activity",
    component: TradersActivityWidget,
    defaultLayout: { w: 12, h: 3, minW: 6, minH: 2 },
  },
  {
    id: "market-chart",
    title: "Market Chart (SVG)",
    component: MarketChartWidget,
    defaultLayout: { w: 8, h: 5, minW: 4, minH: 3 },
  },
  {
    id: "tv-chart",
    title: "Market Chart (Live)",
    component: TVChartWidget,
    defaultLayout: { w: 8, h: 5, minW: 4, minH: 3 },
  },
  {
    id: "closing-soon",
    title: "Markets Closing Soon",
    component: ClosingSoonWidget,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: "new-markets",
    title: "New Markets",
    component: NewMarketsWidget,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: "calendar",
    title: "Calendar",
    component: CalendarWidget,
    defaultLayout: { w: 4, h: 3, minW: 3, minH: 2 },
  },
  {
    id: "leaderboard",
    title: "Leaderboard",
    component: LeaderboardWidget,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: "pnl",
    title: "PnL",
    component: PnlWidget,
    defaultLayout: { w: 4, h: 3, minW: 2, minH: 2 },
  },
  {
    id: "trending",
    title: "Trending",
    component: TrendingWidget,
    defaultLayout: { w: 4, h: 3, minW: 3, minH: 2 },
  },
  {
    id: "anomaly",
    title: "Anomaly Feed",
    component: AnomalyWidget,
    defaultLayout: { w: 4, h: 3, minW: 3, minH: 2 },
  },
  {
    id: "portfolio",
    title: "Portfolio",
    component: PortfolioWidget,
    defaultLayout: { w: 4, h: 3, minW: 3, minH: 2 },
  },
  {
    id: "correlation",
    title: "Correlation Board",
    component: CorrelationWidget,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: "sentiment",
    title: "Sentiment Engine",
    component: SentimentWidget,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: "narrative",
    title: "Narrative Tracker",
    component: NarrativeWidget,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: "ai-signals",
    title: "AI Signals",
    component: AISignalsWidget,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
];

// Default dashboard shows these widgets
export const DEFAULT_DASHBOARD_WIDGETS = [
  "signal",
  "mm-opportunities",
  "news-feed",
  "traders-activity",
  "sentiment",
  "ai-signals",
];

export function getWidgetsByIds(ids: string[]): WidgetConfig[] {
  return ids
    .map((id) => ALL_WIDGETS.find((w) => w.id === id))
    .filter((w): w is WidgetConfig => w !== undefined);
}
