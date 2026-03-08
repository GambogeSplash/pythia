import { NextRequest, NextResponse } from "next/server";
import { getMarketById, getOrderbook } from "@/lib/api/polymarket";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const market = await getMarketById(id);
    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    if (!market.clobTokenIds?.length) {
      return NextResponse.json(
        { error: "Market has no CLOB token IDs — orderbook unavailable" },
        { status: 404 },
      );
    }

    // Fetch orderbook for the first token (YES outcome)
    const orderbook = await getOrderbook(market.clobTokenIds[0]);

    return NextResponse.json({
      data: orderbook,
      meta: {
        marketId: id,
        tokenId: market.clobTokenIds[0],
      },
    });
  } catch (err) {
    console.error(`API /markets/${id}/orderbook error:`, err);
    return NextResponse.json(
      { error: "Failed to fetch orderbook", detail: err instanceof Error ? err.message : "Unknown" },
      { status: 502 },
    );
  }
}
