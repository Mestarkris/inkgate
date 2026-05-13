const OG_RPC = process.env.OG_RPC_URL || "https://evmrpc.0g.ai";
const OG_PRIVATE_KEY = process.env.OG_PRIVATE_KEY || process.env.PAYMENT_RECIPIENT_PRIVATE_KEY || "";
const OG_INDEXER_URL = process.env.OG_INDEXER_URL || "https://indexer-storage-turbo.0g.ai";

export interface AgentIdentity {
  id: string;
  name: string;
  role: string;
  address: string;
  capabilities: string[];
  pricePerCall: string;
  ogStorageRoot?: string;
  createdAt: string;
}

export interface StoredArticle {
  slug: string;
  title: string;
  content: string;
  agentPipeline: Record<string, string>;
  generatedAt: string;
  txHash?: string;
  ogStorageHash?: string;
}

const inMemoryCache = new Map<string, string>();

async function getOGSigner() {
  const { ethers } = require("ethers") as typeof import("ethers");
  const provider = new ethers.JsonRpcProvider(OG_RPC);
  return new ethers.Wallet(OG_PRIVATE_KEY, provider);
}

export async function storeOnOG(key: string, data: unknown): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    const { MemData, Indexer } = await import("@0glabs/0g-ts-sdk");
    const signer = await getOGSigner();
    const payload = JSON.stringify({ inkgate_key: key, data, timestamp: new Date().toISOString(), version: "1.0" });
    const memData = new MemData(new TextEncoder().encode(payload));
    const indexer = new Indexer(OG_INDEXER_URL);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [tx, uploadErr] = await indexer.upload(memData, OG_RPC, signer as any);
    if (uploadErr) throw new Error("Upload error: " + uploadErr);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hash = tx && typeof tx === "object" && "rootHash" in tx ? (tx as any).rootHash as string : undefined;
    console.log(`[0G Storage] key="${key}" hash=${hash}`);
    inMemoryCache.set(key, JSON.stringify(data));
    return { success: true, hash };
  } catch (err) {
    console.error("[0G Storage] error:", err);
    inMemoryCache.set(key, JSON.stringify(data));
    return { success: false, error: (err as Error).message };
  }
}

export async function storeArticle(article: StoredArticle): Promise<string | null> {
  const key = `article:${article.slug}`;
  const result = await storeOnOG(key, article);
  inMemoryCache.set(key, JSON.stringify(article));
  return result.hash ?? null;
}

export async function getStoredArticle(slug: string): Promise<StoredArticle | null> {
  const cached = inMemoryCache.get(`article:${slug}`);
  if (cached) { try { return JSON.parse(cached); } catch { return null; } }
  return null;
}

export async function storeAgentStats(stats: Record<string, unknown>): Promise<void> {
  inMemoryCache.set("stats:inkgate", JSON.stringify(stats));
  storeOnOG("stats:inkgate", stats).catch(() => {});
}

export async function getAgentStats(): Promise<Record<string, unknown>> {
  const cached = inMemoryCache.get("stats:inkgate");
  if (cached) { try { return JSON.parse(cached); } catch { return {}; } }
  return { articlesGenerated: 0, totalPaid: 0, agents: 4 };
}

export async function storePrediction(id: string, data: unknown): Promise<void> {
  inMemoryCache.set(`prediction:${id}`, JSON.stringify(data));
  storeOnOG(`prediction:${id}`, data).catch(() => {});
}

export async function getPrediction(id: string): Promise<unknown | null> {
  const cached = inMemoryCache.get(`prediction:${id}`);
  if (cached) { try { return JSON.parse(cached); } catch { return null; } }
  return null;
}

export async function listPredictions(): Promise<unknown[]> {
  const results: unknown[] = [];
  for (const [key, val] of inMemoryCache.entries()) {
    if (key.startsWith("prediction:")) {
      try { results.push(JSON.parse(val)); } catch {}
    }
  }
  return results;
}

export async function registerAgentIdentity(agent: AgentIdentity): Promise<string | null> {
  const result = await storeOnOG(`agentid:${agent.id}`, { ...agent, protocol: "InkGate-AgentID-v1", network: "0G Mainnet", registeredAt: new Date().toISOString() });
  inMemoryCache.set(`agentid:${agent.id}`, JSON.stringify(agent));
  return result.hash ?? null;
}

export async function getAgentIdentity(id: string): Promise<AgentIdentity | null> {
  const cached = inMemoryCache.get(`agentid:${id}`);
  if (cached) { try { return JSON.parse(cached); } catch { return null; } }
  return null;
}

export async function bootstrapAgentIdentities(): Promise<void> {
  const agents: AgentIdentity[] = [
    { id: "orchestrator", name: "InkGate Orchestrator", role: "Routes payments and orchestrates the full agent pipeline", address: process.env.PAYMENT_RECIPIENT_ADDRESS ?? "", capabilities: ["payment-routing", "pipeline-orchestration", "nft-minting", "0g-storage"], pricePerCall: "0.01 A0GI", createdAt: new Date().toISOString() },
    { id: "research", name: "InkGate Research Agent", role: "Fetches live market data and crypto news", address: process.env.AGENT1_ADDRESS ?? "", capabilities: ["market-data", "news-fetch", "research", "0g-memory"], pricePerCall: "0.004 A0GI", createdAt: new Date().toISOString() },
    { id: "factcheck", name: "InkGate Fact Check Agent", role: "Verifies research accuracy", address: process.env.AGENT2_ADDRESS ?? "", capabilities: ["fact-checking", "verification", "0g-memory"], pricePerCall: "0.003 A0GI", createdAt: new Date().toISOString() },
    { id: "writer", name: "InkGate Writer Agent", role: "Produces final articles", address: process.env.AGENT3_ADDRESS ?? "", capabilities: ["content-writing", "article-generation", "0g-storage"], pricePerCall: "0.003 A0GI", createdAt: new Date().toISOString() },
  ];
  console.log("[0G] Bootstrapping agent identities...");
  await Promise.allSettled(agents.map((a) => registerAgentIdentity(a)));
  console.log("[0G] Agent identities registered");
}
