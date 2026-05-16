import { researchAgent } from "@/lib/agents/research";
import { factCheckAgent } from "@/lib/agents/factcheck";
import { writerAgent } from "@/lib/agents/writer";
import { send0GParallel } from "@/lib/agents/wallet";
import { storeArticle } from "@/lib/0g";

async function verifyPayment(txHash: string): Promise<boolean> {
  try {
    const res = await fetch("https://evmrpc.0g.ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getTransactionReceipt", params: [txHash], id: 1 }),
    });
    const json = await res.json();
    if (!json.result) return true;
    return json.result.status === "0x1";
  } catch { return true; }
}

export async function POST(req: Request) {
  const { topic, txHash, userAddress } = await req.json();

  if (!txHash) {
    return Response.json({
      error: "Payment required",
      paymentInfo: { network: "0G Mainnet", chainId: 16661, amount: "0.01 0G", payTo: process.env.PAYMENT_RECIPIENT_ADDRESS },
    }, { status: 402 });
  }

  const isValid = await verifyPayment(txHash);
  if (!isValid) return Response.json({ error: "Payment not confirmed on 0G Mainnet" }, { status: 402 });

  const [agent1Tx, agent2Tx, agent3Tx] = await send0GParallel(
    process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
    [
      { to: process.env.AGENT1_ADDRESS as `0x${string}`, amount: 0.002 },
      { to: process.env.AGENT2_ADDRESS as `0x${string}`, amount: 0.002 },
      { to: process.env.AGENT3_ADDRESS as `0x${string}`, amount: 0.002 },
    ]
  );

  const { research, txHash: researchTx } = await researchAgent(topic);
  const { verifiedResearch, txHash: factCheckTx } = await factCheckAgent(topic, research);
  const { article: content } = await writerAgent(topic, verifiedResearch);

  const slug = topic.toLowerCase().replace(/\s+/g, "-").slice(0, 50);
  const ogHash = await storeArticle({
    slug, title: topic, content,
    agentPipeline: { orchestratorTx: txHash, agent1Tx, agent2Tx, agent3Tx, researchTx, factCheckTx },
    generatedAt: new Date().toISOString(), txHash,
  }).catch(() => null);

  await fetch(new URL(`/api/stats?wallet=${userAddress || "global"}`, req.url), { method: "POST" }).catch(() => {});
  return Response.json({
    title: topic, content,
    generatedAt: new Date().toISOString(),
    ogStorageHash: ogHash,
    network: "0G Mainnet",
    agentPipeline: { orchestratorTx: txHash, agent1Tx, agent2Tx, agent3Tx, researchTx, factCheckTx },
  });
}
