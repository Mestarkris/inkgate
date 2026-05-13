import { bootstrapAgentIdentities, getAgentIdentity } from "@/lib/0g";

let bootstrapped = false;

async function ensureBootstrapped() {
  if (!bootstrapped) {
    bootstrapped = true;
    await bootstrapAgentIdentities();
  }
}

export async function GET(req: Request) {
  await ensureBootstrapped();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const agentIds = ["orchestrator", "research", "factcheck", "writer"];

  if (id) {
    const agent = await getAgentIdentity(id);
    if (!agent) return Response.json({ error: "Agent not found" }, { status: 404 });
    return Response.json({ agent, network: "0G Mainnet", protocol: "InkGate-AgentID-v1" });
  }

  const agents = await Promise.all(agentIds.map((aid) => getAgentIdentity(aid)));
  return Response.json({
    protocol: "InkGate-AgentID-v1",
    network: "0G Mainnet",
    description: "AI Agent identities stored on 0G decentralized storage",
    agents: agents.filter(Boolean),
    ogIndexer: "https://indexer-storage-turbo.0g.ai",
    updatedAt: new Date().toISOString(),
  });
}

export async function POST() {
  bootstrapped = false;
  await ensureBootstrapped();
  return Response.json({ success: true, message: "Agent identities registered on 0G Storage" });
}
