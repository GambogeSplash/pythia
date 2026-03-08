import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bots } from "@/lib/db/schema";
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
    .from(bots)
    .where(and(eq(bots.id, id), eq(bots.userId, userId)));

  if (!row) return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  return NextResponse.json({ data: row });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await ctx.params;
  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  if (body.status !== undefined) allowed.status = body.status;
  if (body.name !== undefined) allowed.name = body.name;
  if (body.config !== undefined) allowed.config = body.config;

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const [row] = await db
    .update(bots)
    .set(allowed)
    .where(and(eq(bots.id, id), eq(bots.userId, userId)))
    .returning();

  if (!row) return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  return NextResponse.json({ data: row });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await ctx.params;
  const [row] = await db
    .delete(bots)
    .where(and(eq(bots.id, id), eq(bots.userId, userId)))
    .returning();

  if (!row) return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  return NextResponse.json({ data: row });
}
