import { NextRequest, NextResponse } from "next/server";
import {
  getKalshiMarkets,
  searchKalshiMarkets,
  getTrendingKalshiMarkets,
  getClosingSoonKalshi,
  getNewKalshiMarkets,
} from "@/lib/api/kalshi";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q");
  const mode = searchParams.get("mode"); // "trending" | "closing" | "new" | default
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const cursor = searchParams.get("cursor") || undefined;

  try {
    if (query) {
      const markets = await searchKalshiMarkets(query, limit);
      return NextResponse.json({ data: markets, meta: { total: markets.length, limit } });
    }

    if (mode === "trending") {
      const markets = await getTrendingKalshiMarkets(limit);
      return NextResponse.json({ data: markets, meta: { total: markets.length, limit } });
    }

    if (mode === "closing") {
      const markets = await getClosingSoonKalshi(limit);
      return NextResponse.json({ data: markets, meta: { total: markets.length, limit } });
    }

    if (mode === "new") {
      const markets = await getNewKalshiMarkets(limit);
      return NextResponse.json({ data: markets, meta: { total: markets.length, limit } });
    }

    const result = await getKalshiMarkets({ limit, cursor, status: "open" });
    return NextResponse.json({
      data: result.markets,
      meta: { total: result.markets.length, limit, cursor: result.cursor },
    });
  } catch (err) {
    console.error("API /kalshi/markets error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Kalshi markets", detail: err instanceof Error ? err.message : "Unknown" },
      { status: 502 },
    );
  }
}
