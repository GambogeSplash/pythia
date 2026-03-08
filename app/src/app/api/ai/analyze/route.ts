import { NextRequest, NextResponse } from "next/server";
import { getMarketById } from "@/lib/api/polymarket";
import type { Market } from "@/lib/api/types";

const SYSTEM_PROMPT =
  "You are Pythia, an AI analyst for prediction markets. Analyze market data, news, and probability movements to provide actionable trading insights. Be concise and data-driven. Always include a confidence score (1-10) and a recommended action (BUY YES, BUY NO, HOLD, or AVOID).";

function generateMockAnalysis(market: Market, question: string): string {
  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = Math.round(market.noPrice * 100);
  const isBullish = market.yesPrice > 0.5;
  const confidence = Math.min(9, Math.max(3, Math.round(Math.abs(market.yesPrice - 0.5) * 14 + 3)));
  const action = market.yesPrice > 0.75
    ? "BUY YES"
    : market.yesPrice < 0.25
      ? "BUY NO"
      : market.yesPrice > 0.55
        ? "BUY YES"
        : market.yesPrice < 0.45
          ? "BUY NO"
          : "HOLD";

  return `## Analysis: ${market.question}

**Current Price:** YES ${yesPercent}c | NO ${noPercent}c
**24h Volume:** $${(market.volume24h || 0).toLocaleString()}
**Liquidity:** $${(market.liquidity || 0).toLocaleString()}

### Market Assessment

The market is currently pricing YES at ${yesPercent}%, indicating ${isBullish ? "a bullish" : "a bearish"} consensus. With $${(market.volume24h || 0).toLocaleString()} in 24h volume, there is ${market.volume24h > 100_000 ? "strong" : market.volume24h > 10_000 ? "moderate" : "low"} trading activity.

${question ? `Regarding your question: "${question}" - Based on the current market positioning and volume patterns, ` : ""}${isBullish ? "the market appears to be trending toward resolution in the affirmative. The probability has maintained above 50%, suggesting sustained conviction among traders." : "sentiment leans negative, with the probability holding below 50%. This could present a contrarian opportunity if fundamental catalysts shift."}

### Key Factors
- Volume-to-liquidity ratio: ${market.liquidity > 0 ? (market.volume24h / market.liquidity).toFixed(2) + "x" : "N/A"} (${market.liquidity > 0 && market.volume24h / market.liquidity > 1 ? "high activity" : "normal activity"})
- Spread efficiency: ${Math.round(Math.abs(1 - market.yesPrice - market.noPrice) * 100)}c
- Time remaining: ${market.endDate ? new Date(market.endDate).toLocaleDateString() : "Unknown"}

### Recommendation

**Action:** ${action}
**Confidence:** ${confidence}/10
**Risk Level:** ${confidence >= 7 ? "Low" : confidence >= 5 ? "Medium" : "High"}

${action.includes("BUY") ? `Consider entering at ${action === "BUY YES" ? yesPercent : noPercent}c with a stop-loss at ${action === "BUY YES" ? Math.max(1, yesPercent - 15) : Math.max(1, noPercent - 15)}c.` : "Monitor for clearer directional signals before committing capital."}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { marketId, question, context } = body as {
      marketId: string;
      question?: string;
      context?: string;
    };

    if (!marketId) {
      return NextResponse.json(
        { error: "marketId is required" },
        { status: 400 },
      );
    }

    const market = await getMarketById(marketId);
    if (!market) {
      return NextResponse.json(
        { error: "Market not found" },
        { status: 404 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // --- Mock fallback (no API key) ---
    if (!apiKey) {
      const mockText = generateMockAnalysis(market, question || "");
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          // Simulate streaming by chunking the text
          const words = mockText.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? "" : " ") + words[i];
            controller.enqueue(encoder.encode(chunk));
            await new Promise((r) => setTimeout(r, 15));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    // --- Claude API streaming ---
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });

    const userMessage = [
      `Analyze this prediction market:`,
      `Question: ${market.question}`,
      `Description: ${market.description}`,
      `YES Price: ${Math.round(market.yesPrice * 100)}c`,
      `NO Price: ${Math.round(market.noPrice * 100)}c`,
      `24h Volume: $${(market.volume24h || 0).toLocaleString()}`,
      `Total Volume: $${(market.volume || 0).toLocaleString()}`,
      `Liquidity: $${(market.liquidity || 0).toLocaleString()}`,
      `Category: ${market.category}`,
      `End Date: ${market.endDate}`,
      context ? `\nAdditional context: ${context}` : "",
      question ? `\nUser question: ${question}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("AI analyze error:", err);
    return NextResponse.json(
      {
        error: "Failed to analyze market",
        detail: err instanceof Error ? err.message : "Unknown",
      },
      { status: 500 },
    );
  }
}
