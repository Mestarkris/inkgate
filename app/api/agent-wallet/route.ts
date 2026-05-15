import { createPublicClient, http, formatUnits, defineChain } from "viem";

const ogChain = defineChain({
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc.0g.ai"] } },
  blockExplorers: { default: { name: "0G Explorer", url: "https://chainscan.0g.ai" } },
});

async function get0GBalance(address: `0x${string}`): Promise<string> {
  try {
    const client = createPublicClient({ chain: ogChain, transport: http("https://evmrpc.0g.ai") });
    const balance = await client.getBalance({ address });
    return formatUnits(balance, 18);
  } catch { return "unavailable"; }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("id");

  const agents = [
    { id: "orchestrator", name: "InkGate Orchestrator", role: "Routes payments and orchestrates the full agent pipeline on 0G.", address: process.env.PAYMENT_RECIPIENT_ADDRESS as `0x${string}`, capabilities: ["payment-routing", "pipeline-orchestration", "nft-minting", "0g-storage"], pricePerCall: "0.01 0G", explorer: `https://chainscan.0g.ai/address/${process.env.PAYMENT_RECIPIENT_ADDRESS}` },
    { id: "research", name: "InkGate Research Agent", role: "Fetches live crypto data and news, produces research notes.", address: process.env.AGENT1_ADDRESS as `0x${string}`, capabilities: ["market-data", "news-fetch", "research", "0g-memory"], pricePerCall: "0.004 0G", explorer: `https://chainscan.0g.ai/address/${process.env.AGENT1_ADDRESS}` },
    { id: "factcheck", name: "InkGate Fact Check Agent", role: "Verifies research claims via 0G TEE inference.", address: process.env.AGENT2_ADDRESS as `0x${string}`, capabilities: ["fact-checking", "verification", "tee-inference"], pricePerCall: "0.003 0G", explorer: `https://chainscan.0g.ai/address/${process.env.AGENT2_ADDRESS}` },
    { id: "writer", name: "InkGate Writer Agent", role: "Writes final articles, stores them permanently on 0G Storage.", address: process.env.AGENT3_ADDRESS as `0x${string}`, capabilities: ["content-writing", "article-generation", "0g-storage"], pricePerCall: "0.003 0G", explorer: `https://chainscan.0g.ai/address/${process.env.AGENT3_ADDRESS}` },
  ];

  const filtered = agentId ? agents.filter(a => a.id === agentId) : agents;
  if (agentId && filtered.length === 0) return Response.json({ error: "Agent not found" }, { status: 404 });

  const withBalances = await Promise.all(
    filtered.map(async (agent) => {
      if (!agent.address) return { ...agent, balances: { zeroG: "no address set" } };
      const zeroG = await get0GBalance(agent.address);
      return { ...agent, balances: { zeroG } };
    })
  );

  return Response.json({
    network: "0G Mainnet",
    chainId: 16602,
    protocol: "InkGate Agentic Wallet",
    description: "Autonomous AI agents with onchain wallet identities on 0G",
    agents: withBalances,
    explorer: "https://chainscan.0g.ai",
    ogStorage: "https://indexer-storage-turbo.0g.ai",
    ogCompute: "https://compute-marketplace.0g.ai",
    updatedAt: new Date().toISOString(),
  });
}
