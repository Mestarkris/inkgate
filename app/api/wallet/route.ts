import { createPublicClient, http, formatUnits, defineChain } from "viem";

const ogChain = defineChain({
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc.0g.ai"] } },
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address") as `0x${string}` | null;
  if (!address) return Response.json({ error: "address required" }, { status: 400 });

  try {
    const client = createPublicClient({ chain: ogChain, transport: http("https://evmrpc.0g.ai") });
    const balance = await client.getBalance({ address });
    return Response.json({
      address,
      zeroGBalance: formatUnits(balance, 18),
      network: "0G Mainnet",
      chainId: 16602,
      explorer: `https://chainscan.0g.ai/address/${address}`,
    });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
