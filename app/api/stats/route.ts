import { getAgentStats, storeAgentStats } from "@/lib/0g";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet") || "global";
  const stats = await getAgentStats();
  const userStats = (stats as any)[wallet] || { articlesGenerated: 0, totalPaid: 0 };
  return Response.json({ 
    ...userStats,
    agents: 4, 
    network: "0G Mainnet", 
    wallet,
    updatedAt: new Date().toISOString() 
  });
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet") || "global";
  const current = await getAgentStats() as Record<string, any>;
  const userCurrent = current[wallet] || { articlesGenerated: 0, totalPaid: 0 };
  const updated = {
    ...current,
    [wallet]: {
      articlesGenerated: (userCurrent.articlesGenerated || 0) + 1,
      totalPaid: (userCurrent.totalPaid || 0) + 0.01,
      lastArticleAt: new Date().toISOString(),
    }
  };
  await storeAgentStats(updated);
  return Response.json({ success: true });
}
