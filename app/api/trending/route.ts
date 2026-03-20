const TOKENS = [
  { symbol: "BTC-USDT", name: "Bitcoin" },
  { symbol: "ETH-USDT", name: "Ethereum" },
  { symbol: "OKB-USDT", name: "OKB" },
  { symbol: "SOL-USDT", name: "Solana" },
  { symbol: "DOGE-USDT", name: "Dogecoin" },
  { symbol: "ARB-USDT", name: "Arbitrum" },
  { symbol: "OP-USDT", name: "Optimism" },
  { symbol: "MATIC-USDT", name: "Polygon" },
];

const MOCK_PRICES: Record<string, number> = {
  "BTC-USDT": 83000,
  "ETH-USDT": 3200,
  "OKB-USDT": 48,
  "SOL-USDT": 145,
  "DOGE-USDT": 0.18,
  "ARB-USDT": 1.2,
  "OP-USDT": 2.8,
  "MATIC-USDT": 0.95,
};

async function getTokenData(token: { symbol: string; name: string }) {
  try {
    const res = await fetch(
      "https://www.okx.com/api/v5/market/ticker?instId=" + token.symbol,
      { signal: AbortSignal.timeout(5000) }
    );
    const json = await res.json();
    const t = json.data?.[0];
    if (!t) throw new Error("No data");

    const price = Number(t.last);
    const open = Number(t.open24h);
    const change = ((price - open) / open * 100);

    return {
      symbol: token.symbol,
      name: token.name,
      price: price.toLocaleString(),
      change: change.toFixed(2),
      volume: Number(t.volCcy24h).toLocaleString(),
      bullish: change > 0,
      live: true,
    };
  } catch {
    // Fallback to mock data if OKX is unreachable
    const mockPrice = MOCK_PRICES[token.symbol] ?? 100;
    const mockChange = (Math.random() * 10 - 5).toFixed(2);
    return {
      symbol: token.symbol,
      name: token.name,
      price: mockPrice.toLocaleString(),
      change: mockChange,
      volume: (Math.random() * 1000000000).toLocaleString(),
      bullish: Number(mockChange) > 0,
      live: false,
    };
  }
}

export async function GET() {
  try {
    const results = await Promise.all(TOKENS.map(getTokenData));
    const tokens = results.sort((a, b) => Math.abs(Number(b.change)) - Math.abs(Number(a.change)));

    const topics = tokens.slice(0, 4).map((t) => ({
      title: Number(t.change) > 0
        ? "Why " + t.name + " is surging — up " + t.change + "% today"
        : "Why " + t.name + " is dropping — down " + Math.abs(Number(t.change)) + "% today",
      slug: "trending-" + t.name.toLowerCase(),
      price: "$" + t.price,
      change: t.change,
      bullish: t.bullish,
      volume: t.volume,
      live: t.live,
    }));

    return Response.json({ topics, tokens });
  } catch (err) {
    console.error("Trending API error:", err);
    return Response.json({ topics: [], tokens: [] }, { status: 500 });
  }
}