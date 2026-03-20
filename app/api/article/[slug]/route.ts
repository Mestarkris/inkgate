import { generateArticle } from "@/lib/ai";
import { getArticle } from "@/lib/articles";

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
            description: "InkGate article unlock",
            mimeType: "application/json",
            payTo: process.env.PAYMENT_RECIPIENT_ADDRESS,
            maxTimeoutSeconds: 300,
            asset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          },
        ],
      },
      { status: 402 }
    );
  }

  const content = await generateArticle(slug);

  await fetch(new URL("/api/stats", req.url), { method: "POST" }).catch(() => {});

  return Response.json(
    {
      title: article.title,
      content,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "X-PAYMENT-RESPONSE": "accepted",
        "X-TRANSACTION-HASH": paymentHeader,
      },
    }
  );
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