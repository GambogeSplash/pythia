"use client";

import { SignalWidget } from "@/components/widgets/signal-widget";
import { SignalVolSpikeWidget } from "@/components/widgets/signal-volspike-widget";
import { ClosingSoonWidget } from "@/components/widgets/closing-soon-widget";
import { ClosingSoonExpandedWidget } from "@/components/widgets/closing-soon-expanded-widget";
import { MMOpportunitiesWidget } from "@/components/widgets/mm-opportunities-widget";
import { NewsFeedWidget } from "@/components/widgets/news-feed-widget";
import { NewsFeedCustomize } from "@/components/widgets/news-feed-customize";
import { TradersActivityWidget } from "@/components/widgets/traders-activity-widget";
import { MarketChartWidget } from "@/components/widgets/market-chart-widget";
import { RecommendationModal } from "@/components/widgets/recommendation-modal";
import { AlphaFiltersBar } from "@/components/widgets/alpha-filters-bar";

export default function ShowcasePage() {
  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-header-20 text-text-primary">Component Showcase</h1>

      {/* Alpha Filters Bar */}
      <Section title="Alpha Filters Bar">
        <AlphaFiltersBar />
      </Section>

      {/* Signal Widgets side by side */}
      <Section title="Signal Widget — Volatility vs Vol Spike">
        <div className="grid grid-cols-2 gap-3">
          <SignalWidget />
          <SignalVolSpikeWidget />
        </div>
      </Section>

      {/* Markets Closing Soon — compact */}
      <Section title="Markets Closing Soon — Compact">
        <div className="max-w-xl">
          <ClosingSoonWidget />
        </div>
      </Section>

      {/* Markets Closing Soon — expanded */}
      <Section title="Markets Closing Soon — Expanded Table">
        <ClosingSoonExpandedWidget />
      </Section>

      {/* MM Opportunities */}
      <Section title="Top MM Opportunities">
        <div className="max-w-md">
          <MMOpportunitiesWidget />
        </div>
      </Section>

      {/* News Feed + Customize */}
      <Section title="News Feed + Customize Panel">
        <div className="grid grid-cols-2 gap-3">
          <NewsFeedWidget />
          <NewsFeedCustomize />
        </div>
      </Section>

      {/* Top Traders Activity */}
      <Section title="Top Traders Activity">
        <TradersActivityWidget />
      </Section>

      {/* Market Chart */}
      <Section title="Market Chart">
        <MarketChartWidget />
      </Section>

      {/* Recommendation Modals */}
      <Section title="Recommendation Modal — Snipe vs Wait">
        <div className="flex gap-6">
          <RecommendationModal state="snipe" />
          <RecommendationModal state="wait" />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-body-14 font-semibold text-text-secondary">{title}</h2>
      {children}
    </div>
  );
}
