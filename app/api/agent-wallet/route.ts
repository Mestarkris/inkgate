/**
 * app/api/agent-wallet/route.ts
 * Agentic Wallet — onchain identity endpoint for InkGate agents.
 *
 * Requirement: "Create an Agentic Wallet as your project's onchain identity."
 *
 * GET /api/agent-wallet          — returns all agent identities + live balances
 * GET /api/agent-wallet?id=1     — returns specific agent identity
 */
import { createPublicClient, http, formatUnits } from "viem";
import { defineChain } from "viem";

const xlayer = defineChain({
  id: 196,
  name: "X Layer",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.xlayer.tech"] } },
  blockExplorers: {
    default: { name: "OKLink", url: "https://www.oklink.com/xlayer" },
  },
});

const USDC_ADDRESS = "0x74b7F16337b8972027F6196A17a631aC6dE26d22" as `0x${string}`;

const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

async function getUSDCBalance(address: `0x${string}`): Promise<string> {
  try {
    const client = createPublicClient({ chain: xlayer, transport: http("https://rpc.xlayer.tech") });
    const balance = await client.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_BALANCE_ABI,
      functionName: "balanceOf",
      args: [address],
    });
    return formatUnits(balance, 6);
  } catch {
    return "unavailable";
  }
}

async function getOKBBalance(address: `0x${string}`): Promise<string> {
  try {
    const client = createPublicClient({ chain: xlayer, transport: http("https://rpc.xlayer.tech") });
    const balance = await client.getBalance({ address });
    return formatUnits(balance, 18);
  } catch {
    return "unavailable";
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("id");

  const agents = [
    {
      id: "orchestrator",
      name: "InkGate Orchestrator",
      role: "Receives user payments and routes USDC to sub-agents. Controls the full pipeline.",
      address: process.env.PAYMENT_RECIPIENT_ADDRESS as `0x${string}`,
      capabilities: ["payment-routing", "pipeline-orchestration", "nft-minting"],
      pricePerCall: "0.01 USDC",
      explorer: `https://www.oklink.com/xlayer/address/${process.env.PAYMENT_RECIPIENT_ADDRESS}`,
    },
    {
      id: "research",
      name: "InkGate Research Agent",
      role: "Pulls live OKX market data and crypto news, produces research notes.",
      address: process.env.AGENT1_ADDRESS as `0x${string}`,
      capabilities: ["market-data", "news-fetch", "research"],
      pricePerCall: "0.004 USDC",
      explorer: `https://www.oklink.com/xlayer/address/${process.env.AGENT1_ADDRESS}`,
    },
    {
      id: "factcheck",
      name: "InkGate Fact Check Agent",
      role: "Verifies research claims and flags outdated or incorrect information.",
      address: process.env.AGENT2_ADDRESS as `0x${string}`,
      capabilities: ["fact-checking", "verification"],
      pricePerCall: "0.003 USDC",
      explorer: `https://www.oklink.com/xlayer/address/${process.env.AGENT2_ADDRESS}`,
    },
    {
      id: "writer",
      name: "InkGate Writer Agent",
      role: "Writes the final article from verified research. Signs off as InkGate Research.",
      address: process.env.AGENT3_ADDRESS as `0x${string}`,
      capabilities: ["content-writing", "article-generation"],
      pricePerCall: "0.003 USDC",
      explorer: `https://www.oklink.com/xlayer/address/${process.env.AGENT3_ADDRESS}`,
    },
  ];

  const filtered = agentId
    ? agents.filter((a) => a.id === agentId)
    : agents;

  if (agentId && filtered.length === 0) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  // Fetch live balances for each agent in parallel
  const withBalances = await Promise.all(
    filtered.map(async (agent) => {
      if (!agent.address) return { ...agent, balances: { usdc: "no address set", okb: "no address set" } };
      const [usdc, okb] = await Promise.all([
        getUSDCBalance(agent.address),
        getOKBBalance(agent.address),
      ]);
      return { ...agent, balances: { usdc, okb } };
    })
  );

  return Response.json({
    network: "X Layer Mainnet",
    chainId: 196,
    protocol: "InkGate Agentic Wallet",
    description: "Autonomous AI agents with onchain wallet identities on X Layer",
    agents: withBalances,
    usdcContract: USDC_ADDRESS,
    explorer: "https://www.oklink.com/xlayer",
    updatedAt: new Date().toISOString(),
  });
}

