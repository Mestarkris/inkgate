import { listPredictions, storePrediction } from "@/lib/0g";
import { ogInference } from "@/lib/0g-compute";

export async function GET() {
  const predictions = await listPredictions();
  return Response.json({ predictions, network: "0G Mainnet", storage: "0G Storage" });
}

export async function POST() {
  const topics = ["BTC-USDT", "ETH-USDT", "SOL-USDT"];
  const topic = topics[Math.floor(Math.random() * topics.length)];

  const { content } = await ogInference(
    "You are InkGate Predictor Agent. Make a concise 24-hour crypto price prediction.",
    `Make a 24-hour price prediction for ${topic}. Say UP or DOWN with a brief reason. Max 2 sentences.`,
    100
  );

  const prediction = {
    id: Date.now().toString(),
    topic,
    prediction: content,
    direction: content.toLowerCase().includes("up") ? "UP" : "DOWN",
    createdAt: new Date().toISOString(),
    yesPool: 0,
    noPool: 0,
    settled: false,
    network: "0G Mainnet",
    storedOn: "0G Storage",
  };

  await storePrediction(prediction.id, prediction);
  return Response.json(prediction);
}
