export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&price_change_percentage=24h",
      { signal: AbortSignal.timeout(8000), headers: { "Accept": "application/json" } }
    );

    if (!res.ok) throw new Error("CoinGecko unavailable");
    const coins = await res.json();

    const trending = coins.map((c: any) => ({
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      price: c.current_price,
      change24h: c.price_change_percentage_24h?.toFixed(2) ?? "0",
      marketCap: c.market_cap,
      volume24h: c.total_volume,
      network: "0G Mainnet",
    }));

    return Response.json({ trending, source: "CoinGecko", updatedAt: new Date().toISOString() });
  } catch {
    // Fallback mock data
    return Response.json({
      trending: [
        { symbol: "BTC", name: "Bitcoin", price: 83000, change24h: "1.2", network: "0G Mainnet" },
        { symbol: "ETH", name: "Ethereum", price: 3200, change24h: "-0.5", network: "0G Mainnet" },
        { symbol: "SOL", name: "Solana", price: 145, change24h: "2.1", network: "0G Mainnet" },
      ],
      source: "fallback",
      updatedAt: new Date().toISOString(),
    });
  }
}
