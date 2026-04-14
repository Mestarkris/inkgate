/**
 * lib/prices.ts
 * Shared OKX price fetcher — single source of truth.
 * Replaces duplicate getLivePrice() in research.ts and chat/route.ts
 */

export const SYMBOL_MAP: Record<string, string> = {
  bitcoin: "BTC-USDT",   btc: "BTC-USDT",
  ethereum: "ETH-USDT",  eth: "ETH-USDT",
  okb: "OKB-USDT",       xlayer: "OKB-USDT",
  solana: "SOL-USDT",    sol: "SOL-USDT",
  defi: "ETH-USDT",      crypto: "BTC-USDT",
  bnb: "BNB-USDT",       binance: "BNB-USDT",
  xrp: "XRP-USDT",       ripple: "XRP-USDT",
  cardano: "ADA-USDT",   ada: "ADA-USDT",
  dogecoin: "DOGE-USDT", doge: "DOGE-USDT",
  polygon: "MATIC-USDT", matic: "MATIC-USDT",
  avalanche: "AVAX-USDT",avax: "AVAX-USDT",
  chainlink: "LINK-USDT",link: "LINK-USDT",
  uniswap: "UNI-USDT",   uni: "UNI-USDT",
  arbitrum: "ARB-USDT",  arb: "ARB-USDT",
  optimism: "OP-USDT",   op: "OP-USDT",
  polkadot: "DOT-USDT",  dot: "DOT-USDT",
  litecoin: "LTC-USDT",  ltc: "LTC-USDT",
  shiba: "SHIB-USDT",    shib: "SHIB-USDT",
  tron: "TRX-USDT",      trx: "TRX-USDT",
  atom: "ATOM-USDT",     cosmos: "ATOM-USDT",
  near: "NEAR-USDT",
  aptos: "APT-USDT",     apt: "APT-USDT",
  sui: "SUI-USDT",
  pepe: "PEPE-USDT",
  floki: "FLOKI-USDT",
  injective: "INJ-USDT", inj: "INJ-USDT",
  stacks: "STX-USDT",    stx: "STX-USDT",
  filecoin: "FIL-USDT",  fil: "FIL-USDT",
  aave: "AAVE-USDT",
  compound: "COMP-USDT", comp: "COMP-USDT",
  maker: "MKR-USDT",     mkr: "MKR-USDT",
  lido: "LDO-USDT",      ldo: "LDO-USDT",
  render: "RNDR-USDT",   rndr: "RNDR-USDT",
  fetch: "FET-USDT",     fet: "FET-USDT",
  worldcoin: "WLD-USDT", wld: "WLD-USDT",
  ton: "TON-USDT",
  notcoin: "NOT-USDT",   not: "NOT-USDT",
  bonk: "BONK-USDT",
  wif: "WIF-USDT",
  popcat: "POPCAT-USDT",
  meme: "MEME-USDT",
};

export function formatPrice(p: number): string {
  if (p === 0) return "0";
  if (p < 0.000001) return p.toExponential(4);
  if (p < 0.0001) return p.toFixed(10).replace(/0+$/, "").replace(/\.$/, "");
  if (p < 0.01) return p.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
  if (p < 1) return p.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  if (p < 1000) return p.toFixed(2);
  return p.toLocaleString();
}

export interface PriceData {
  instId: string;
  price: number;
  change24h: string;
  high24h: number;
  low24h: number;
  formattedString: string;
}

export async function getLivePrice(query: string): Promise<string> {
  const data = await getLivePriceData(query);
  return data?.formattedString ?? "";
}

export async function getLivePriceData(query: string): Promise<PriceData | null> {
  const key = Object.keys(SYMBOL_MAP).find((k) =>
    query.toLowerCase().includes(k)
  );
  if (!key) return null;

  const instId = SYMBOL_MAP[key];
  try {
    const res = await fetch(
      `https://www.okx.com/api/v5/market/ticker?instId=${instId}`,
      { signal: AbortSignal.timeout(5000) }
    );
    const json = await res.json();
    const t = json.data?.[0];
    if (!t) return null;

    const price = Number(t.last);
    const open = Number(t.open24h);
    const high24h = Number(t.high24h);
    const low24h = Number(t.low24h);
    const change24h = (((price - open) / open) * 100).toFixed(2);

    return {
      instId,
      price,
      change24h,
      high24h,
      low24h,
      formattedString:
        `Live OKX Market data (${new Date().toLocaleDateString()}): ` +
        `${instId} = $${formatPrice(price)}` +
        ` | 24h change: ${change24h}%` +
        ` | 24h high: $${formatPrice(high24h)}` +
        ` | 24h low: $${formatPrice(low24h)}`,
    };
  } catch {
    return null;
  }
}

/** Fetch price by exact instId symbol (e.g. "BTC-USDT") */
export async function getLivePriceBySymbol(instId: string): Promise<number> {
  const FALLBACKS: Record<string, number> = {
    "BTC-USDT": 83000, "ETH-USDT": 3200,
    "OKB-USDT": 48,    "SOL-USDT": 145,
  };
  try {
    const res = await fetch(
      `https://www.okx.com/api/v5/market/ticker?instId=${instId}`,
      { signal: AbortSignal.timeout(5000) }
    );
    const json = await res.json();
    return Number(json.data?.[0]?.last ?? FALLBACKS[instId] ?? 100);
  } catch {
    return FALLBACKS[instId] ?? 100;
  }
}

