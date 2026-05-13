import { getPrediction, storePrediction } from "@/lib/0g";

export async function POST(req: Request) {
  const { predictionId, direction, amount, txHash } = await req.json();
  const prediction = await getPrediction(predictionId) as Record<string, unknown> | null;
  if (!prediction) return Response.json({ error: "Prediction not found" }, { status: 404 });

  const updated = {
    ...prediction,
    yesPool: direction === "YES" ? ((prediction.yesPool as number) || 0) + (amount || 0.01) : prediction.yesPool,
    noPool: direction === "NO" ? ((prediction.noPool as number) || 0) + (amount || 0.01) : prediction.noPool,
    lastBetTx: txHash,
    lastBetAt: new Date().toISOString(),
  };

  await storePrediction(predictionId, updated);
  return Response.json({ success: true, prediction: updated });
}
