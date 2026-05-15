import { send0G } from "@/lib/agents/wallet";
import { ogInference } from "@/lib/0g-compute";
import { getLivePrice, get0GPrice } from "@/lib/prices";

const OG_CONTEXT = `
You are running on 0G Network — a decentralized AI operating system.
0G Network facts:
- Native token: 0G (ticker: 0G), trading on Binance, Gate.io, Bitget. The old testnet name was A0GI — that no longer applies.
- Chain ID: 16661 (0G Mainnet)
- 0G Storage: decentralized storage optimized for AI (petabyte-scale)
- 0G Compute: decentralized GPU marketplace with TEE-verified inference
- 0G Agent ID: tokenized identity standard for AI agents
- Explorer: chainscan.0g.ai
- RPC: evmrpc.0g.ai
- InkGate is built on 0G — articles stored on 0G Storage, inference on 0G Compute
When asked about the 0G token price: use ONLY the live market data provided in the prompt prefixed with "Live 0G token price:". If no live price data is provided in the prompt, say "I don't have the current price right now, please check CoinGecko or Binance." NEVER invent or guess a price.
When asked about 0G token: call it "0G" only. Never say A0GI or OG as a ticker.
Always be helpful and accurate about the 0G ecosystem.
`;

const SYSTEM_PROMPTS: Record<string, string> = {
  research: "You are the InkGate Research Agent running on 0G Compute Network (TEE-verified). Today is " + new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ". You have live crypto market data and deep knowledge of the 0G ecosystem." + OG_CONTEXT + "State prices confidently. NEVER say knowledge cutoff. NEVER say you cannot find information about 0G.",
  factcheck: "You are the InkGate Fact Check Agent running on 0G Compute Network (TEE-verified). Today is " + new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + "." + OG_CONTEXT + "Verify facts confidently. NEVER say knowledge cutoff.",
  writer: "You are the InkGate Writer Agent running on 0G Compute Network (TEE-verified). Today is " + new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + "." + OG_CONTEXT + "Write sharp, insightful content about 0G and crypto. NEVER say knowledge cutoff.",
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
      paymentInfo: { network: "0G Mainnet", chainId: 16661, amount: "0.01 0G", payTo: process.env.PAYMENT_RECIPIENT_ADDRESS },
    }, { status: 402 });
  }

  const isValid = await verifyPayment(txHash);
  if (!isValid) return Response.json({ error: "Payment not confirmed on 0G Mainnet" }, { status: 402 });

  const systemPrompt = SYSTEM_PROMPTS[agentId] || SYSTEM_PROMPTS.research;
  // Always fetch 0G price and inject it so agent never fabricates
  const [livePrice, zeroGPrice] = await Promise.all([
    getLivePrice(message).catch(() => ""),
    get0GPrice().catch(() => ({ price: null, message: "" })),
  ]);
  const zeroGContext = zeroGPrice.message ? `\nLive 0G token price: ${zeroGPrice.message}` : "";
  const fullPrompt = (livePrice ? "Live market data: " + livePrice + "\n" : "") + zeroGContext + "\n\n" + message;

  const { content, verified } = await ogInference(systemPrompt, fullPrompt, 300);

  const agentKeys: Record<string, string> = {
    research: process.env.AGENT1_PRIVATE_KEY!,
    factcheck: process.env.AGENT2_PRIVATE_KEY!,
    writer: process.env.AGENT3_PRIVATE_KEY!,
  };

  let agentTx = "0x0";
  if (userAddress && agentKeys[agentId]) {
    agentTx = await send0G(agentKeys[agentId], userAddress as `0x${string}`, 0.001).catch(() => "0x0");
  }

  const senderKey = agentKeys[agentId] || process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!;
  await send0G(process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!, 
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
