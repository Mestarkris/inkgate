export const articles = [
  { slug: "0g-storage-deep-dive",         title: "0G Storage: The decentralized AI backbone explained" },
  { slug: "0g-compute-tee-inference",     title: "0G Compute: How TEE-verified AI inference works" },
  { slug: "0g-agent-id-protocol",         title: "0G Agent ID: Tokenizing autonomous AI agents" },
  { slug: "0g-vs-filecoin-arweave",       title: "0G Storage vs Filecoin vs Arweave: The 2026 comparison" },
  { slug: "a0gi-token-outlook-2026",      title: "A0GI token: What investors need to know in 2026" },
  { slug: "ai-agents-onchain-2026",       title: "Onchain AI agents: How 0G is leading the charge" },
  { slug: "decentralized-ai-2026",        title: "Decentralized AI in 2026: Why 0G matters" },
  { slug: "0g-ecosystem-projects",        title: "Top projects building on 0G in 2026" },
  { slug: "agentic-economy-2026",         title: "The agentic economy: AI agents that earn and spend" },
  { slug: "0g-compute-vs-centralized-ai", title: "0G Compute vs centralized AI: The case for decentralization" },
  { slug: "web4-infrastructure-2026",     title: "Web 4.0 infrastructure: How 0G fits in" },
  { slug: "bitcoin-2026-outlook",         title: "Bitcoin in 2026: What the charts are saying" },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug) ?? null;
}
