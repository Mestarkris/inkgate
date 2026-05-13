import { getArticle } from "@/lib/articles";
import { researchAgent } from "@/lib/agents/research";
import { factCheckAgent } from "@/lib/agents/factcheck";
import { writerAgent } from "@/lib/agents/writer";
import { sendA0GI } from "@/lib/agents/wallet";
import { storeArticle } from "@/lib/0g";

async function verifyPayment(txHash: string): Promise<boolean> {
  try {
    const res = await fetch("https://evmrpc.0g.ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getTransactionReceipt", params: [txHash], id: 1 }),
    });
    const json = await res.json();
    const receipt = json.result;
    if (!receipt) return true; // pending, allow optimistically
    if (receipt.status !== "0x1") return false;
    return true;
  } catch {
    return true; // network error, allow optimistically
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return Response.json({ error: "Article not found" }, { status: 404 });

  const paymentHeader = req.headers.get("X-PAYMENT");

  if (!paymentHeader) {
    return Response.json({
      error: "Payment required",
      paymentInfo: {
        network: "0G Mainnet",
        chainId: 16661,
        amount: "0.01 A0GI",
        payTo: process.env.PAYMENT_RECIPIENT_ADDRESS,
        description: "InkGate multi-agent article unlock",
        explorer: "https://chainscan.0g.ai",
      },
    }, { status: 402 });
  }

  const isValid = await verifyPayment(paymentHeader);
  if (!isValid) return Response.json({ error: "Payment verification failed on 0G Mainnet" }, { status: 402 });

  try {
    console.log("Orchestrator: received payment", paymentHeader);
    console.log("Orchestrator: splitting A0GI to 3 agents...");

    const [agent1Tx, agent2Tx, agent3Tx] = await Promise.all([
      sendA0GI(process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!, process.env.AGENT1_ADDRESS as `0x${string}`, 0.002).catch(() => "0x0"),
      sendA0GI(process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!, process.env.AGENT2_ADDRESS as `0x${string}`, 0.002).catch(() => "0x0"),
      sendA0GI(process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!, process.env.AGENT3_ADDRESS as `0x${string}`, 0.002).catch(() => "0x0"),
    ]);

    const { research, txHash: researchTx } = await researchAgent(article.title);
    const { verifiedResearch, txHash: factCheckTx } = await factCheckAgent(article.title, research);
    const { article: content } = await writerAgent(article.title, verifiedResearch);

    const ogHash = await storeArticle({
      slug,
      title: article.title,
      content,
      agentPipeline: { orchestratorTx: paymentHeader, agent1Tx, agent2Tx, agent3Tx, researchTx, factCheckTx },
      generatedAt: new Date().toISOString(),
      txHash: paymentHeader,
    }).catch(() => null);

    await fetch(new URL("/api/stats", req.url), { method: "POST" }).catch(() => {});

    return Response.json({
      title: article.title,
      content,
      generatedAt: new Date().toISOString(),
      ogStorageHash: ogHash,
      network: "0G Mainnet",
      agentPipeline: { orchestratorTx: paymentHeader, agent1Tx, agent2Tx, agent3Tx, researchTx, factCheckTx },
    }, { headers: { "X-PAYMENT-RESPONSE": "accepted" } });

  } catch (err) {
    console.error("Orchestrator error:", err);
    return Response.json({ error: "Agent pipeline failed: " + (err as Error).message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "X-PAYMENT, Content-Type",
    },
  });
}
