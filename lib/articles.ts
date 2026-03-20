export const articles = [
  { slug: "bitcoin-2026-outlook",        title: "Bitcoin in 2026: What the charts are saying" },
  { slug: "okx-xlayer-deep-dive",        title: "X Layer: The ZK rollup changing DeFi" },
  { slug: "ai-agents-crypto-2026",       title: "How AI agents are taking over crypto trading" },
  { slug: "defi-yield-strategies-2026",  title: "Best DeFi yield strategies in 2026" },
  { slug: "crypto-regulation-2026",      title: "Crypto regulation in 2026: What changed" },
  { slug: "solana-vs-ethereum-2026",     title: "Solana vs Ethereum: Who is winning in 2026?" },
  { slug: "memecoins-2026",              title: "The memecoin meta in 2026: What survived" },
  { slug: "rwa-tokenization-2026",       title: "Real world assets onchain: The 2026 boom" },
  { slug: "zk-rollups-explained",        title: "ZK rollups explained: Why they matter now" },
  { slug: "onchain-ai-agents",           title: "Onchain AI agents: The next big primitive" },
  { slug: "stablecoin-wars-2026",        title: "The stablecoin wars: USDC vs USDT vs the rest" },
  { slug: "web3-gaming-2026",            title: "Web3 gaming in 2026: Finally going mainstream?" },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug) ?? null;
}