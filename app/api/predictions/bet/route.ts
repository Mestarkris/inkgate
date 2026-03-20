import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: Request) {
  const body = await req.json();
  const { predictionId, side, txHash, bettor, amount } = body;

  if (!predictionId || !side || !txHash || !bettor) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const raw = await redis.get("prediction:" + predictionId) as string;
    if (!raw) return Response.json({ error: "Prediction not found" }, { status: 404 });

    const prediction = typeof raw === "string" ? JSON.parse(raw) : raw;

    if (prediction.status !== "open") {
      return Response.json({ error: "Prediction is closed" }, { status: 400 });
    }

    const bet = { bettor, txHash, amount: amount ?? 0.01, timestamp: Date.now() };

    if (side === "yes") {
      prediction.yesBets.push(bet);
      prediction.yesPool += bet.amount;
    } else {
      prediction.noBets.push(bet);
      prediction.noPool += bet.amount;
    }

    await redis.set("prediction:" + predictionId, JSON.stringify(prediction));

    return Response.json({ success: true, prediction });
  } catch (err) {
    console.error("Bet error:", err);
    return Response.json({ error: "Failed to place bet" }, { status: 500 });
  }
}