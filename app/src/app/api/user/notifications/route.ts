import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { alertEvents } from "@/lib/db/schema";
import { getAuthUserId } from "@/lib/api/auth-helpers";
import { eq, desc, and, inArray } from "drizzle-orm";

const noDb = () => NextResponse.json({ data: [] });

/* ------------------------------------------------------------------ */
/*  GET /api/user/notifications                                        */
/*  Fetch recent alert events (notifications) for the current user     */
/*  Query params: ?limit=50&unreadOnly=false                           */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  if (!db) return noDb();
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const conditions = [eq(alertEvents.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(alertEvents.read, false));
  }

  const rows = await db
    .select()
    .from(alertEvents)
    .where(and(...conditions))
    .orderBy(desc(alertEvents.triggeredAt))
    .limit(limit);

  // Count unread
  const unreadCount = rows.filter((r) => !r.read).length;

  return NextResponse.json({ data: rows, unreadCount });
}

/* ------------------------------------------------------------------ */
/*  PATCH /api/user/notifications                                      */
/*  Mark notifications as read                                         */
/*  Body: { ids: string[] } or { all: true }                           */
/* ------------------------------------------------------------------ */

export async function PATCH(req: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await req.json();

  if (body.all === true) {
    // Mark all notifications as read for this user
    await db
      .update(alertEvents)
      .set({ read: true })
      .where(
        and(eq(alertEvents.userId, userId), eq(alertEvents.read, false)),
      );

    return NextResponse.json({ success: true, message: "All marked as read" });
  }

  if (Array.isArray(body.ids) && body.ids.length > 0) {
    // Mark specific notifications as read
    await db
      .update(alertEvents)
      .set({ read: true })
      .where(
        and(
          eq(alertEvents.userId, userId),
          inArray(alertEvents.id, body.ids),
        ),
      );

    return NextResponse.json({
      success: true,
      message: `${body.ids.length} marked as read`,
    });
  }

  return NextResponse.json(
    { error: "Provide { ids: string[] } or { all: true }" },
    { status: 400 },
  );
}
