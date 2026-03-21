import Groq from "groq-sdk";
import { sendUSDC } from "./wallet";
import { fetchCryptoNews } from "../news";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getLivePrice(topic: string): Promise<string> {
const map: Record<string, string> = {
    bitcoin: "BTC-USDT",
    btc: "BTC-USDT",
    ethereum: "ETH-USDT",
    eth: "ETH-USDT",
    okb: "OKB-USDT",
    solana: "SOL-USDT",
    sol: "SOL-USDT",
    xlayer: "OKB-USDT",
    defi: "ETH-USDT",
    crypto: "BTC-USDT",
    bnb: "BNB-USDT",
    binance: "BNB-USDT",
    xrp: "XRP-USDT",
    ripple: "XRP-USDT",
    cardano: "ADA-USDT",
    ada: "ADA-USDT",
    dogecoin: "DOGE-USDT",
    doge: "DOGE-USDT",
    polygon: "MATIC-USDT",
    matic: "MATIC-USDT",
    avalanche: "AVAX-USDT",
    avax: "AVAX-USDT",
    chainlink: "LINK-USDT",
    link: "LINK-USDT",
    uniswap: "UNI-USDT",
    uni: "UNI-USDT",
    arbitrum: "ARB-USDT",
    arb: "ARB-USDT",
    optimism: "OP-USDT",
    op: "OP-USDT",
    polkadot: "DOT-USDT",
    dot: "DOT-USDT",
    litecoin: "LTC-USDT",
    ltc: "LTC-USDT",
    shiba: "SHIB-USDT",
    shib: "SHIB-USDT",
    tron: "TRX-USDT",
    trx: "TRX-USDT",
    atom: "ATOM-USDT",
    cosmos: "ATOM-USDT",
    near: "NEAR-USDT",
    aptos: "APT-USDT",
    apt: "APT-USDT",
    sui: "SUI-USDT",
    pepe: "PEPE-USDT",
    floki: "FLOKI-USDT",
    injective: "INJ-USDT",
    inj: "INJ-USDT",
    stacks: "STX-USDT",
    stx: "STX-USDT",
    filecoin: "FIL-USDT",
    fil: "FIL-USDT",
    aave: "AAVE-USDT",
    compound: "COMP-USDT",
    comp: "COMP-USDT",
    maker: "MKR-USDT",
    mkr: "MKR-USDT",
    lido: "LDO-USDT",
    ldo: "LDO-USDT",
    render: "RNDR-USDT",
    rndr: "RNDR-USDT",
    fetch: "FET-USDT",
    fet: "FET-USDT",
    worldcoin: "WLD-USDT",
    wld: "WLD-USDT",
    ton: "TON-USDT",
    notcoin: "NOT-USDT",
    not: "NOT-USDT",
    bonk: "BONK-USDT",
    wif: "WIF-USDT",
    popcat: "POPCAT-USDT",
    meme: "MEME-USDT",
  };

  const key = Object.keys(map).find(k => topic.toLowerCase().includes(k));
  if (!key) return "";

  try {
    const res = await fetch(
      "https://www.okx.com/api/v5/market/ticker?instId=" + map[key],
      { signal: AbortSignal.timeout(5000) }
    );
    const json = await res.json();
    const t = json.data?.[0];
    if (!t) return "";

    const price = Number(t.last);
    const open = Number(t.open24h);
    const high = Number(t.high24h);
    const low = Number(t.low24h);
    const change = ((price - open) / open * 100).toFixed(2);

    // Format price properly for small numbers
    function formatPrice(p: number): string {
      if (p < 0.0001) return p.toFixed(10).replace(/\.?0+$/, "");
      if (p < 0.01) return p.toFixed(8).replace(/\.?0+$/, "");
      if (p < 1) return p.toFixed(6).replace(/\.?0+$/, "");
      return p.toLocaleString();
    }

    return (
      "Live OKX Market data (" + new Date().toLocaleDateString() + "): " +
      map[key] + " = $" + formatPrice(price) +
      " | 24h change: " + change + "%" +
      " | 24h high: $" + formatPrice(high) +
      " | 24h low: $" + formatPrice(low)
    );
  } catch {
    return "";
  }
}

async function getCurrentContext(): Promise<string> {
  return "Current date: " + new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }) + ". You are operating in 2026. Crypto markets have evolved significantly. X Layer is a production ZK rollup. AI agents are mainstream.";
}

export async function researchAgent(topic: string): Promise<{
  research: string;
  txHash: string;
}> {
  console.log("Research Agent: fetching live data and news...");
  const [livePrice, currentContext, latestNews] = await Promise.all([
    getLivePrice(topic),
    getCurrentContext(),
    fetchCryptoNews(topic),
  ]);

  if (latestNews) {
    console.log("Research Agent: got live news");
  }

  if (livePrice) {
    console.log("Research Agent: got live data:", livePrice);
  }

  console.log("Research Agent: starting research on", topic);

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: "You are a research agent operating in 2026. " + currentContext + " Use the provided real-time OKX market data as your primary source. Always cite specific numbers, dates and current developments. Never use outdated information. Output detailed research notes.",
      },
      {
        role: "user",
       content: "Research this topic thoroughly for today " + new Date().toLocaleDateString() + ": " + topic +
          (livePrice ? "\n\nLive OKX market data:\n" + livePrice : "") +
          (latestNews ? "\n\nLatest news from CoinDesk/CoinTelegraph:\n" + latestNews : ""),
      },
    ],
  });

  const research = response.choices[0].message.content ?? "";
  const txHash = "deferred";

  console.log("Research Agent: research complete");
  return { research, txHash };
}