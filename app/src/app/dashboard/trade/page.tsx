"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { createChart, LineSeries, HistogramSeries, type IChartApi, type UTCTimestamp, ColorType, LineStyle } from "lightweight-charts";
import { useMarkets, useSearchMarkets, useMarket, useOrderbook } from "@/hooks/use-markets";
import { useTrades } from "@/hooks/use-user-data";
import { formatVolume, formatTimeLeft } from "@/lib/format";
import type { Market } from "@/lib/api/types";

/* ------------------------------------------------------------------ */
/*  Skeleton helpers                                                   */
/* ------------------------------------------------------------------ */

function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-bg-base-3 ${className}`} />;
}

function MarketListSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-1.5 px-3 py-2.5"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
        >
          <SkeletonLine className="h-3 w-3/4" />
          <div className="flex gap-3">
            <SkeletonLine className="h-2.5 w-12" />
            <SkeletonLine className="h-2.5 w-12" />
            <SkeletonLine className="h-2.5 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderbookSkeleton() {
  return (
    <div className="flex-1 overflow-auto">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center px-3 py-1">
          <SkeletonLine className="h-3 w-12 flex-1" />
          <SkeletonLine className="ml-2 h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Derive a signed 24h change % from price history if available */
function compute24hChange(priceHistory: { t: number; p: number }[]): number | null {
  if (priceHistory.length < 2) return null;
  const now = Date.now() / 1000;
  const oneDayAgo = now - 86400;
  // Find the closest point ~24h ago
  let pastPoint = priceHistory[0];
  for (const pt of priceHistory) {
    if (pt.t <= oneDayAgo) pastPoint = pt;
    else break;
  }
  const latest = priceHistory[priceHistory.length - 1];
  if (pastPoint.p === 0) return null;
  return ((latest.p - pastPoint.p) / pastPoint.p) * 100;
}

/* ------------------------------------------------------------------ */
/*  Market list item (sidebar)                                         */
/* ------------------------------------------------------------------ */

function MarketListItem({
  market,
  isSelected,
  onSelect,
}: {
  market: Market;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = Math.round(market.noPrice * 100);

  return (
    <button
      onClick={onSelect}
      className={`flex w-full flex-col gap-1 px-3 py-2.5 text-left transition-colors duration-150 ${
        isSelected
          ? "bg-action-translucent-hover"
          : "hover:bg-action-translucent-hover"
      }`}
      style={{
        boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-bg-base-2">
          {market.image ? (
            <img src={market.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-text-quaternary">M</span>
          )}
        </div>
        <span className="flex-1 text-body-12 font-medium text-text-primary line-clamp-1">
          {market.question}
        </span>
        <span className="ml-1 shrink-0 text-numbers-10 text-text-quaternary">
          {formatTimeLeft(market.endDate)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-numbers-10 text-action-buy">
          YES {yesPercent}&cent;
        </span>
        <span className="text-numbers-10 text-action-sell">
          NO {noPercent}&cent;
        </span>
        <span className="text-numbers-10 text-text-quaternary">
          Vol {formatVolume(market.volume24h)}
        </span>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function TradePage() {
  /* ----- market list (sidebar) ----- */
  const { markets, isLoading: marketsLoading } = useMarkets({ limit: 20, mode: "trending" });

  /* ----- search ----- */
  const [searchQuery, setSearchQuery] = useState("");
  const { markets: searchResults, isLoading: searchLoading } = useSearchMarkets(searchQuery);
  const displayMarkets = searchQuery.trim().length >= 2 ? searchResults : markets;

  /* ----- selected market ----- */
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select first market when list loads
  useEffect(() => {
    if (!selectedId && markets.length > 0) {
      setSelectedId(markets[0].id);
    }
  }, [markets, selectedId]);

  /* ----- detail + history for selected market ----- */
  const { market: selectedMarket, priceHistory, isLoading: marketLoading } = useMarket(selectedId, { history: true });

  /* ----- orderbook ----- */
  const { orderbook, isLoading: orderbookLoading } = useOrderbook(selectedId);

  /* ----- derived values ----- */
  const yesPercent = selectedMarket ? Math.round(selectedMarket.yesPrice * 100) : 0;
  const noPercent = selectedMarket ? Math.round(selectedMarket.noPrice * 100) : 0;
  const change24h = useMemo(() => compute24hChange(priceHistory), [priceHistory]);

  /* ----- orderbook processed ----- */
  const processedOrderbook = useMemo(() => {
    if (!orderbook) return { bids: [], asks: [] };

    const maxBidSize = Math.max(...orderbook.bids.map((b) => parseFloat(b.size)), 1);
    const maxAskSize = Math.max(...orderbook.asks.map((a) => parseFloat(a.size)), 1);

    return {
      bids: orderbook.bids.slice(0, 8).map((b) => ({
        price: Math.round(parseFloat(b.price) * 100),
        size: parseFloat(b.size),
        depth: parseFloat(b.size) / maxBidSize,
      })),
      asks: orderbook.asks.slice(0, 8).map((a) => ({
        price: Math.round(parseFloat(a.price) * 100),
        size: parseFloat(a.size),
        depth: parseFloat(a.size) / maxAskSize,
      })),
    };
  }, [orderbook]);

  /* ----- trade panel state ----- */
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [marketPanelOpen, setMarketPanelOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [orderSubmitting, setOrderSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (!selectedMarket) {
      alert("Select a market first.");
      return;
    }
    const amt = Number(amount);
    if (!amount || amt <= 0) {
      alert("Enter an amount greater than 0.");
      return;
    }

    const price = side === "yes" ? selectedMarket.yesPrice : selectedMarket.noPrice;
    if (price <= 0) {
      alert("Invalid price for selected side.");
      return;
    }

    const orderShares = amt / price;
    const sideUpper = side.toUpperCase(); // "YES" | "NO"

    setOrderSubmitting(true);

    try {
      // 1. Create position
      const posRes = await fetch("/api/user/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId: selectedMarket.id,
          marketQuestion: selectedMarket.question,
          venue: "polymarket",
          side: sideUpper,
          shares: orderShares,
          avgPrice: price,
          currentPrice: price,
          costBasis: amt,
          marketValue: amt,
          pnl: 0,
          pnlPercent: 0,
          category: selectedMarket.category || null,
        }),
      });

      if (!posRes.ok) {
        const err = await posRes.json().catch(() => ({}));
        throw new Error(err.error || `Position creation failed (${posRes.status})`);
      }

      const posData = await posRes.json();
      const positionId = posData.data?.id ?? null;

      // 2. Create trade record
      const tradeRes = await fetch("/api/user/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionId,
          marketId: selectedMarket.id,
          marketQuestion: selectedMarket.question,
          venue: "polymarket",
          side: sideUpper,
          action: "buy",
          shares: orderShares,
          price,
          amount: amt,
          fee: 0,
        }),
      });

      if (!tradeRes.ok) {
        const err = await tradeRes.json().catch(() => ({}));
        throw new Error(err.error || `Trade creation failed (${tradeRes.status})`);
      }

      // Success feedback
      setOrderPlaced(true);
      setAmount("");
      setTimeout(() => setOrderPlaced(false), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Order failed";
      alert(message);
    } finally {
      setOrderSubmitting(false);
    }
  };

  /* ----- chart ----- */
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Need either price history or a selected market to render
    if (!selectedMarket) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6B7380",
        fontSize: 10,
        fontFamily: "IBM Plex Sans Condensed, sans-serif",
      },
      grid: {
        vertLines: { color: "#161819" },
        horzLines: { color: "#161819" },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: "#00FF85",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#0F1012",
        },
        horzLine: {
          color: "#00FF85",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#0F1012",
        },
      },
      rightPriceScale: {
        borderColor: "#161819",
        scaleMargins: { top: 0.05, bottom: 0.25 },
      },
      timeScale: {
        borderColor: "#161819",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#00FF85",
      lineWidth: 2,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `${(price * 100).toFixed(0)}\u00A2`,
      },
      crosshairMarkerRadius: 4,
      crosshairMarkerBackgroundColor: "#00FF85",
      crosshairMarkerBorderColor: "#00FF85",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // Map real price history to chart data
    if (priceHistory.length > 0) {
      const lineData = priceHistory.map((pt) => ({
        time: pt.t as UTCTimestamp,
        value: pt.p,
      }));
      lineSeries.setData(lineData);

      // Synthetic volume bars from price deltas
      const volumeData = lineData.map((d, i) => ({
        time: d.time,
        value: Math.random() * 500000 + 50000,
        color:
          i > 0 && d.value >= lineData[i - 1].value
            ? "rgba(0, 255, 133, 0.35)"
            : "rgba(255, 59, 59, 0.35)",
      }));
      volumeSeries.setData(volumeData);

      // Current price line
      const lastPoint = lineData[lineData.length - 1];
      lineSeries.createPriceLine({
        price: lastPoint.value,
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
      chartRef.current = null;
    };
  }, [selectedId, priceHistory, selectedMarket]);

  /* ----- recent trades ----- */
  const { trades: recentTrades, isLoading: tradesLoading } = useTrades(5);

  /* ----- order calculations ----- */
  const currentPrice = side === "yes" ? yesPercent : noPercent;
  const shares = amount
    ? Math.floor((Number(amount) / currentPrice) * 100)
    : 0;
  const potentialReturn = amount
    ? (Number(amount) / currentPrice) * 100
    : 0;
  const potentialProfit = potentialReturn - Number(amount || 0);

  return (
    <div className="flex h-full flex-col">
      {/* Sub-header */}
      <div
        className="flex h-8 shrink-0 items-center bg-bg-base-0 px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        {/* Left: Market name */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMarketPanelOpen(true)}
            className="flex h-6 w-6 items-center justify-center rounded-[4px] text-text-quaternary hover:bg-bg-base-2 hover:text-text-primary md:hidden"
          >
            <Search className="h-3 w-3" />
          </button>
          <div className="flex h-6 items-center gap-1.5 rounded-[4px] bg-bg-base-2 px-2 text-body-12 font-semibold text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy">
            <TrendingUp className="h-3 w-3 text-signal-green" />
            {selectedMarket ? selectedMarket.question.toUpperCase() : "Loading..."}
            <ChevronDown className="h-3 w-3 text-text-quaternary" />
          </div>
        </div>
        {/* Center: Quick stats */}
        <div className="ml-4 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-quaternary">Last Price</span>
            <span className="text-numbers-12 font-medium text-text-primary">{yesPercent}&cent;</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-quaternary">24h Change</span>
            <span className={`text-numbers-12 font-medium ${change24h !== null && change24h >= 0 ? "text-action-rise" : "text-action-fall"}`}>
              {change24h !== null ? `${change24h >= 0 ? "+" : ""}${change24h.toFixed(1)}%` : "--"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-quaternary">24h Volume</span>
            <span className="text-numbers-12 font-medium text-text-primary">
              {selectedMarket ? formatVolume(selectedMarket.volume24h) : "--"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-quaternary">Liquidity</span>
            <span className="text-numbers-12 font-medium text-text-primary">
              {selectedMarket ? formatVolume(selectedMarket.liquidity) : "--"}
            </span>
          </div>
        </div>
        {/* Right: Place Order button */}
        <button
          onClick={handlePlaceOrder}
          disabled={orderSubmitting}
          className="ml-auto flex h-6 items-center gap-1 rounded-[4px] bg-signal-green px-3 text-body-12 font-semibold text-bg-base-0 transition-colors hover:bg-action-brand-hover disabled:opacity-50"
        >
          {orderPlaced ? "Order Placed \u2713" : orderSubmitting ? "Placing..." : "Place Order"}
        </button>
      </div>
      {/* Page content */}
      <div className="min-h-0 flex-1 overflow-auto p-2">
    <div className="flex flex-col md:flex-row h-full gap-2">
      {/* mobile market panel overlay */}
      {marketPanelOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-80 bg-bg-base-1 p-2 shadow-lg">
            <button
              className="mb-2 text-text-secondary hover:text-text-primary"
              onClick={() => setMarketPanelOpen(false)}
            >
              Close
            </button>
            {/* same market list content reused below */}
            <div
              className="flex h-10 items-center gap-2 px-3"
              style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
            >
              <Search className="h-3.5 w-3.5 text-text-quaternary" />
              <input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-body-12 text-text-primary placeholder-text-quaternary outline-none"
              />
            </div>
            <div className="scrollbar-hide flex-1 overflow-y-auto mt-2">
              {marketsLoading || searchLoading ? (
                <MarketListSkeleton />
              ) : displayMarkets.length === 0 ? (
                <div className="px-3 py-6 text-center text-body-12 text-text-quaternary">
                  No markets found
                </div>
              ) : (
                displayMarkets.map((m) => (
                  <MarketListItem
                    key={m.id}
                    market={m}
                    isSelected={selectedId === m.id}
                    onSelect={() => {
                      setSelectedId(m.id);
                      setMarketPanelOpen(false);
                    }}
                  />
                ))
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMarketPanelOpen(false)} />
        </div>
      )}

      {/* Left: Market list */}
      <div
        className="flex w-80 flex-shrink-0 flex-col rounded-[18px] bg-bg-base-1 md:flex"
        style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
      >
        <div
          className="flex h-10 items-center gap-2 px-3"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
        >
          <Search className="h-3.5 w-3.5 text-text-quaternary" />
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-body-12 text-text-primary placeholder-text-quaternary outline-none"
          />
        </div>
        <div className="scrollbar-hide flex-1 overflow-y-auto">
          {marketsLoading || searchLoading ? (
            <MarketListSkeleton />
          ) : displayMarkets.length === 0 ? (
            <div className="px-3 py-6 text-center text-body-12 text-text-quaternary">
              No markets found
            </div>
          ) : (
            displayMarkets.map((m) => (
              <MarketListItem
                key={m.id}
                market={m}
                isSelected={selectedId === m.id}
                onSelect={() => setSelectedId(m.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Center: Chart + order book + recent trades */}
      <div className="flex flex-1 flex-col gap-2">
        {/* Chart area */}
        <div
          className="flex flex-1 flex-col rounded-[18px] bg-bg-base-1"
          style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
        >
          <div
            className="flex h-10 items-center justify-between px-4"
            style={{
              boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)",
            }}
          >
            <div className="flex items-center gap-2">
              {marketLoading ? (
                <SkeletonLine className="h-4 w-48" />
              ) : selectedMarket ? (
                <>
                  <span className="text-body-14 font-semibold text-text-primary">
                    {selectedMarket.question}
                  </span>
                  <span className="rounded-[4px] bg-bg-base-3 px-1.5 py-0.5 text-[10px] text-text-quaternary">
                    {selectedMarket.category}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 text-numbers-12 ${
                      change24h !== null && change24h >= 0
                        ? "text-action-rise"
                        : "text-action-fall"
                    }`}
                  >
                    {change24h !== null && change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {change24h !== null
                      ? `${change24h >= 0 ? "+" : ""}${change24h.toFixed(1)}%`
                      : "--"}
                  </span>
                </>
              ) : (
                <span className="text-body-14 text-text-quaternary">Select a market</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {["1D", "1W", "1M", "3M", "ALL"].map((tf) => (
                <button
                  key={tf}
                  className="rounded-[4px] px-2 py-0.5 text-numbers-10 text-text-secondary transition-colors duration-150 hover:bg-action-translucent-hover hover:text-text-primary"
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          {marketLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-bg-base-3 border-t-signal-green" />
            </div>
          ) : (
            <div ref={chartContainerRef} className="flex-1" />
          )}
        </div>

        {/* Order book + Recent trades */}
        <div
          className="flex h-56 rounded-[18px] bg-bg-base-1"
          style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
        >
          {/* Bids */}
          <div className="flex flex-1 flex-col">
            <div
              className="flex h-8 items-center px-3 text-[10px] font-medium uppercase text-text-quaternary"
              style={{
                boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)",
              }}
            >
              <span className="flex-1">Bid Price</span>
              <span>Size</span>
            </div>
            {orderbookLoading ? (
              <OrderbookSkeleton />
            ) : processedOrderbook.bids.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-[10px] text-text-quaternary">
                No bids
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                {processedOrderbook.bids.map((b, i) => (
                  <div key={i} className="relative flex items-center px-3 py-1">
                    <div
                      className="absolute inset-y-0 left-0 bg-action-buy/[0.08]"
                      style={{ width: `${Math.min(b.depth * 100, 100)}%` }}
                    />
                    <span className="relative flex-1 text-numbers-12 text-action-buy">
                      {b.price}&cent;
                    </span>
                    <span className="relative text-numbers-10 text-text-secondary">
                      ${b.size.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-px bg-divider-heavy" />

          {/* Asks */}
          <div className="flex flex-1 flex-col">
            <div
              className="flex h-8 items-center px-3 text-[10px] font-medium uppercase text-text-quaternary"
              style={{
                boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)",
              }}
            >
              <span className="flex-1">Ask Price</span>
              <span>Size</span>
            </div>
            {orderbookLoading ? (
              <OrderbookSkeleton />
            ) : processedOrderbook.asks.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-[10px] text-text-quaternary">
                No asks
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                {processedOrderbook.asks.map((a, i) => (
                  <div key={i} className="relative flex items-center px-3 py-1">
                    <div
                      className="absolute inset-y-0 right-0 bg-action-sell/[0.08]"
                      style={{ width: `${Math.min(a.depth * 100, 100)}%` }}
                    />
                    <span className="relative flex-1 text-numbers-12 text-action-sell">
                      {a.price}&cent;
                    </span>
                    <span className="relative text-numbers-10 text-text-secondary">
                      ${a.size.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-px bg-divider-heavy" />

          {/* Recent Trades */}
          <div className="flex flex-1 flex-col">
            <div
              className="flex h-8 items-center px-3 text-[10px] font-medium uppercase text-text-quaternary"
              style={{
                boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)",
              }}
            >
              <span className="w-16">Time</span>
              <span className="w-10">Side</span>
              <span className="flex-1 text-right">Amount</span>
              <span className="w-12 text-right">Price</span>
            </div>
            {tradesLoading ? (
              <div className="flex-1 overflow-auto">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center px-3 py-1.5">
                    <SkeletonLine className="h-3 w-12" />
                    <SkeletonLine className="ml-2 h-3 w-8" />
                    <SkeletonLine className="ml-auto h-3 w-10" />
                    <SkeletonLine className="ml-2 h-3 w-10" />
                  </div>
                ))}
              </div>
            ) : recentTrades.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-1">
                <span className="text-[10px] text-text-quaternary">No trades yet</span>
                <span className="text-[9px] text-text-muted">Place an order to get started</span>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                {recentTrades.slice(0, 5).map((trade) => {
                  const timeAgo = (() => {
                    const diff = Date.now() - new Date(trade.executedAt).getTime();
                    const mins = Math.floor(diff / 60000);
                    if (mins < 1) return "now";
                    if (mins < 60) return `${mins}m`;
                    const hrs = Math.floor(mins / 60);
                    if (hrs < 24) return `${hrs}h`;
                    const days = Math.floor(hrs / 24);
                    return `${days}d`;
                  })();
                  return (
                    <div
                      key={trade.id}
                      className="flex items-center px-3 py-1.5 transition-colors hover:bg-action-translucent-hover"
                      title={trade.marketQuestion}
                    >
                      <span className="w-16 text-numbers-10 text-text-quaternary">{timeAgo}</span>
                      <span className={`w-10 text-numbers-10 font-medium ${trade.side === "YES" ? "text-action-buy" : "text-action-sell"}`}>
                        {trade.side}
                      </span>
                      <span className="flex-1 text-right text-numbers-10 text-text-secondary">
                        ${trade.amount.toFixed(2)}
                      </span>
                      <span className="w-12 text-right text-numbers-10 text-text-secondary">
                        {Math.round(trade.price * 100)}&cent;
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Trade panel */}
      <div
        className="flex w-72 flex-shrink-0 flex-col rounded-[18px] bg-bg-base-1"
        style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
      >
        <div
          className="flex h-10 items-center px-4 text-body-12 font-semibold text-text-primary"
          style={{
            boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)",
          }}
        >
          Place Order
        </div>

        <div className="scrollbar-hide flex-1 overflow-y-auto p-4">
          {/* Order type selector */}
          <div className="mb-3 flex gap-1 rounded-[8px] bg-bg-base-2 p-1">
            <button
              onClick={() => setOrderType("market")}
              className={`flex-1 rounded-[6px] py-1.5 text-body-12 font-medium transition-colors duration-150 ${
                orderType === "market"
                  ? "bg-bg-base-3 text-text-primary"
                  : "text-text-quaternary hover:text-text-secondary"
              }`}
            >
              Market
            </button>
            <button
              onClick={() => setOrderType("limit")}
              className={`flex-1 rounded-[6px] py-1.5 text-body-12 font-medium transition-colors duration-150 ${
                orderType === "limit"
                  ? "bg-bg-base-3 text-text-primary"
                  : "text-text-quaternary hover:text-text-secondary"
              }`}
            >
              Limit
            </button>
          </div>

          {/* Side toggle */}
          <div className="mb-4 flex gap-1 rounded-[8px] bg-bg-base-2 p-1">
            <button
              onClick={() => setSide("yes")}
              className={`flex-1 rounded-[6px] py-2 text-body-12 font-semibold transition-colors duration-150 ${
                side === "yes"
                  ? "bg-action-buy text-bg-base-0"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              YES {yesPercent}&cent;
            </button>
            <button
              onClick={() => setSide("no")}
              className={`flex-1 rounded-[6px] py-2 text-body-12 font-semibold transition-colors duration-150 ${
                side === "no"
                  ? "bg-action-sell text-bg-base-0"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              NO {noPercent}&cent;
            </button>
          </div>

          {/* Limit price input (only for limit orders) */}
          {orderType === "limit" && (
            <div className="mb-3">
              <label className="mb-1 block text-[10px] font-medium uppercase text-text-quaternary">
                Limit Price (cents)
              </label>
              <div
                className="flex h-10 items-center rounded-[8px] bg-bg-base-2 px-3"
                style={{
                  boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)",
                }}
              >
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder={String(currentPrice)}
                  className="flex-1 bg-transparent text-numbers-12 text-text-primary placeholder-text-muted outline-none"
                />
                <span className="text-body-12 text-text-quaternary">&cent;</span>
              </div>
            </div>
          )}

          {/* Amount input */}
          <div className="mb-3">
            <label className="mb-1 block text-[10px] font-medium uppercase text-text-quaternary">
              Amount (USD)
            </label>
            <div
              className="flex h-10 items-center rounded-[8px] bg-bg-base-2 px-3"
              style={{
                boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)",
              }}
            >
              <span className="text-body-12 text-text-quaternary">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent px-1 text-numbers-12 text-text-primary placeholder-text-muted outline-none"
              />
            </div>
          </div>

          {/* Quick amounts */}
          <div className="mb-4 flex gap-1">
            {["10", "50", "100", "500"].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className="flex-1 rounded-[6px] bg-bg-base-2 py-1.5 text-numbers-10 text-text-secondary transition-colors duration-150 hover:bg-action-translucent-hover hover:text-text-primary"
              >
                ${v}
              </button>
            ))}
          </div>

          {/* Order summary */}
          <div className="mb-4 space-y-2 rounded-[8px] bg-bg-base-2 p-3">
            <div className="flex justify-between text-body-12">
              <span className="text-text-quaternary">
                {orderType === "limit" ? "Limit Price" : "Avg Price"}
              </span>
              <span className="text-numbers-12 text-text-primary">
                {orderType === "limit" && limitPrice
                  ? `${limitPrice}\u00A2`
                  : `${currentPrice}\u00A2`}
              </span>
            </div>
            <div className="flex justify-between text-body-12">
              <span className="text-text-quaternary">Shares</span>
              <span className="text-numbers-12 text-text-primary">
                {shares}
              </span>
            </div>
            <div className="flex justify-between text-body-12">
              <span className="text-text-quaternary">Potential Return</span>
              <span className="text-numbers-12 text-action-rise">
                {amount ? `$${potentialReturn.toFixed(2)}` : "$0.00"}
              </span>
            </div>
            <div className="flex justify-between text-body-12">
              <span className="text-text-quaternary">Est. Profit</span>
              <span className="text-numbers-12 text-action-rise">
                {amount ? `$${potentialProfit.toFixed(2)}` : "$0.00"}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handlePlaceOrder}
            disabled={orderSubmitting}
            className={`flex h-10 w-full items-center justify-center rounded-[8px] text-body-14 font-semibold transition-colors duration-150 disabled:opacity-50 ${
              side === "yes"
                ? "bg-action-buy text-bg-base-0 hover:bg-action-buy-hover"
                : "bg-action-sell text-bg-base-0 hover:bg-action-sell-hover"
            }`}
          >
            {orderPlaced
              ? "Order Placed \u2713"
              : orderSubmitting
              ? "Placing Order..."
              : `${side === "yes" ? "Buy YES" : "Buy NO"}${orderType === "limit" ? " (Limit)" : ""}`}
          </button>

          {/* P&L Summary */}
          <div className="mt-4 rounded-[8px] bg-bg-base-2 p-3">
            <div
              className="mb-2 pb-2 text-[10px] font-medium uppercase text-text-quaternary"
              style={{
                boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)",
              }}
            >
              P&L Summary
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-body-12">
                <span className="text-text-quaternary">Open Positions</span>
                <span className="text-numbers-12 text-text-primary">3</span>
              </div>
              <div className="flex justify-between text-body-12">
                <span className="text-text-quaternary">Total Invested</span>
                <span className="text-numbers-12 text-text-primary">$1,240</span>
              </div>
              <div className="flex justify-between text-body-12">
                <span className="text-text-quaternary">Unrealized P&L</span>
                <span className="text-numbers-12 text-action-rise">
                  +$186.40
                </span>
              </div>
              <div className="flex justify-between text-body-12">
                <span className="text-text-quaternary">Realized P&L</span>
                <span className="text-numbers-12 text-action-rise">
                  +$420.00
                </span>
              </div>
              <div className="flex justify-between text-body-12">
                <span className="text-text-quaternary">Win Rate</span>
                <span className="text-numbers-12 text-text-primary">68%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}
