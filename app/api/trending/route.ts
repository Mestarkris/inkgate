export async function GET() {
  try {
    // Fetch top coins + 0G token together
    const [topRes, ogRes] = await Promise.all([
      fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&price_change_percentage=24h", { signal: AbortSignal.timeout(8000) }),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=zero-gravity&vs_currencies=usd&include_24hr_change=true", { signal: AbortSignal.timeout(8000) }),
    ]);

    const topCoins = topRes.ok ? await topRes.json() : [];
    const ogData = ogRes.ok ? await ogRes.json() : {};

    const ogPrice = ogData["zero-gravity"]?.usd ?? null;
    const ogChange = ogData["zero-gravity"]?.usd_24h_change?.toFixed(2) ?? "0";

    const og = {
      symbol: "0G",
      name: "0G Network",
      price: ogPrice ?? 0.56,
      change24h: ogChange,
      is0G: true,
    };

    const filtered = topCoins
      .filter((c: any) => !["XRP", "USDC", "USDT"].includes(c.symbol.toUpperCase()))
      .slice(0, 5)
      .map((c: any) => ({
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        price: c.current_price,
        change24h: c.price_change_percentage_24h?.toFixed(2) ?? "0",
      }));

    return Response.json({ trending: [og, ...filtered], source: "CoinGecko", updatedAt: new Date().toISOString() });
  } catch {
    return Response.json({
      trending: [
        { symbol: "0G", name: "0G Network", price: 0.56, change24h: "4.20", is0G: true },
        { symbol: "BTC", price: 83000, change24h: "1.2" },
        { symbol: "ETH", price: 2258, change24h: "-1.91" },
        { symbol: "BNB", price: 672, change24h: "-0.74" },
        { symbol: "SOL", price: 147, change24h: "2.1" },
      ],
      source: "fallback",
      updatedAt: new Date().toISOString(),
    });
  }
}
