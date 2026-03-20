import { getArticle } from "@/lib/articles";
import { researchAgent } from "@/lib/agents/research";
import { factCheckAgent } from "@/lib/agents/factcheck";
import { writerAgent } from "@/lib/agents/writer";
import { sendUSDC } from "@/lib/agents/wallet";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return Response.json({ error: "Article not found" }, { status: 404 });
  }

  const paymentHeader = req.headers.get("X-PAYMENT");

  if (!paymentHeader) {
    return Response.json(
      {
        error: "Payment required",
        x402Version: 1,
        accepts: [
          {
            scheme: "exact",
            network: "eip155:196",
            maxAmountRequired: "10000",
            resource: req.url,
            description: "InkGate multi-agent article unlock",
            mimeType: "application/json",
            payTo: process.env.PAYMENT_RECIPIENT_ADDRESS,
            maxTimeoutSeconds: 300,
            asset: "0x74b7F16337b8972027F6196A17a631aC6dE26d22",
          },
        ],
      },
      { status: 402 }
    );
  }

  try {
    const topic = article.title;

    console.log("Orchestrator: received payment", paymentHeader);
    console.log("Orchestrator: splitting payment to 3 agents");

    // Orchestrator splits payment to all 3 agents sequentially
    console.log("Orchestrator: paying Agent 1 (Research)...");
    const agent1Tx = await sendUSDC(
      process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
      process.env.AGENT1_ADDRESS as `0x${string}`,
      0.004
    );

    console.log("Orchestrator: paying Agent 2 (Fact Check)...");
    const agent2Tx = await sendUSDC(
      process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
      process.env.AGENT2_ADDRESS as `0x${string}`,
      0.003
    );

    console.log("Orchestrator: paying Agent 3 (Writer)...");
    const agent3Tx = await sendUSDC(
      process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
      process.env.AGENT3_ADDRESS as `0x${string}`,
      0.003
    );

    console.log("Orchestrator: paid agents", { agent1Tx, agent2Tx, agent3Tx });

    // Agent pipeline — each agent pays the next
    const { research, txHash: researchTx } = await researchAgent(topic);
    const { verifiedResearch, txHash: factCheckTx } = await factCheckAgent(topic, research);
    const { article: content } = await writerAgent(topic, verifiedResearch);

    // Update stats
    await fetch(new URL("/api/stats", req.url), { method: "POST" }).catch(() => {});

    return Response.json(
      {
        title: article.title,
        content,
        generatedAt: new Date().toISOString(),
        agentPipeline: {
          orchestratorTx: paymentHeader,
          agent1Tx,
          agent2Tx,
          agent3Tx,
          researchTx,
          factCheckTx,
        },
      },
      {
        headers: {
          "X-PAYMENT-RESPONSE": "accepted",
          "X-TRANSACTION-HASH": paymentHeader,
        },
      }
    );
  } catch (err) {
    console.error("Orchestrator error:", err);
    return Response.json(
      { error: "Agent pipeline failed: " + (err as Error).message },
      { status: 500 }
    );
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