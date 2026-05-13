export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? "ETH";
  const to = searchParams.get("to") ?? "A0GI";
  const amount = searchParams.get("amount") ?? "1";

  return Response.json({
    message: "Swap routing via 0G ecosystem",
    from, to, amount,
    network: "0G Mainnet",
    chainId: 16661,
    note: "Native token is A0GI. Use 0G-compatible DEX for swaps.",
    explorer: "https://chainscan.0g.ai",
  });
}
