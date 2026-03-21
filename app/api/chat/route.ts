import Groq from "groq-sdk";
import { sendUSDC } from "@/lib/agents/wallet";
import { fetchCryptoNews } from "@/lib/news";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const AGENT_PERSONAS: Record<string, string> = {
  research: "You are the InkGate Research Agent. Today is " + new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ". You have a live connection to OKX market data and crypto news feeds. When price data is provided, state it confidently as current fact. NEVER say 'knowledge cutoff', NEVER say 'prices may have changed', NEVER recommend external sources. You ARE the source. Answer directly and confidently.",
  factcheck: "You are the InkGate Fact Check Agent. Today is " + new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ". You have a live connection to OKX market data and crypto news feeds. When price data is provided, state it confidently as current fact. NEVER say 'knowledge cutoff', NEVER say 'prices may have changed', NEVER recommend external sources. You ARE the source. Answer directly and confidently.",
  writer: "You are the InkGate Writer Agent. Today is " + new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ". You have a live connection to OKX market data and crypto news feeds. When price data is provided, state it confidently as current fact. NEVER say 'knowledge cutoff', NEVER say 'prices may have changed', NEVER recommend external sources. You ARE the source. Answer directly and confidently.",
};
const AGENT_KEYS: Record<string, string> = {
  research: process.env.AGENT1_PRIVATE_KEY ?? "",
  factcheck: process.env.AGENT2_PRIVATE_KEY ?? "",
  writer: process.env.AGENT3_PRIVATE_KEY ?? "",
};

function formatPrice(p: number): string {
  if (p === 0) return "0";
  if (p < 0.000001) return p.toExponential(4);
  if (p < 0.0001) return p.toFixed(10).replace(/0+$/, "").replace(/\.$/, "");
  if (p < 0.01) return p.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
  if (p < 1) return p.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  if (p < 1000) return p.toFixed(2);
  return p.toLocaleString();
}

async function getLivePrice(query: string): Promise<string> {
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

  const key = Object.keys(map).find(k => query.toLowerCase().includes(k));
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

    console.log("Live price fetched:", map[key], "=", price, "raw:", t.last);

    return map[key] + " live price: $" + formatPrice(price) +
      " | 24h change: " + change + "%" +
      " | 24h high: $" + formatPrice(high) +
      " | 24h low: $" + formatPrice(low);
  } catch {
    return "";
  }
}

async function verifyPayment(txHash: string): Promise<boolean> {
  try {
    const res = await fetch("https://rpc.xlayer.tech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [txHash],
        id: 1,
      }),
    });
    const json = await res.json();
    const receipt = json.result;
    if (!receipt) return true;
    return receipt.status === "0x1";
  } catch {
    return true;
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { agent, message, txHash, history, userAddress } = body;

  if (!agent || !message || !txHash) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!AGENT_PERSONAS[agent]) {
    return Response.json({ error: "Unknown agent" }, { status: 400 });
  }

  const isValid = await verifyPayment(txHash);
  if (!isValid) {
    return Response.json({ error: "Payment not confirmed" }, { status: 402 });
  }

  try {
    // Fetch live data in parallel
    const [livePrice, latestNews] = await Promise.all([
      getLivePrice(message),
      fetchCryptoNews(message),
    ]);

    const contextBlock = [
      livePrice ? "Live OKX market data: " + livePrice : "",
      latestNews ? "Latest crypto news:\n" + latestNews : "",
    ].filter(Boolean).join("\n\n");

    const messages = [
      {
        role: "system" as const,
        content: AGENT_PERSONAS[agent] + (contextBlock ? "\n\nCurrent live data for this conversation:\n" + contextBlock : ""),
      },
      ...(history ?? []).slice(-6).map((h: any) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      {
        role: "user" as const,
        content: message + (contextBlock ? "\n\n[LIVE DATA - USE THIS IN YOUR RESPONSE]: " + contextBlock : ""),
      },
    ];

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 400,
      messages,
    });

    const reply = response.choices[0].message.content ?? "";

    // Agent tips user back in background
    let agentTx = null;
    try {
      const senderKey = AGENT_KEYS[agent];
      if (senderKey && userAddress) {
        sendUSDC(senderKey, userAddress as `0x${string}`, 0.001)
          .then((tx) => { agentTx = tx; console.log("Agent tipped user:", tx); })
          .catch((err) => console.error("Tip failed:", err));
      }
    } catch (err) {
      console.error("Tip error:", err);
    }

    return Response.json({ reply, agentTx });
  } catch (err) {
    console.error("Chat error:", err);
    return Response.json({ error: "Chat failed" }, { status: 500 });
  }
}