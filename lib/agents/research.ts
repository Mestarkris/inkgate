/**
 * lib/agents/research.ts
 * Research Agent — fetches live OKX data + news, then produces research notes.
 * Improvement: uses shared getLivePrice from lib/prices.ts (no more duplication).
 */
import Groq from "groq-sdk";
import { fetchCryptoNews } from "../news";
import { getLivePrice } from "../prices";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

function getCurrentContext(): string {
  return (
    "Current date: " +
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }) +
    ". You are operating in 2026. Crypto markets have evolved significantly. " +
    "X Layer is a production ZK rollup. AI agents are mainstream."
  );
}

export async function researchAgent(topic: string): Promise<{
  research: string;
  txHash: string;
}> {
  console.log("Research Agent: fetching live data and news...");

  const [livePrice, latestNews] = await Promise.all([
    getLivePrice(topic),         // ← now from shared lib/prices.ts
    fetchCryptoNews(topic),
  ]);

  const currentContext = getCurrentContext();

  if (latestNews) console.log("Research Agent: got live news");
  if (livePrice) console.log("Research Agent: got live data:", livePrice);

  console.log("Research Agent: starting research on", topic);

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content:
          "You are a research agent operating in 2026. " +
          currentContext +
          " Use the provided real-time OKX market data as your primary source. " +
          "Always cite specific numbers, dates and current developments. " +
          "Never use outdated information. Output detailed research notes.",
      },
      {
        role: "user",
        content:
          `Research this topic thoroughly for today ${new Date().toLocaleDateString()}: ${topic}` +
          (livePrice ? `\n\nLive OKX market data:\n${livePrice}` : "") +
          (latestNews ? `\n\nLatest news from CoinDesk/CoinTelegraph:\n${latestNews}` : ""),
      },
    ],
  });

  const research = response.choices[0].message.content ?? "";

  // NOTE: research agent payment is sent by the Orchestrator upfront (agent1Tx).
  // txHash is returned as "orchestrator-funded" to reflect the actual flow.
  console.log("Research Agent: research complete");
  return { research, txHash: "orchestrator-funded" };
}

