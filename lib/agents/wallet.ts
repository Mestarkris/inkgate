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