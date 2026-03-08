import { NextRequest, NextResponse } from "next/server";
import { getMarketById, getPriceHistory } from "@/lib/api/polymarket";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const withHistory = searchParams.get("history") === "true";
  const interval = (searchParams.get("interval") || "1m") as "1d" | "1w" | "1m" | "3m" | "all";

  try {
    const market = await getMarketById(id);
    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    let priceHistory: { t: number; p: number }[] | undefined;
    if (withHistory && market.clobTokenIds?.length) {
      priceHistory = await getPriceHistory(market.clobTokenIds[0], interval);
    }

    return NextResponse.json({
      data: market,
      priceHistory,
    });
  } catch (err) {
    console.error(`API /markets/${id} error:`, err);
    return NextResponse.json(
      { error: "Failed to fetch market", detail: err instanceof Error ? err.message : "Unknown" },
      { status: 502 },
    );
  }
}
