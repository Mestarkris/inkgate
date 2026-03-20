import { Redis } from "@upstash/redis";
import { sendUSDC } from "@/lib/agents/wallet";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function getLivePrice(instId: string): Promise<number> {
  const res = await fetch("https://www.okx.com/api/v5/market/ticker?instId=" + instId);
  const json = await res.json();
  return Number(json.data?.[0]?.last ?? 0);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { predictionId } = body;

  try {
    const raw = await redis.get("prediction:" + predictionId) as string;
    if (!raw) return Response.json({ error: "Prediction not found" }, { status: 404 });

    const prediction = typeof raw === "string" ? JSON.parse(raw) : raw;

    if (prediction.status !== "open") {
      return Response.json({ error: "Already settled" }, { status: 400 });
    }

    const currentPrice = await getLivePrice(prediction.symbol);
    const agentWasRight = prediction.direction === "up"
      ? currentPrice >= prediction.targetPrice
      : currentPrice <= prediction.targetPrice;

    const winnerSide = agentWasRight ? "yes" : "no";
    const winners = winnerSide === "yes" ? prediction.yesBets : prediction.noBets;
    const totalPool = prediction.yesPool + prediction.noPool;
    const winnerPool = winnerSide === "yes" ? prediction.yesPool : prediction.noPool;

    const payoutTxs = [];

    // Pay winners automatically
    for (const winner of winners) {
      if (winnerPool > 0) {
        const share = winner.amount / winnerPool;
        const payout = totalPool * share * 0.95; // 5% protocol fee
        try {
          const tx = await sendUSDC(
            process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
            winner.bettor as `0x${string}`,
            payout
          );
          payoutTxs.push({ bettor: winner.bettor, payout, tx });
        } catch (err) {
          console.error("Payout failed for", winner.bettor, err);
        }
      }
    }

    prediction.status = "settled";
    prediction.settledAt = Date.now();
    prediction.finalPrice = currentPrice;
    prediction.agentWasRight = agentWasRight;
    prediction.winnerSide = winnerSide;
    prediction.payoutTxs = payoutTxs;

    await redis.set("prediction:" + predictionId, JSON.stringify(prediction));

    return Response.json({ success: true, prediction, payoutTxs });
  } catch (err) {
    console.error("Settlement error:", err);
    return Response.json({ error: "Settlement failed" }, { status: 500 });
  }
}