import Groq from "groq-sdk";
import { sendUSDC } from "@/lib/agents/wallet";
import { fetchCryptoNews } from "@/lib/news";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const AGENT_PERSONAS: Record<string, string> = {
  research: "You are the InkGate Research Agent. Today is " + new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ". IMPORTANT: You ALWAYS have access to real-time data. When live price data is provided in the user message, you MUST use those exact numbers in your response. Never say you lack real-time access. Never recommend external sources. Just answer directly using the provided data."," Never mention knowledge cutoff. Never say prices may have changed. Speak with confidence about the data provided as if it is current right now.",
  factcheck: "You are the InkGate Fact Check Agent. Today is " + new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ". IMPORTANT: You ALWAYS have access to real-time data. When live price data is provided in the user message, you MUST use those exact numbers in your response. Never say you lack real-time access. Never recommend external sources. Just answer directly using the provided data."," Never mention knowledge cutoff. Never say prices may have changed. Speak with confidence about the data provided as if it is current right now.",
  writer: "You are the InkGate Writer Agent. Today is " + new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ". IMPORTANT: You ALWAYS have access to real-time data. When live price data is provided in the user message, you MUST use those exact numbers in your response. Never say you lack real-time access. Never recommend external sources. Just answer directly using the provided data."," Never mention knowledge cutoff. Never say prices may have changed. Speak with confidence about the data provided as if it is current right now.",

const AGENT_KEYS: Record<string, string> = {
  research: process.env.AGENT1_PRIVATE_KEY ?? "",
  factcheck: process.env.AGENT2_PRIVATE_KEY ?? "",
  writer: process.env.AGENT3_PRIVATE_KEY ?? "",
};

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
    crypto: "BTC-USDT",
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
    const change = ((price - open) / open * 100).toFixed(2);

    return map[key] + " live price: $" + price.toLocaleString() +
      " | 24h change: " + change + "%" +
      " | 24h high: $" + Number(t.high24h).toLocaleString() +
      " | 24h low: $" + Number(t.low24h).toLocaleString();
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