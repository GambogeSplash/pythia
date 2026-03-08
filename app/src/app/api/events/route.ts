import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/api/polymarket";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    const events = await getEvents({ limit, offset });
    return NextResponse.json({ data: events, meta: { total: events.length, limit, offset } });
  } catch (err) {
    console.error("API /events error:", err);
    return NextResponse.json(
      { error: "Failed to fetch events", detail: err instanceof Error ? err.message : "Unknown" },
      { status: 502 },
    );
  }
}
