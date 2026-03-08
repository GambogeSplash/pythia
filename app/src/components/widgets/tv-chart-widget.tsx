"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { createChart, CandlestickSeries, HistogramSeries, type IChartApi, type UTCTimestamp, ColorType, LineStyle } from "lightweight-charts";
import { Widget } from "@/components/ui/widget";
import { useTrendingMarkets, usePriceHistory } from "@/hooks/use-markets";
import { BarChart3 } from "lucide-react";

const timeframeMap: Record<string, string> = {
  "1H": "1d",
  "6H": "1d",
  "1D": "1d",
  "1W": "1w",
  "All": "all",
};

const timeframes = ["1H", "6H", "1D", "1W", "All"] as const;

/** Convert PricePoint[] ({ t, p }) into candlestick data by grouping into buckets */
function pricesToCandles(
  points: { t: number; p: number }[],
  bucketSeconds: number,
) {
  if (!points.length) return [];

  const sorted = [...points].sort((a, b) => a.t - b.t);
  const buckets: Map<number, { t: number; prices: number[] }> = new Map();

  for (const pt of sorted) {
    const key = Math.floor(pt.t / bucketSeconds) * bucketSeconds;
    if (!buckets.has(key)) buckets.set(key, { t: key, prices: [] });
    buckets.get(key)!.prices.push(pt.p);
  }

  return Array.from(buckets.values()).map(({ t, prices }) => {
    const open = prices[0];
    const close = prices[prices.length - 1];
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    return {
      time: t as UTCTimestamp,
      open,
      high,
      low,
      close,
    };
  });
}

export function TVChartWidget({ marketId }: { marketId?: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<string>("1D");

  // If no marketId prop, use the first trending market
  const { markets: trendingMarkets } = useTrendingMarkets(1);
  const resolvedId = marketId ?? trendingMarkets?.[0]?.id ?? null;

  const interval = timeframeMap[activeTimeframe] || "1d";
  const { history, isLoading } = usePriceHistory(resolvedId, interval);

  const candleData = useMemo(() => {
    if (!history.length) return [];
    // Use 1-day buckets for most timeframes; adjust for shorter ones
    const bucketMap: Record<string, number> = {
      "1H": 3600,
      "6H": 3600,
      "1D": 86400,
      "1W": 86400,
      "All": 86400,
    };
    return pricesToCandles(history, bucketMap[activeTimeframe] || 86400);
  }, [history, activeTimeframe]);

  useEffect(() => {
    if (!chartContainerRef.current || !candleData.length) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#666666",
        fontSize: 10,
        fontFamily: "JetBrains Mono, monospace",
      },
      grid: {
        vertLines: { color: "#161819" },
        horzLines: { color: "#161819" },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: "#00FF85", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#0F1012" },
        horzLine: { color: "#00FF85", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#0F1012" },
      },
      rightPriceScale: {
        borderColor: "#161819",
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: "#161819",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00FF85",
      downColor: "#FF3B3B",
      borderDownColor: "#FF3B3B",
      borderUpColor: "#00FF85",
      wickDownColor: "#FF3B3B",
      wickUpColor: "#00FF85",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    candleSeries.setData(candleData);

    // Synthetic volume from candle range
    volumeSeries.setData(
      candleData.map((d) => ({
        time: d.time,
        value: Math.abs(d.close - d.open) * 1_000_000 + 10_000,
        color: d.close >= d.open ? "rgba(0, 255, 133, 0.4)" : "rgba(255, 59, 59, 0.4)",
      })),
    );

    // Current price line
    const lastCandle = candleData[candleData.length - 1];
    if (lastCandle) {
      candleSeries.createPriceLine({
        price: lastCandle.close,
        color: "#00FF85",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: "",
      });
    }

    chart.timeScale().fitContent();

    chartRef.current = chart;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candleData]);

  return (
    <Widget
      id="tv-chart"
      title="Market Chart"
      liveIndicator
      icon={<span className="text-xs text-signal-green">$</span>}
      actions={
        <div className="flex items-center gap-0.5">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`rounded px-2 py-0.5 text-numbers-10 font-medium transition-colors duration-150 ${
                activeTimeframe === tf
                  ? "bg-signal-green text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      }
    >
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-text-quaternary border-t-signal-green" />
        </div>
      ) : candleData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <BarChart3 className="mb-2 h-8 w-8 text-text-muted" />
          <p className="text-body-12 text-text-quaternary text-center">Select a market to view chart</p>
        </div>
      ) : (
        <div ref={chartContainerRef} className="h-full w-full" />
      )}
    </Widget>
  );
}
