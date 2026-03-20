import Groq from "groq-sdk";
import { sendUSDC } from "./wallet";

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
    stablecoin: "BTC-USDT",
    memecoin: "BTC-USDT",
    web3: "ETH-USDT",
    trading: "BTC-USDT",
  };

  const key = Object.keys(map).find(k => topic.toLowerCase().includes(k));
  if (!key) return "";

  try {
    const res = await fetch(
      "https://www.okx.com/api/v5/market/ticker?instId=" + map[key]
    );
    const json = await res.json();
    const t = json.data?.[0];
    if (!t) return "";
    const price = Number(t.last);
    const open = Number(t.open24h);
    const high = Number(t.high24h);
    const low = Number(t.low24h);
    const change = ((price - open) / open * 100).toFixed(2);
    const volume = Number(t.volCcy24h).toLocaleString();

    return (
      "Live OKX Market API data for " + map[key] + ": " +
      "Current price = $" + price.toLocaleString() +
      " | 24h change = " + change + "%" +
      " | 24h high = $" + high.toLocaleString() +
      " | 24h low = $" + low.toLocaleString() +
      " | 24h volume = " + volume + " " + map[key].split("-")[1]
    );
  } catch {
    return "";
  }
}

export async function researchAgent(topic: string): Promise<{
  research: string;
  txHash: string;
}> {
  console.log("Research Agent: fetching live OKX market data...");
  const livePrice = await getLivePrice(topic);
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
        content: "You are a research agent with access to live onchain market data from OKX. Use the provided real-time data alongside your knowledge to produce thorough, data-driven research notes. Always cite the live price data when relevant. Be specific with numbers and data points.",
      },
      {
        role: "user",
        content: "Research this topic thoroughly: " + topic + (livePrice ? "\n\nLive market data from OKX API:\n" + livePrice : ""),
      },
    ],
  });

  const research = response.choices[0].message.content ?? "";

  const factCheckAddress = process.env.AGENT2_ADDRESS as `0x${string}`;
  const txHash = await sendUSDC(
    process.env.AGENT1_PRIVATE_KEY!,
    factCheckAddress,
    0.002
  );

  console.log("Research Agent: paid Fact Check Agent", txHash);
  return { research, txHash };
}