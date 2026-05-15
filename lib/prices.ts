/**
 * lib/prices.ts
 * Crypto price fetcher using CoinGecko public API (no key required)
 */

const COINGECKO_IDS: Record<string, string> = {
  bitcoin: "bitcoin",       btc: "bitcoin",
  ethereum: "ethereum",     eth: "ethereum",
  solana: "solana",         sol: "solana",
  bnb: "binancecoin",       binance: "binancecoin",
  xrp: "ripple",            ripple: "ripple",
  cardano: "cardano",       ada: "cardano",
  dogecoin: "dogecoin",     doge: "dogecoin",
  polygon: "matic-network", matic: "matic-network",
  avalanche: "avalanche-2", avax: "avalanche-2",
  chainlink: "chainlink",   link: "chainlink",
  uniswap: "uniswap",       uni: "uniswap",
  arbitrum: "arbitrum",     arb: "arbitrum",
  optimism: "optimism",     op: "optimism",
  polkadot: "polkadot",     dot: "polkadot",
  litecoin: "litecoin",     ltc: "litecoin",
  shiba: "shiba-inu",       shib: "shiba-inu",
  tron: "tron",             trx: "tron",
  atom: "cosmos",           cosmos: "cosmos",
  near: "near",
  aptos: "aptos",           apt: "aptos",
  sui: "sui",
  pepe: "pepe",
  injective: "injective-protocol", inj: "injective-protocol",
  filecoin: "filecoin",     fil: "filecoin",
  aave: "aave",
  maker: "maker",           mkr: "maker",
  render: "render-token",   rndr: "render-token",
  ton: "the-open-network",
  og: "zero-gravity",       a0gi: "zero-gravity",
  crypto: "bitcoin",        defi: "ethereum",
};

export function formatPrice(p: number): string {
  if (p === 0) return "0";
  if (p < 0.000001) return p.toExponential(4);
  if (p < 0.01) return p.toFixed(8).replace(/0+$/, "");
  if (p < 1) return p.toFixed(6).replace(/0+$/, "");
  if (p < 1000) return p.toFixed(2);
  return p.toLocaleString();
}

export interface PriceData {
  id: string;
  price: number;
  change24h: string;
  high24h: number;
  low24h: number;
  formattedString: string;
}

export async function getLivePriceData(query: string): Promise<PriceData | null> {
  const key = Object.keys(COINGECKO_IDS).find(k => query.toLowerCase().includes(k));
  if (!key) return null;
  const id = COINGECKO_IDS[key];

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
      { signal: AbortSignal.timeout(5000), headers: { "Accept": "application/json" } }
    );
    const json = await res.json();
    const data = json[id];
    if (!data) return null;

    const price = data.usd;
    const change24h = (data.usd_24h_change ?? 0).toFixed(2);

    return {
      id,
      price,
      change24h,
      high24h: price,
      low24h: price,
      formattedString: `Live Market data (${new Date().toLocaleDateString()}): ${id.toUpperCase()} = $${formatPrice(price)} | 24h change: ${change24h}%`,
    };
  } catch {
    return null;
  }
}

export async function getLivePrice(query: string): Promise<string> {
  const data = await getLivePriceData(query);
  return data?.formattedString ?? "";
}

export async function getLivePriceBySymbol(symbol: string): Promise<number> {
  const FALLBACKS: Record<string, number> = {
    "BTC-USDT": 83000, "ETH-USDT": 3200, "SOL-USDT": 145,
  };
  const key = symbol.replace("-USDT", "").toLowerCase();
  const data = await getLivePriceData(key);
  return data?.price ?? FALLBACKS[symbol] ?? 100;
}

export const SYMBOL_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(COINGECKO_IDS).map(([k, v]) => [k, v])
);

/**
 * Fetch 0G native token price
 * Uses CoinGecko - will show price once listed
 */
export async function get0GPrice(): Promise<{ price: number | null; message: string }> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=zero-gravity&vs_currencies=usd&include_24hr_change=true",
      { signal: AbortSignal.timeout(5000) }
    );
    const json = await res.json();
    const data = json["zero-gravity"];
    if (data?.usd) {
      return {
        price: data.usd,
        message: `0G Token = $${formatPrice(data.usd)} | 24h: ${(data.usd_24h_change ?? 0).toFixed(2)}%`,
      };
    }
    return { price: null, message: "0G price: not yet listed on CoinGecko" };
  } catch {
    return { price: null, message: "0G price: unavailable" };
  }
}
