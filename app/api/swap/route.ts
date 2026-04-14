/**
 * app/api/swap/route.ts
 * Exposes the OKX DEX swap quote endpoint (Onchain OS / Uniswap skill).
 *
 * GET /api/swap?from=OKB&to=USDC&amount=1
 * Returns a swap quote for any X Layer token pair.
 */
import { getSwapQuote, getBestRoute, formatSwapQuote } from "@/lib/swap";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? "OKB";
  const to = searchParams.get("to") ?? "USDC";
  const amount = parseFloat(searchParams.get("amount") ?? "1");

  if (isNaN(amount) || amount <= 0) {
    return Response.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    const [quote, routes] = await Promise.all([
      getSwapQuote(from, to, amount),
      getBestRoute(from, to, amount),
    ]);

    if (!quote) {
      return Response.json(
        {
          error: "Could not get swap quote. Check token symbols.",
          supportedTokens: ["OKB", "USDC", "USDT", "WOKB"],
        },
        { status: 404 }
      );
    }

    return Response.json({
      quote,
      routes,
      summary: formatSwapQuote(quote),
      network: "X Layer Mainnet",
      chainId: 196,
      dex: "OKX DEX Aggregator",
    });
  } catch (err) {
    console.error("Swap route error:", err);
    return Response.json({ error: "Swap quote failed" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

