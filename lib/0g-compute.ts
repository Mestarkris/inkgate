/**
 * lib/0g-compute.ts — 0G Compute Network inference for InkGate
 * Replaces Groq with decentralized TEE-verified inference
 * Provider: 0xa48f01287233509FD694a22Bf840225062E67836 (qwen-2.5-7b-instruct)
 */

const OG_RPC = process.env.OG_RPC_URL || "https://evmrpc.0g.ai";
const OG_PROVIDER_ADDRESS = "0xa48f01287233509FD694a22Bf840225062E67836";
const FALLBACK_TO_GROQ = true;

let brokerCache: any = null;

async function getOGBroker() {
  if (brokerCache) return brokerCache;
  const { createZGComputeNetworkBroker } = require("@0gfoundation/0g-compute-ts-sdk");
  const { ethers } = require("ethers") as typeof import("ethers");
  const provider = new ethers.JsonRpcProvider(OG_RPC);
  const signer = new ethers.Wallet(
    process.env.OG_PRIVATE_KEY || process.env.PAYMENT_RECIPIENT_PRIVATE_KEY || "",
    provider
  );
  brokerCache = await createZGComputeNetworkBroker(signer);
  return brokerCache;
}

export async function ogInference(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 800
): Promise<{ content: string; provider: string; verified: boolean }> {
  try {
    const broker = await getOGBroker();

    // Get service endpoint + model
    const { endpoint, model } = await broker.inference.getServiceMetadata(OG_PROVIDER_ADDRESS);

    // Generate billing headers (TEE-signed)
    const headers = await broker.inference.getRequestHeaders(OG_PROVIDER_ADDRESS);

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`0G Compute error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Optional TEE response verification
    let verified = false;
    try {
      const chatID = response.headers.get("ZG-Res-Key") || data.id;
      if (chatID) {
        verified = await broker.inference.processResponse(OG_PROVIDER_ADDRESS, chatID);
      }
    } catch {}

    console.log(`[0G Compute] inference OK model=${model} verified=${verified}`);
    return { content, provider: OG_PROVIDER_ADDRESS, verified };

  } catch (err) {
    console.error("[0G Compute] error, falling back to Groq:", err);

    if (FALLBACK_TO_GROQ) {
      const Groq = require("groq-sdk");
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const res = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      return {
        content: res.choices[0].message.content || "",
        provider: "groq-fallback",
        verified: false,
      };
    }

    throw err;
  }
}

export async function ensureOGAccount(): Promise<void> {
  try {
    const broker = await getOGBroker();
    const account = await broker.ledger.getAccount();
    console.log("[0G Compute] Account balance:", account);
  } catch (err) {
    console.error("[0G Compute] Account check failed:", err);
  }
}
