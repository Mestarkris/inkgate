import { getAgentStats, storeAgentStats } from "@/lib/0g";

export async function GET() {
  const stats = await getAgentStats();
  return Response.json({ ...stats, network: "0G Mainnet", updatedAt: new Date().toISOString() });
}

export async function POST() {
  const current = await getAgentStats() as Record<string, unknown>;
  const updated = {
    ...current,
    articlesGenerated: ((current.articlesGenerated as number) || 0) + 1,
    totalPaid: ((current.totalPaid as number) || 0) + 0.01,
    lastArticleAt: new Date().toISOString(),
  };
  await storeAgentStats(updated);
  return Response.json({ success: true });
}
