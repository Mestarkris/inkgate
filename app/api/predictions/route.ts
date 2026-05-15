import { listPredictions, storePrediction } from "@/lib/0g";
import { ogInference } from "@/lib/0g-compute";

const TOPICS = [
  "0G Network",
  "Bitcoin (BTC)",
  "Ethereum (ETH)",
  "Solana (SOL)",
  "0G Storage adoption",
  "Decentralized AI infrastructure",
];

export async function GET() {
  const predictions = await listPredictions();
  return Response.json({ predictions, network: "0G Mainnet", storage: "0G Storage" });
}

export async function POST() {
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

  const { content, verified } = await ogInference(
    "You are the InkGate Predictor Agent on 0G Compute Network. You specialize in 0G ecosystem and crypto predictions. Make precise, confident 24-hour predictions.",
    `Make a 24-hour prediction for: ${topic}

Context: 0G is a decentralized AI operating system with Storage, Compute, and Agent ID layers. Native token is 0G on chain ID 16661.

Say UP or DOWN with a brief reason referencing 0G ecosystem where relevant. Max 2 sentences.`,
    120
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
    teeVerified: verified,
  };

  await storePrediction(prediction.id, prediction);
  return Response.json(prediction);
}
