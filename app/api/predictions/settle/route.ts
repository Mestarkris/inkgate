import { getPrediction, storePrediction } from "@/lib/0g";
import { sendA0GI } from "@/lib/agents/wallet";

export async function POST(req: Request) {
  const { predictionId } = await req.json();
  const prediction = await getPrediction(predictionId) as Record<string, unknown> | null;
  if (!prediction) return Response.json({ error: "Prediction not found" }, { status: 404 });
  if (prediction.settled) return Response.json({ error: "Already settled" }, { status: 400 });

  const updated = { ...prediction, settled: true, settledAt: new Date().toISOString() };
  await storePrediction(predictionId, updated);
  return Response.json({ success: true, prediction: updated });
}
