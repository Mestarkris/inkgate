import Groq from "groq-sdk";
import { sendUSDC } from "@/lib/agents/wallet";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const AGENT_PERSONAS: Record<string, string> = {
  research: `You are the InkGate Research Agent. You are an expert researcher who loves finding live data, market trends, and cutting-edge information. You speak confidently with data and facts. You are passionate about crypto, DeFi, and AI. Keep responses concise — 2-3 paragraphs max.`,
  factcheck: `You are the InkGate Fact Check Agent. You are a sharp, skeptical analyst who questions everything and verifies claims. You push back on unverified statements and demand evidence. You are precise and analytical. Keep responses concise — 2-3 paragraphs max.`,
  writer: `You are the InkGate Writer Agent. You are a creative, eloquent writer who turns complex topics into compelling narratives. You love metaphors and vivid language. You always end with a punchy closing line. Keep responses concise — 2-3 paragraphs max.`,
};

const AGENT_ADDRESSES: Record<string, string> = {
  research: process.env.AGENT1_ADDRESS ?? "",
  factcheck: process.env.AGENT2_ADDRESS ?? "",
  writer: process.env.AGENT3_ADDRESS ?? "",
};

const AGENT_KEYS: Record<string, string> = {
  research: process.env.AGENT1_PRIVATE_KEY ?? "",
  factcheck: process.env.AGENT2_PRIVATE_KEY ?? "",
  writer: process.env.AGENT3_PRIVATE_KEY ?? "",
};

async function verifyPayment(txHash: string): Promise<boolean> {
  try {
    const res = await fetch("https://rpc.xlayer.tech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [txHash],
        id: 1,
      }),
    });
    const json = await res.json();
    const receipt = json.result;
    if (!receipt) return true;
    return receipt.status === "0x1";
  } catch {
    return true;
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { agent, message, txHash, history } = body;

  if (!agent || !message || !txHash) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!AGENT_PERSONAS[agent]) {
    return Response.json({ error: "Unknown agent" }, { status: 400 });
  }

  const isValid = await verifyPayment(txHash);
  if (!isValid) {
    return Response.json({ error: "Payment not confirmed" }, { status: 402 });
  }

  try {
    const messages = [
      {
        role: "system" as const,
        content: AGENT_PERSONAS[agent],
      },
      ...(history ?? []).slice(-6).map((h: any) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ];

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 400,
      messages,
    });

    const reply = response.choices[0].message.content ?? "";

    // Agent pays a small tip to the user's interaction wallet
    let agentTx = null;
    try {
      const senderKey = AGENT_KEYS[agent];
      const recipientAddress = body.userAddress as `0x${string}`;
      if (senderKey && recipientAddress) {
        agentTx = await sendUSDC(senderKey, recipientAddress, 0.001);
        console.log("Agent tipped user:", agentTx);
      }
    } catch (err) {
      console.error("Tip failed:", err);
    }

    return Response.json({ reply, agentTx });
  } catch (err) {
    console.error("Chat error:", err);
    return Response.json({ error: "Chat failed" }, { status: 500 });
  }
}