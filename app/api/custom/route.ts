import { researchAgent } from "@/lib/agents/research";
import { factCheckAgent } from "@/lib/agents/factcheck";
import { writerAgent } from "@/lib/agents/writer";
import { sendUSDC } from "@/lib/agents/wallet";

async function verifyPayment(txHash: string): Promise<boolean> {
  try {
    const res = await fetch("https://rpc.xlayer.tech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [txHash],
        id: 1,
      }),
    });
    const json = await res.json();
    const receipt = json.result;
    if (!receipt) return true;
    return receipt.status === "0x1";
  } catch {
    return true;
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { topic, txHash } = body;

  if (!topic || topic.trim().length < 3) {
    return Response.json({ error: "Topic too short" }, { status: 400 });
  }

  if (!txHash) {
    return Response.json(
      {
        error: "Payment required",
        x402Version: 1,
        accepts: [
          {
            scheme: "exact",
            network: "eip155:196",
            maxAmountRequired: "10000",
            description: "InkGate custom article — " + topic,
            payTo: process.env.PAYMENT_RECIPIENT_ADDRESS,
            asset: "0x74b7F16337b8972027F6196A17a631aC6dE26d22",
          },
        ],
      },
      { status: 402 }
    );
  }

  const isValid = await verifyPayment(txHash);
  if (!isValid) {
    return Response.json(
      { error: "Payment not confirmed on X Layer" },
      { status: 402 }
    );
  }

  try {
    console.log("Orchestrator: custom topic received:", topic);

    const agent1Tx = await sendUSDC(
      process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
      process.env.AGENT1_ADDRESS as `0x${string}`,
      0.004
    );
    const agent2Tx = await sendUSDC(
      process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
      process.env.AGENT2_ADDRESS as `0x${string}`,
      0.003
    );
    const agent3Tx = await sendUSDC(
      process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
      process.env.AGENT3_ADDRESS as `0x${string}`,
      0.003
    );

    const { research, txHash: researchTx } = await researchAgent(topic);
    const { verifiedResearch, txHash: factCheckTx } = await factCheckAgent(topic, research);
    const { article: content } = await writerAgent(topic, verifiedResearch);

    await fetch(new URL("/api/stats", req.url), { method: "POST" }).catch(() => {});

    return Response.json({
      topic,
      content,
      generatedAt: new Date().toISOString(),
      agentPipeline: {
        orchestratorTx: txHash,
        agent1Tx,
        agent2Tx,
        agent3Tx,
        researchTx,
        factCheckTx,
      },
    });
  } catch (err) {
    console.error("Custom article error:", err);
    return Response.json(
      { error: "Agent pipeline failed: " + (err as Error).message },
      { status: 500 }
    );
  }
}