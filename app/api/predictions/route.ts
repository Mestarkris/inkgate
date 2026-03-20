import { Redis } from "@upstash/redis";
import { predictorAgent } from "@/lib/agents/predictor";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const TOKENS = [
  { symbol: "BTC-USDT", name: "Bitcoin" },
  { symbol: "ETH-USDT", name: "Ethereum" },
  { symbol: "OKB-USDT", name: "OKB" },
  { symbol: "SOL-USDT", name: "Solana" },
];

async function getLivePrice(instId: string): Promise<number> {
  const res = await fetch("https://www.okx.com/api/v5/market/ticker?instId=" + instId);
  const json = await res.json();
  return Number(json.data?.[0]?.last ?? 0);
}

export async function GET() {
  try {
    const keys = await redis.keys("prediction:*");
    const predictions = [];

    for (const key of keys) {
      const p = await redis.get(key);
      if (p) predictions.push(p);
    }

    predictions.sort((a: any, b: any) => b.createdAt - a.createdAt);
    return Response.json({ predictions });
  } catch {
    return Response.json({ predictions: [] });
  }
}

export async function POST() {
  try {
    const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
    const price = await getLivePrice(token.symbol);

    if (!price) {
      return Response.json({ error: "Could not fetch price" }, { status: 500 });
    }

    const result = await predictorAgent(token.symbol, price);

    const prediction = {
      id: "pred_" + Date.now(),
      symbol: token.symbol,
      name: token.name,
      currentPrice: price,
      targetPrice: result.targetPrice,
      direction: result.direction,
      prediction: result.prediction,
      confidence: result.confidence,
      reasoning: result.reasoning,
      yesPool: 0,
      noPool: 0,
      yesBets: [] as any[],
      noBets: [] as any[],
      status: "open",
      createdAt: Date.now(),
      settlesAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    await redis.set("prediction:" + prediction.id, JSON.stringify(prediction));
    await redis.expire("prediction:" + prediction.id, 7 * 24 * 60 * 60);

    return Response.json({ prediction });
  } catch (err) {
    console.error("Prediction error:", err);
    return Response.json({ error: "Failed to create prediction" }, { status: 500 });
  }
}