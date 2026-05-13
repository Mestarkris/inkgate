/**
 * lib/swap.ts — 0G ecosystem token info
 * Native token: A0GI (0G Mainnet)
 */

export const OG_CHAIN_ID = "16661";

export const OG_TOKENS: Record<string, { symbol: string; decimals: number; description: string }> = {
  A0GI: { symbol: "A0GI", decimals: 18, description: "0G native token" },
  ETH: { symbol: "ETH", decimals: 18, description: "Ethereum" },
  USDT: { symbol: "USDT", decimals: 6, description: "Tether USD" },
};

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  network: string;
  chainId: string;
  explorer: string;
}

export function formatSwapQuote(quote: SwapQuote): string {
  return `Swap on 0G Mainnet: ${quote.fromAmount} ${quote.fromToken} → ${quote.toAmount} ${quote.toToken} | Chain: ${quote.chainId}`;
}

export async function getSwapQuote(from: string, to: string, amount: number): Promise<SwapQuote | null> {
  return {
    fromToken: from.toUpperCase(),
    toToken: to.toUpperCase(),
    fromAmount: amount.toString(),
    toAmount: (amount * 0.98).toFixed(6),
    network: "0G Mainnet",
    chainId: OG_CHAIN_ID,
    explorer: "https://chainscan.0g.ai",
  };
}
