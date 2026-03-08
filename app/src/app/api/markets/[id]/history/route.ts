import { NextRequest, NextResponse } from "next/server";
import { getMarketById, getPriceHistory } from "@/lib/api/polymarket";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const interval = (searchParams.get("interval") || "1m") as "1d" | "1w" | "1m" | "3m" | "all";
  const fidelity = parseInt(searchParams.get("fidelity") || "60", 10);

  try {
    const market = await getMarketById(id);
    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    if (!market.clobTokenIds?.length) {
      return NextResponse.json(
        { error: "Market has no CLOB token IDs — price history unavailable" },
        { status: 404 },
      );
    }

    const history = await getPriceHistory(market.clobTokenIds[0], interval, fidelity);

    return NextResponse.json({
      data: history,
      meta: {
        marketId: id,
        tokenId: market.clobTokenIds[0],
        interval,
        fidelity,
        points: history.length,
      },
    });
  } catch (err) {
    console.error(`API /markets/${id}/history error:`, err);
    return NextResponse.json(
      { error: "Failed to fetch price history", detail: err instanceof Error ? err.message : "Unknown" },
      { status: 502 },
    );
  }
}
