import { bullAgent, bearAgent, judgeAgent } from "@/lib/agents/debate";
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
    return Response.json({ error: "Payment required" }, { status: 402 });
  }

  const isValid = await verifyPayment(txHash);
  if (!isValid) {
    return Response.json({ error: "Payment not confirmed on X Layer" }, { status: 402 });
  }

  try {
    console.log("Debate Orchestrator: topic =", topic);

    // Pay Bull and Bear agents
    const bullTx = await sendUSDC(
      process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
      process.env.AGENT1_ADDRESS as `0x${string}`,
      0.004
    );
    const bearTx = await sendUSDC(
      process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
      process.env.AGENT2_ADDRESS as `0x${string}`,
      0.004
    );

    // Both agents argue simultaneously
    const [bullResult, bearResult] = await Promise.all([
      bullAgent(topic),
      bearAgent(topic),
    ]);

    // Judge decides winner
    const { verdict, winner, reasoning } = await judgeAgent(
      topic,
      bullResult.argument,
      bearResult.argument
    );

    await fetch(new URL("/api/stats", req.url), { method: "POST" }).catch(() => {});

    return Response.json({
      topic,
      bull: bullResult.argument,
      bear: bearResult.argument,
      winner,
      reasoning,
      verdict,
      agentPipeline: {
        orchestratorTx: txHash,
        bullTx,
        bearTx,
        bullToJudgeTx: bullResult.txHash,
        bearToJudgeTx: bearResult.txHash,
      },
    });
  } catch (err) {
    console.error("Debate error:", err);
    return Response.json(
      { error: "Debate failed: " + (err as Error).message },
      { status: 500 }
    );
  }
}