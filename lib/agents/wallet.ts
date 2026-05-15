import { createWalletClient, http, defineChain, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const ogChain = defineChain({
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: { default: { http: ["https://evmrpc.0g.ai"] } },
  blockExplorers: {
    default: { name: "0G Explorer", url: "https://chainscan.0g.ai" },
  },
});

export function createAgentWallet(privateKey: string) {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: ogChain,
    transport: http("https://evmrpc.0g.ai"),
  });
  return { client, account };
}

export async function send0G(
  privateKey: string,
  to: `0x${string}`,
  amount: number
) {
  const { client, account } = createAgentWallet(privateKey);
  const hash = await client.sendTransaction({
    account,
    to,
    value: parseEther(amount.toFixed(18)),
    chain: ogChain,
  });
  console.log(`[0G] Sent ${amount} 0G to ${to} — tx: ${hash}`);
  return hash;
}


export async function mintArticleNFT(
  recipientAddress: `0x${string}`,
  title: string,
  txHash: string
): Promise<string> {
  const { toHex } = await import("viem");
  const account = privateKeyToAccount(
    process.env.PAYMENT_RECIPIENT_PRIVATE_KEY as `0x${string}`
  );
  const client = createWalletClient({
    account,
    chain: ogChain,
    transport: http("https://evmrpc.0g.ai"),
  });
  const metadata = JSON.stringify({
    protocol: "InkGate",
    type: "ArticleNFT",
    title,
    owner: recipientAddress,
    paymentTx: txHash,
    mintedAt: new Date().toISOString(),
    network: "0G Mainnet",
  });
  const mintTx = await client.sendTransaction({
    account,
    to: recipientAddress,
    value: BigInt(0),
    data: toHex(metadata),
    chain: ogChain,
  });
  console.log("[0G] Article NFT minted:", mintTx);
  return mintTx;
}
