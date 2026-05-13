export async function GET() {
  return Response.json({
    protocol: "InkGate",
    network: "0G Mainnet",
    chainId: 16661,
    nativeToken: "A0GI",
    ogStorage: "https://indexer-storage-turbo.0g.ai",
    ogCompute: "qwen/qwen-2.5-7b-instruct (TEE/TeeML verified)",
    agentIdProtocol: "InkGate-AgentID-v1",
    agents: [
      { id: "research", name: "InkGate Research Agent", description: "Researches any crypto topic with live market data via 0G Compute", address: process.env.AGENT1_ADDRESS, pricePerCall: "0.004 A0GI", capabilities: ["market-data", "news-fetch", "research", "0g-memory"] },
      { id: "factcheck", name: "InkGate Fact Check Agent", description: "Verifies research accuracy using TEE-verified 0G inference", address: process.env.AGENT2_ADDRESS, pricePerCall: "0.003 A0GI", capabilities: ["fact-checking", "tee-inference", "verification"] },
      { id: "writer", name: "InkGate Writer Agent", description: "Writes final articles, stores permanently on 0G Storage", address: process.env.AGENT3_ADDRESS, pricePerCall: "0.003 A0GI", capabilities: ["content-writing", "0g-storage"] },
      { id: "orchestrator", name: "InkGate Orchestrator", description: "Routes A0GI payments and coordinates all agents via 0G Agent ID", address: process.env.PAYMENT_RECIPIENT_ADDRESS, pricePerCall: "0.01 A0GI", capabilities: ["payment-routing", "0g-agent-id", "pipeline-orchestration"] },
      { id: "predictor", name: "InkGate Predictor Agent", description: "Makes 24-hour crypto predictions stored on 0G Storage", address: process.env.AGENT1_ADDRESS, pricePerCall: "0.01 A0GI", capabilities: ["prediction", "0g-storage"] },
    ],
    updatedAt: new Date().toISOString(),
  });
}
