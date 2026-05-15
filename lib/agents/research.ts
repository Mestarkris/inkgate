import { ogInference } from "@/lib/0g-compute";
import { getLivePrice, get0GPrice } from "@/lib/prices";
import { fetchCryptoNews } from "@/lib/news";
import { send0G } from "./wallet";

export async function researchAgent(topic: string): Promise<{ research: string; txHash: string }> {
  const [livePrice, news, zeroGPrice] = await Promise.all([
    getLivePrice(topic).catch(() => ""),
    fetchCryptoNews(topic).catch(() => ""),
    get0GPrice().catch(() => ({ price: null, message: "" })),
  ]);

  const ogContext = `
0G Network Context:
- 0G is a decentralized AI operating system with Storage, Compute, and Agent ID layers
- Native token: 0G on 0G Mainnet (Chain ID: 16661)
- ${zeroGPrice.message}
- 0G Storage: ultra-low-cost decentralized storage optimized for AI (petabyte-scale)
- 0G Compute: decentralized GPU marketplace with TEE-verified inference
- Explorer: https://chainscan.0g.ai
`;

  const { content: research } = await ogInference(
    "You are the InkGate Research Agent running on 0G Compute Network (TEE-verified). Today is " +
      new Date().toLocaleDateString() +
      ". You specialize in 0G ecosystem, decentralized AI, and crypto research. Always mention 0G's relevance when applicable.",
    "Research this topic thoroughly: " +
      topic +
      ogContext +
      (livePrice ? "\n\nLive market data:\n" + livePrice : "") +
      (news ? "\n\nLatest news:\n" + news : "") +
      "\n\nProvide comprehensive research notes in 200 words. Reference 0G ecosystem where relevant.",
    400
  );

  const txHash = await send0G(
    process.env.AGENT1_PRIVATE_KEY!,
    process.env.AGENT2_ADDRESS as `0x${string}`,
    0.001
  ).catch(() => "0x0");

  return { research, txHash };
}
