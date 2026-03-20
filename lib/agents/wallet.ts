import { createWalletClient, http, defineChain, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const xlayer = defineChain({
  id: 196,
  name: "X Layer",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.xlayer.tech"] } },
  blockExplorers: {
    default: { name: "OKLink", url: "https://www.oklink.com/xlayer" },
  },
});

export const USDC_ADDRESS = "0x74b7F16337b8972027F6196A17a631aC6dE26d22" as `0x${string}`;

export function createAgentWallet(privateKey: string) {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: xlayer,
    transport: http("https://rpc.xlayer.tech"),
  });
  return { client, account };
}

export async function sendUSDC(
  privateKey: string,
  to: `0x${string}`,
  amountUSDC: number
) {
  const { client, account } = createAgentWallet(privateKey);
  const amount = parseUnits(amountUSDC.toFixed(6), 6);
  const paddedTo = to.slice(2).padStart(64, "0");
  const paddedAmount = amount.toString(16).padStart(64, "0");
  const data = ("0xa9059cbb" + paddedTo + paddedAmount) as `0x${string}`;

  const hash = await client.sendTransaction({
    account,
    to: USDC_ADDRESS,
    data,
    chain: xlayer,
  });

  return hash;
}
export async function mintArticleNFT(
  recipientAddress: `0x${string}`,
  title: string,
  txHash: string
): Promise<string> {
  const { createWalletClient, http, toHex } = await import("viem");
  const { privateKeyToAccount } = await import("viem/accounts");

  const account = privateKeyToAccount(
    process.env.PAYMENT_RECIPIENT_PRIVATE_KEY as `0x${string}`
  );

  const client = createWalletClient({
    account,
    chain: xlayer,
    transport: http("https://rpc.xlayer.tech"),
  });

  // Encode article metadata as hex data
  const metadata = JSON.stringify({
    protocol: "InkGate",
    type: "ArticleNFT",
    title,
    owner: recipientAddress,
    paymentTx: txHash,
    mintedAt: new Date().toISOString(),
    network: "X Layer",
  });

  const data = toHex(metadata);

  // Mint by sending a self-transaction with metadata inscribed
  const mintTx = await client.sendTransaction({
    account,
    to: recipientAddress,
    value: BigInt(0),
    data,
    chain: xlayer,
  });

  console.log("NFT minted:", mintTx);
  return mintTx;
}