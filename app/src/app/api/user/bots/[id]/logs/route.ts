import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bots, botLogs } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getAuthUserId } from "@/lib/api/auth-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!db) {
    return NextResponse.json({ data: [] });
  }

  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { id: botId } = await params;

  // Verify ownership
  const [bot] = await db
    .select()
    .from(bots)
    .where(and(eq(bots.id, botId), eq(bots.userId, userId)));

  if (!bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  // Fetch last 50 logs
  const logs = await db
    .select()
    .from(botLogs)
    .where(eq(botLogs.botId, botId))
    .orderBy(desc(botLogs.createdAt))
    .limit(50);

  return NextResponse.json({ data: logs });
}
