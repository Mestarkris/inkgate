import crypto from "crypto";

function sign(timestamp: string, method: string, path: string) {
  const msg = timestamp + method + path;
  return crypto
    .createHmac("sha256", process.env.OKX_SECRET_KEY!)
    .update(msg)
    .digest("base64");
}

async function getWalletAssets(address: string) {
  const timestamp = new Date().toISOString();
  const path = "/api/v5/wallet/asset/wallet-all-token-assets?address=" + address + "&chains=196";
  const sig = sign(timestamp, "GET", path);

  try {
    const res = await fetch("https://web3.okx.com" + path, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "OK-ACCESS-KEY": process.env.OKX_API_KEY!,
        "OK-ACCESS-SIGN": sig,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": process.env.OKX_PASSPHRASE!,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  } catch {
    return { data: [] };
  }
}

async function getWalletTransactions(address: string) {
  const timestamp = new Date().toISOString();
  const path = "/api/v5/wallet/post-transaction/transactions-by-address?address=" + address + "&chains=196&limit=5";
  const sig = sign(timestamp, "GET", path);

  try {
    const res = await fetch("https://web3.okx.com" + path, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "OK-ACCESS-KEY": process.env.OKX_API_KEY!,
        "OK-ACCESS-SIGN": sig,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": process.env.OKX_PASSPHRASE!,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  } catch {
    return { data: [] };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return Response.json({ error: "Address required" }, { status: 400 });
  }

  try {
    const [assets, transactions] = await Promise.all([
      getWalletAssets(address),
      getWalletTransactions(address),
    ]);

    // Extract USDC balance
    const usdcBalance = assets.data?.[0]?.tokenAssets?.find(
      (t: any) => t.symbol === "USDC"
    )?.balance ?? "0";

    // Extract OKB balance
    const okbBalance = assets.data?.[0]?.tokenAssets?.find(
      (t: any) => t.symbol === "OKB"
    )?.balance ?? "0";

    return Response.json({
      address,
      usdcBalance,
      okbBalance,
      totalTransactions: transactions.data?.[0]?.transactions?.length ?? 0,
      assets: assets.data ?? [],
      transactions: transactions.data ?? [],
    });
  } catch (err) {
    console.error("Wallet API error:", err);
    return Response.json({ error: "Wallet API failed" }, { status: 500 });
  }
}