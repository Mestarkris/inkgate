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

export async function GET() {
  try {
    const results = await Promise.all(
      TOKENS.map(async (token) => {
        const res = await fetch(
          "https://www.okx.com/api/v5/market/ticker?instId=" + token.symbol
        );
        const json = await res.json();
        const t = json.data?.[0];
        if (!t) return null;

        const price = Number(t.last);
        const open = Number(t.open24h);
        const change = ((price - open) / open * 100);
        const volume = Number(t.volCcy24h);

        return {
          symbol: token.symbol,
          name: token.name,
          price: price.toLocaleString(),
          change: change.toFixed(2),
          volume: volume.toLocaleString(),
          trending: Math.abs(change) > 3 || volume > 1000000,
          bullish: change > 0,
        };
      })
    );

    const tokens = results.filter(Boolean);

    // Sort by absolute change — most volatile = most trending
    tokens.sort((a: any, b: any) => Math.abs(b.change) - Math.abs(a.change));

    // Generate article topics from trending tokens
    const topics = tokens.slice(0, 4).map((t: any) => ({
      title: t.bullish
        ? "Why " + t.name + " is surging — up " + t.change + "% today"
        : "Why " + t.name + " is dropping — down " + Math.abs(Number(t.change)) + "% today",
      slug: "trending-" + t.name.toLowerCase(),
      price: "$" + t.price,
      change: t.change,
      bullish: t.bullish,
      volume: t.volume,
    }));

    return Response.json({ topics, tokens });
  } catch (err) {
    console.error("Trending API error:", err);
    return Response.json({ topics: [], tokens: [] }, { status: 500 });
  }
}