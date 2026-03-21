import Groq from "groq-sdk";
import { sendUSDC } from "./wallet";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function factCheckAgent(
  topic: string,
  research: string
): Promise<{
  verifiedResearch: string;
  txHash: string;
}> {
  console.log("Fact Check Agent: verifying research on", topic);

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: "You are a fact-checking agent. Today is " + new Date().toLocaleDateString() + ". You verify claims against current 2026 market conditions. Flag anything that sounds outdated or refers to old data. Always ground your verification in the most recent known facts.",
      },
      {
        role: "user",
        content: "Topic: " + topic + "\n\nResearch to verify:\n" + research,
      },
    ],
  });

  const verifiedResearch = response.choices[0].message.content ?? "";

  // Agent pays Writer Agent for the next step
  const writerAddress = process.env.AGENT3_ADDRESS as `0x${string}`;
  const txHash = await sendUSDC(
    process.env.AGENT2_PRIVATE_KEY!,
    writerAddress,
    0.001
  );

  console.log("Fact Check Agent: paid Writer Agent", txHash);

  return { verifiedResearch, txHash };
}