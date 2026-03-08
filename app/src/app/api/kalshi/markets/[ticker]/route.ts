import { NextRequest, NextResponse } from "next/server";
import { getKalshiMarketByTicker, getKalshiPriceHistory, getKalshiOrderbook } from "@/lib/api/kalshi";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;
  const { searchParams } = req.nextUrl;
  const withHistory = searchParams.get("history") === "true";
  const withOrderbook = searchParams.get("orderbook") === "true";
  const interval = (searchParams.get("interval") || "1m") as "1d" | "1w" | "1m" | "3m" | "all";

  try {
    const market = await getKalshiMarketByTicker(ticker);
    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    let priceHistory: { t: number; p: number }[] | undefined;
    if (withHistory) {
      priceHistory = await getKalshiPriceHistory(ticker, interval);
    }

    let orderbook: Awaited<ReturnType<typeof getKalshiOrderbook>> | undefined;
    if (withOrderbook) {
      orderbook = await getKalshiOrderbook(ticker);
    }

    return NextResponse.json({
      data: market,
      priceHistory,
      orderbook,
    });
  } catch (err) {
    console.error(`API /kalshi/markets/${ticker} error:`, err);
    return NextResponse.json(
      { error: "Failed to fetch Kalshi market", detail: err instanceof Error ? err.message : "Unknown" },
      { status: 502 },
    );
  }
}
