import { NextResponse } from "next/server";
import { getTrendingMarkets } from "@/lib/api/polymarket";
import type { Market } from "@/lib/api/types";

export interface AISignal {
  marketId: string;
  question: string;
  signal: "bullish" | "bearish" | "neutral";
  confidence: number;
  reasoning: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
}

function deriveSignal(market: Market): AISignal {
  const yes = market.yesPrice;
  const volumeStrength = market.volume24h > 100_000 ? "high" : market.volume24h > 10_000 ? "moderate" : "low";
  const volLiqRatio = market.liquidity > 0 ? market.volume24h / market.liquidity : 0;

  // Signal derivation based on price positioning and volume
  let signal: AISignal["signal"];
  let confidence: number;
  let reasoning: string;
  let entryPrice: number;
  let targetPrice: number;
  let stopLoss: number;

  if (yes > 0.7) {
    signal = "bullish";
    confidence = Math.min(9, Math.round(yes * 10 + (volLiqRatio > 1 ? 1 : 0)));
    reasoning = `Strong YES positioning at ${Math.round(yes * 100)}c with ${volumeStrength} volume. Market consensus leans heavily affirmative. Vol/Liq ratio ${volLiqRatio.toFixed(1)}x suggests ${volLiqRatio > 1 ? "active conviction" : "steady positioning"}.`;
    entryPrice = Math.round(yes * 100) / 100;
    targetPrice = Math.min(0.95, Math.round((yes + 0.1) * 100) / 100);
    stopLoss = Math.max(0.05, Math.round((yes - 0.15) * 100) / 100);
  } else if (yes < 0.3) {
    signal = "bearish";
    confidence = Math.min(9, Math.round((1 - yes) * 10 + (volLiqRatio > 1 ? 1 : 0)));
    reasoning = `Weak YES pricing at ${Math.round(yes * 100)}c indicates bearish sentiment. ${volumeStrength.charAt(0).toUpperCase() + volumeStrength.slice(1)} volume with ${volLiqRatio.toFixed(1)}x vol/liq ratio. Consider NO position for upside.`;
    entryPrice = Math.round((1 - yes) * 100) / 100;
    targetPrice = Math.min(0.95, Math.round((1 - yes + 0.12) * 100) / 100);
    stopLoss = Math.max(0.05, Math.round((1 - yes - 0.15) * 100) / 100);
  } else if (yes > 0.55) {
    signal = "bullish";
    confidence = Math.min(7, Math.round(3 + volLiqRatio * 2 + (yes - 0.5) * 6));
    reasoning = `Slight bullish lean at ${Math.round(yes * 100)}c. ${volumeStrength.charAt(0).toUpperCase() + volumeStrength.slice(1)} trading activity. Market is moderately positioned but directional bias exists.`;
    entryPrice = Math.round(yes * 100) / 100;
    targetPrice = Math.min(0.9, Math.round((yes + 0.12) * 100) / 100);
    stopLoss = Math.max(0.05, Math.round((yes - 0.12) * 100) / 100);
  } else if (yes < 0.45) {
    signal = "bearish";
    confidence = Math.min(7, Math.round(3 + volLiqRatio * 2 + (0.5 - yes) * 6));
    reasoning = `Slight bearish tilt at ${Math.round(yes * 100)}c. Volume is ${volumeStrength}. Consider NO position with tight risk management.`;
    entryPrice = Math.round((1 - yes) * 100) / 100;
    targetPrice = Math.min(0.9, Math.round((1 - yes + 0.12) * 100) / 100);
    stopLoss = Math.max(0.05, Math.round((1 - yes - 0.12) * 100) / 100);
  } else {
    signal = "neutral";
    confidence = Math.min(5, Math.round(2 + volLiqRatio));
    reasoning = `Near 50/50 pricing at ${Math.round(yes * 100)}c. No clear directional edge. Wait for catalyst or price dislocation before entry.`;
    entryPrice = Math.round(yes * 100) / 100;
    targetPrice = Math.round((yes + 0.1) * 100) / 100;
    stopLoss = Math.max(0.05, Math.round((yes - 0.1) * 100) / 100);
  }

  return {
    marketId: market.id,
    question: market.question,
    signal,
    confidence: Math.max(1, Math.min(10, confidence)),
    reasoning,
    entryPrice,
    targetPrice,
    stopLoss,
  };
}

export async function GET() {
  try {
    const markets = await getTrendingMarkets(12);

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Without API key, generate signals from market data heuristics
    if (!apiKey) {
      const signals: AISignal[] = markets.map(deriveSignal);
      return NextResponse.json({ data: signals });
    }

    // With API key, use Claude to generate richer signals
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const client = new Anthropic({ apiKey });

      const marketsText = markets
        .map(
          (m, i) =>
            `${i + 1}. "${m.question}" — YES: ${Math.round(m.yesPrice * 100)}c, Volume24h: $${m.volume24h.toLocaleString()}, Liquidity: $${m.liquidity.toLocaleString()}, Category: ${m.category}, Ends: ${m.endDate}`,
        )
        .join("\n");

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system:
          "You are Pythia, a quantitative prediction market analyst. Generate trading signals as JSON. For each market, provide: signal (bullish/bearish/neutral), confidence (1-10), brief reasoning (1-2 sentences), entryPrice, targetPrice, and stopLoss (all as decimals 0-1). Return ONLY a JSON array, no markdown.",
        messages: [
          {
            role: "user",
            content: `Generate trading signals for these prediction markets:\n${marketsText}`,
          },
        ],
      });

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";

      try {
        const parsed = JSON.parse(text) as Array<{
          signal: "bullish" | "bearish" | "neutral";
          confidence: number;
          reasoning: string;
          entryPrice: number;
          targetPrice: number;
          stopLoss: number;
        }>;

        const signals: AISignal[] = markets.map((market, i) => ({
          marketId: market.id,
          question: market.question,
          signal: parsed[i]?.signal || "neutral",
          confidence: parsed[i]?.confidence || 5,
          reasoning: parsed[i]?.reasoning || "Analysis pending.",
          entryPrice: parsed[i]?.entryPrice || market.yesPrice,
          targetPrice: parsed[i]?.targetPrice || market.yesPrice + 0.1,
          stopLoss: parsed[i]?.stopLoss || Math.max(0.05, market.yesPrice - 0.1),
        }));

        return NextResponse.json({ data: signals });
      } catch {
        // If JSON parsing fails, fall back to heuristic signals
        const signals: AISignal[] = markets.map(deriveSignal);
        return NextResponse.json({ data: signals });
      }
    } catch {
      // API call failed, fall back to heuristic signals
      const signals: AISignal[] = markets.map(deriveSignal);
      return NextResponse.json({ data: signals });
    }
  } catch (err) {
    console.error("AI signals error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate signals",
        detail: err instanceof Error ? err.message : "Unknown",
      },
      { status: 500 },
    );
  }
}
