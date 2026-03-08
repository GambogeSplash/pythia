import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[OTP] Code for ${email}: ${code}`);
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Pythia <onboarding@resend.dev>",
      to: email,
      subject: "Your Pythia verification code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px; background: #060707; color: #fff;">
          <h2 style="margin: 0 0 8px; font-size: 18px; font-weight: 700;">Pythia</h2>
          <p style="margin: 0 0 24px; font-size: 13px; color: #666;">Your verification code</p>
          <div style="background: #0D0D0E; border: 1px solid #1A1B1D; border-radius: 10px; padding: 24px; text-align: center;">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #00FF85;">${code}</span>
          </div>
          <p style="margin: 16px 0 0; font-size: 11px; color: #444;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[OTP] Failed to send email:", err);
    console.log(`[OTP] Fallback — Code for ${email}: ${code}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (db) {
      // Invalidate any existing unused codes for this email
      await db
        .update(schema.otpCodes)
        .set({ used: true })
        .where(and(eq(schema.otpCodes.email, email), eq(schema.otpCodes.used, false)));

      // Insert new code
      await db.insert(schema.otpCodes).values({
        email,
        code,
        expiresAt,
      });
    } else {
      // No DB — just log
      console.log(`[OTP] No DB configured. Code for ${email}: ${code}`);
    }

    await sendOtpEmail(email, code);

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("[OTP] Error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
