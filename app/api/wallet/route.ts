import crypto from "crypto";

function sign(timestamp: string, method: string, path: string) {
  const msg = timestamp + method + path;
  return crypto
    .createHmac("sha256", process.env.OKX_SECRET_KEY!)
    .update(msg)
    .digest("base64");
}

function getHeaders(timestamp: string, path: string) {
  return {
    "OK-ACCESS-KEY": process.env.OKX_API_KEY!,
    "OK-ACCESS-SIGN": sign(timestamp, "GET", path),
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": process.env.OKX_PASSPHRASE!,
    "Content-Type": "application/json",
  };
}

async function getTokenBalances(address: string) {
  const timestamp = new Date().toISOString();
  const path = "/api/v5/wallet/asset/wallet-all-token-assets?address=" + address + "&chains=196";
  try {
    const res = await fetch("https://web3.okx.com" + path, {
      signal: AbortSignal.timeout(8000),
      headers: getHeaders(timestamp, path),
    });
    return await res.json();
  } catch {
    return { code: "error", data: [] };
  }
}

async function getTotalValue(address: string) {
  const timestamp = new Date().toISOString();
  const path = "/api/v5/wallet/asset/total-value?address=" + address + "&chains=196&assetType=0";
  try {
    const res = await fetch("https://web3.okx.com" + path, {
      signal: AbortSignal.timeout(8000),
      headers: getHeaders(timestamp, path),
    });
    return await res.json();
  } catch {
    return { code: "error", data: [] };
  }
}

async function getTransactionHistory(address: string) {
  const timestamp = new Date().toISOString();
  const path = "/api/v5/wallet/post-transaction/transactions-by-address?address=" + address + "&chains=196&limit=10";
  try {
    const res = await fetch("https://web3.okx.com" + path, {
      signal: AbortSignal.timeout(8000),
      headers: getHeaders(timestamp, path),
    });
    return await res.json();
  } catch {
    return { code: "error", data: [] };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return Response.json({ error: "Address required" }, { status: 400 });
  }

  const [balances, totalValue, transactions] = await Promise.all([
    getTokenBalances(address),
    getTotalValue(address),
    getTransactionHistory(address),
  ]);

  console.log("OKX Wallet API raw responses:", {
    balances: JSON.stringify(balances).slice(0, 200),
    totalValue: JSON.stringify(totalValue).slice(0, 200),
    transactions: JSON.stringify(transactions).slice(0, 200),
  });

  const tokenList = balances.data?.[0]?.tokenAssets ?? [];
  const usdcBalance = tokenList.find((t: any) =>
    t.symbol === "USDC" || t.tokenContractAddress === "0x74b7F16337b8972027F6196A17a631aC6dE26d22"
  )?.balance ?? "0";
  const okbBalance = tokenList.find((t: any) => t.symbol === "OKB")?.balance ?? "0";
  const totalValueUSD = totalValue.data?.[0]?.totalValue ?? "0";
  const txList = transactions.data?.[0]?.transactions ?? [];

  return Response.json({
    address,
    usdcBalance,
    okbBalance,
    totalValueUSD,
    totalTransactions: txList.length,
    recentTransactions: txList.slice(0, 5).map((tx: any) => ({
      hash: tx.txHash,
      type: tx.txStatus,
      time: tx.txTime,
    })),
    raw: {
      balancesCode: balances.code,
      totalValueCode: totalValue.code,
      transactionsCode: transactions.code,
    },
  });
}