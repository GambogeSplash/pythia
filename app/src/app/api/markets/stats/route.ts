import { NextResponse } from "next/server";
import { getMarkets } from "@/lib/api/polymarket";
import type { MarketStats } from "@/lib/api/types";

export async function GET() {
  try {
    // Fetch a large batch sorted by volume to compute aggregate stats
    const { markets } = await getMarkets({
      limit: 200,
      order: "volume24hr",
      ascending: false,
      active: true,
      closed: false,
    });

    const totalMarkets = markets.length;
    const totalVolume24h = markets.reduce((sum, m) => sum + m.volume24h, 0);
    const totalLiquidity = markets.reduce((sum, m) => sum + m.liquidity, 0);

    // Aggregate categories
    const categoryMap = new Map<string, { count: number; volume: number }>();
    for (const m of markets) {
      const cat = m.category;
      const existing = categoryMap.get(cat) || { count: 0, volume: 0 };
      existing.count += 1;
      existing.volume += m.volume24h;
      categoryMap.set(cat, existing);
    }

    const topCategories = Array.from(categoryMap.entries())
      .map(([name, { count, volume }]) => ({ name, count, volume }))
      .sort((a, b) => b.volume - a.volume);

    const stats: MarketStats = {
      totalMarkets,
      totalVolume24h,
      totalLiquidity,
      topCategories,
    };

    return NextResponse.json({ data: stats });
  } catch (err) {
    console.error("API /markets/stats error:", err);
    return NextResponse.json(
      { error: "Failed to fetch market stats", detail: err instanceof Error ? err.message : "Unknown" },
      { status: 502 },
    );
  }
}
