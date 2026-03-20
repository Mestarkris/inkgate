import Groq from "groq-sdk";
import { sendUSDC } from "./wallet";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function researchAgent(topic: string): Promise<{
  research: string;
  txHash: string;
}> {
  console.log("Research Agent: starting research on", topic);

  // Agent does the research
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: "You are a research agent. Find and summarize the most important current facts, data points, and developments about the given topic. Be specific with numbers, dates, and sources where possible. Output raw research notes only.",
      },
      {
        role: "user",
        content: "Research this topic thoroughly: " + topic,
      },
    ],
  });

  const research = response.choices[0].message.content ?? "";

  // Agent gets paid — Orchestrator already sent USDC to this agent
  // Now agent sends payment receipt to Fact Check Agent
  const factCheckAddress = process.env.AGENT2_ADDRESS as `0x${string}`;
  const txHash = await sendUSDC(
    process.env.AGENT1_PRIVATE_KEY!,
    factCheckAddress,
    0.002
  );

  console.log("Research Agent: paid Fact Check Agent", txHash);

  return { research, txHash };
}