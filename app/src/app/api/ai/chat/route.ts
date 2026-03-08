import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Pythia, an expert AI assistant for prediction market trading. You specialize in:

- **Market Analysis**: Evaluating prediction market probabilities, identifying mispricings, and assessing market efficiency
- **Position Sizing**: Helping traders determine optimal bet sizes using Kelly criterion and risk-adjusted returns
- **Risk Management**: Setting stop-losses, managing portfolio exposure, and hedging strategies across correlated markets
- **Arbitrage Detection**: Finding price discrepancies across venues (Polymarket, Kalshi, Manifold)
- **Sentiment Analysis**: Interpreting volume patterns, price movements, and market microstructure signals

Be concise, data-driven, and actionable. When discussing specific trades, always mention risk/reward ratios. Format responses with markdown for readability. Use prediction market terminology (YES/NO contracts, cents pricing, probability %).`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MOCK_RESPONSES: Record<string, string> = {
  default: `Based on current market conditions, here are my observations:

**Top Opportunities:**
1. Markets with YES prices between 20-40c or 60-80c often present the best risk/reward
2. High volume-to-liquidity ratios (>1.5x) indicate strong conviction moves
3. Markets closing within 48h with wide spreads can offer quick scalping opportunities

**Risk Factors:**
- Correlated markets may move together — diversify across categories
- Low-liquidity markets have higher slippage risk
- Event-driven markets can gap significantly on news

Would you like me to analyze a specific market or strategy?`,
  arbitrage: `**Arbitrage Scanner Results:**

Cross-venue arbitrage opportunities exist when the same event is priced differently across platforms. Here's what to look for:

1. **Price Discrepancy >3c**: If Polymarket prices YES at 65c but Kalshi at 61c, that's a potential 4c arb
2. **Accounting for Fees**: Polymarket charges ~2% on winnings; Kalshi has per-contract fees. Net the fees before entering
3. **Execution Risk**: Prices can move while you place orders on both sides

**Current Strategy:**
- Focus on high-liquidity markets where spreads are tight
- Use limit orders to avoid slippage
- Monitor for resolution date alignment across venues

Want me to check specific markets for cross-venue pricing?`,
  risk: `**Portfolio Risk Assessment Framework:**

For prediction market portfolios, consider:

1. **Position Sizing** (Kelly Criterion):
   - f* = (bp - q) / b where b=odds, p=your probability estimate, q=1-p
   - Use fractional Kelly (25-50%) for safety
   - Never allocate >10% of portfolio to a single market

2. **Correlation Risk**:
   - Political markets often correlate (e.g., party sweep scenarios)
   - Crypto markets can move together on macro events
   - Diversify across 4+ categories

3. **Liquidity Risk**:
   - Ensure you can exit at <2% slippage
   - Markets with <$10K liquidity require smaller positions

4. **Time Decay**:
   - Markets approaching resolution compress to 0 or 100
   - Theta-like risk exists for positions held through resolution

Share your current positions and I'll provide a specific risk breakdown.`,
  movers: `**Top Movers Analysis:**

When analyzing market movements, I focus on three signals:

1. **Volume Spikes**: A 3x+ increase in 24h volume relative to 7-day average signals new information or sentiment shift
2. **Price Momentum**: Markets moving >5c in 24h with sustained volume suggest a trend, not noise
3. **Spread Compression**: Tightening bid-ask spreads during price moves indicate strong conviction

**Actionable Patterns:**
- Buy momentum continuation when volume confirms direction
- Fade extreme moves (>15c in 24h) when volume is declining
- Watch for volume divergence — price up but volume down is a warning sign

I can analyze specific top movers if you'd like more detail.`,
};

function getMockResponse(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || "";

  if (lastMessage.includes("arbitrage") || lastMessage.includes("arb")) {
    return MOCK_RESPONSES.arbitrage;
  }
  if (lastMessage.includes("risk") || lastMessage.includes("portfolio") || lastMessage.includes("position size")) {
    return MOCK_RESPONSES.risk;
  }
  if (lastMessage.includes("mover") || lastMessage.includes("momentum") || lastMessage.includes("top")) {
    return MOCK_RESPONSES.movers;
  }
  return MOCK_RESPONSES.default;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, marketContext } = body as {
      messages: ChatMessage[];
      marketContext?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // --- Mock fallback ---
    if (!apiKey) {
      const mockText = getMockResponse(messages);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const words = mockText.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? "" : " ") + words[i];
            controller.enqueue(encoder.encode(chunk));
            await new Promise((r) => setTimeout(r, 12));
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

    const systemPrompt = marketContext
      ? `${SYSTEM_PROMPT}\n\nCurrent market context:\n${marketContext}`
      : SYSTEM_PROMPT;

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
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
    console.error("AI chat error:", err);
    return NextResponse.json(
      {
        error: "Failed to process chat",
        detail: err instanceof Error ? err.message : "Unknown",
      },
      { status: 500 },
    );
  }
}
