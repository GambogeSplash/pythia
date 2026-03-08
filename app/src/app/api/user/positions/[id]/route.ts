import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { positions } from "@/lib/db/schema";
import { getAuthUserId } from "@/lib/api/auth-helpers";
import { eq, and } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await ctx.params;
  const [row] = await db
    .select()
    .from(positions)
    .where(and(eq(positions.id, id), eq(positions.userId, userId)));

  if (!row) return NextResponse.json({ error: "Position not found" }, { status: 404 });
  return NextResponse.json({ data: row });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await ctx.params;
  const body = await req.json();
  const allowed: Record<string, unknown> = {};

  if (body.status !== undefined) {
    allowed.status = body.status;
    if (body.status === "closed") {
      allowed.closedAt = new Date();
    }
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const [row] = await db
    .update(positions)
    .set(allowed)
    .where(and(eq(positions.id, id), eq(positions.userId, userId)))
    .returning();

  if (!row) return NextResponse.json({ error: "Position not found" }, { status: 404 });
  return NextResponse.json({ data: row });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await ctx.params;
  const [row] = await db
    .delete(positions)
    .where(and(eq(positions.id, id), eq(positions.userId, userId)))
    .returning();

  if (!row) return NextResponse.json({ error: "Position not found" }, { status: 404 });
  return NextResponse.json({ data: row });
}
