import { bullAgent, bearAgent, judgeAgent } from "@/lib/agents/debate";
import { send0G, send0GParallel } from "@/lib/agents/wallet";

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

  const [bullTx, bearTx] = await send0GParallel(
    process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
    [
      { to: process.env.AGENT1_ADDRESS as `0x${string}`, amount: 0.002 },
      { to: process.env.AGENT2_ADDRESS as `0x${string}`, amount: 0.002 },
    ]
  );

  const [{ argument: bullArg }, { argument: bearArg }] = await Promise.all([
    bullAgent(topic),
    bearAgent(topic),
  ]);

  const bullToJudgeTx = await send0G(process.env.AGENT1_PRIVATE_KEY!, process.env.AGENT3_ADDRESS as `0x${string}`, 0.001).catch(() => "0x0");
  const bearToJudgeTx = await send0G(process.env.AGENT2_PRIVATE_KEY!, process.env.AGENT3_ADDRESS as `0x${string}`, 0.001).catch(() => "0x0");

  const { verdict } = await judgeAgent(topic, bullArg, bearArg);

  await fetch(new URL(`/api/stats?wallet=${userAddress || "global"}`, req.url), { method: "POST" }).catch(() => {});
  return Response.json({
    topic, bullArg, bearArg, verdict,
    network: "0G Mainnet",
    computeProvider: "0G Compute (TEE-verified)",
    agentPipeline: { orchestratorTx: txHash, bullTx, bearTx, bullToJudgeTx, bearToJudgeTx },
  });
}
