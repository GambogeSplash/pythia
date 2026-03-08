import { NextRequest, NextResponse } from "next/server";
import { getMarkets, searchMarkets, getTrendingMarkets, getClosingSoon, getTopMovers, getNewMarkets, getMarketsByCategory } from "@/lib/api/polymarket";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q");
  const mode = searchParams.get("mode"); // "trending" | "closing" | default
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    if (query) {
      const markets = await searchMarkets(query, limit);
      return NextResponse.json({ data: markets, meta: { total: markets.length, limit, offset: 0 } });
    }

    if (mode === "trending") {
      const markets = await getTrendingMarkets(limit);
      return NextResponse.json({ data: markets, meta: { total: markets.length, limit, offset: 0 } });
    }

    if (mode === "closing") {
      const markets = await getClosingSoon(limit);
      return NextResponse.json({ data: markets, meta: { total: markets.length, limit, offset: 0 } });
    }

    if (mode === "movers") {
      const markets = await getTopMovers(limit);
      return NextResponse.json({ data: markets, meta: { total: markets.length, limit, offset: 0 } });
    }

    if (mode === "new") {
      const markets = await getNewMarkets(limit);
      return NextResponse.json({ data: markets, meta: { total: markets.length, limit, offset: 0 } });
    }

    if (mode === "category") {
      const category = searchParams.get("category") || "Other";
      const markets = await getMarketsByCategory(category, limit);
      return NextResponse.json({ data: markets, meta: { total: markets.length, limit, offset: 0 } });
    }

    const { markets, raw_count } = await getMarkets({ limit, offset });
    return NextResponse.json({ data: markets, meta: { total: raw_count, limit, offset } });
  } catch (err) {
    console.error("API /markets error:", err);
    return NextResponse.json(
      { error: "Failed to fetch markets", detail: err instanceof Error ? err.message : "Unknown" },
      { status: 502 },
    );
  }
}
