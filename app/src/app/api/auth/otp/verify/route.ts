import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ valid: false, error: "Email and code are required" }, { status: 400 });
    }

    // No DB — accept any 6-digit code for development
    if (!db) {
      console.log(`[OTP] No DB — accepting code ${code} for ${email}`);
      return NextResponse.json({ valid: true });
    }

    // Find a matching, unused, non-expired OTP
    const now = new Date();
    const otp = await db.query.otpCodes.findFirst({
      where: (o, { eq: eq_, and: and_, gt: gt_ }) =>
        and_(
          eq_(o.email, email),
          eq_(o.code, code),
          eq_(o.used, false),
          gt_(o.expiresAt, now),
        ),
    });

    if (!otp) {
      return NextResponse.json({ valid: false, error: "Invalid or expired code" }, { status: 400 });
    }

    // Mark as used
    await db
      .update(schema.otpCodes)
      .set({ used: true })
      .where(eq(schema.otpCodes.id, otp.id));

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("[OTP Verify] Error:", err);
    return NextResponse.json({ valid: false, error: "Verification failed" }, { status: 500 });
  }
}
