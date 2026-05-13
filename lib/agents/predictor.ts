import { ogInference } from "@/lib/0g-compute";
import { getLivePrice } from "@/lib/prices";

export async function predictorAgent(topic: string): Promise<{ prediction: string; direction: string }> {
  const livePrice = await getLivePrice(topic).catch(() => "");

  const { content: prediction } = await ogInference(
    "You are the InkGate Predictor Agent on 0G Compute. Make precise 24-hour price predictions based on market data.",
    "24-hour prediction for " + topic +
      (livePrice ? "\nCurrent data: " + livePrice : "") +
      "\nSay UP or DOWN with a brief reason. Max 2 sentences.",
    100
  );

  const direction = prediction.toLowerCase().includes("up") ? "UP" : "DOWN";
  return { prediction, direction };
}
