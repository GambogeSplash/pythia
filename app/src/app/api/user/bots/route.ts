import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
const noDb = () => NextResponse.json({ data: [] });
import { bots } from "@/lib/db/schema";
import { getAuthUserId } from "@/lib/api/auth-helpers";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  if (!db) return noDb();
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const rows = await db
    .select()
    .from(bots)
    .where(eq(bots.userId, userId))
    .orderBy(desc(bots.createdAt));

  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const body = await req.json();
  const [row] = await db
    .insert(bots)
    .values({ ...body, userId })
    .returning();

  return NextResponse.json({ data: row }, { status: 201 });
}
