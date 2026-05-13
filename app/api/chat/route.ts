import { sendA0GI } from "@/lib/agents/wallet";
import { ogInference } from "@/lib/0g-compute";
import { getLivePrice } from "@/lib/prices";

const SYSTEM_PROMPTS: Record<string, string> = {
  research: "You are the InkGate Research Agent running on 0G Compute Network (TEE-verified). Today is " + new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ". You have live crypto market data. State prices confidently as current fact. NEVER say knowledge cutoff.",
  factcheck: "You are the InkGate Fact Check Agent running on 0G Compute Network (TEE-verified). Today is " + new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ". Verify facts confidently. NEVER say knowledge cutoff.",
  writer: "You are the InkGate Writer Agent running on 0G Compute Network (TEE-verified). Today is " + new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ". Write sharp, insightful content. NEVER say knowledge cutoff.",
};

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
  const { message, agentId, txHash, userAddress } = await req.json();

  if (!txHash) {
    return Response.json({
      error: "Payment required",
      paymentInfo: { network: "0G Mainnet", chainId: 16661, amount: "0.01 A0GI", payTo: process.env.PAYMENT_RECIPIENT_ADDRESS },
    }, { status: 402 });
  }

  const isValid = await verifyPayment(txHash);
  if (!isValid) return Response.json({ error: "Payment not confirmed on 0G Mainnet" }, { status: 402 });

  const systemPrompt = SYSTEM_PROMPTS[agentId] || SYSTEM_PROMPTS.research;
  const livePrice = await getLivePrice(message).catch(() => "");
  const fullPrompt = (livePrice ? "Live market data: " + livePrice + "\n\n" : "") + message;

  const { content, verified } = await ogInference(systemPrompt, fullPrompt, 300);

  const agentKeys: Record<string, string> = {
    research: process.env.AGENT1_PRIVATE_KEY!,
    factcheck: process.env.AGENT2_PRIVATE_KEY!,
    writer: process.env.AGENT3_PRIVATE_KEY!,
  };

  let agentTx = "0x0";
  if (userAddress && agentKeys[agentId]) {
    agentTx = await sendA0GI(agentKeys[agentId], userAddress as `0x${string}`, 0.001).catch(() => "0x0");
  }

  const senderKey = agentKeys[agentId] || process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!;
  await sendA0GI(process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!, 
    (agentId === "research" ? process.env.AGENT1_ADDRESS : agentId === "factcheck" ? process.env.AGENT2_ADDRESS : process.env.AGENT3_ADDRESS) as `0x${string}`,
    0.003
  ).catch(() => {});

  return Response.json({
    reply: content,
    agentTx,
    teeVerified: verified,
    network: "0G Mainnet",
    computeProvider: "0G Compute (qwen-2.5-7b TEE)",
  });
}
