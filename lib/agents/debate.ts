import Groq from "groq-sdk";
import { sendUSDC } from "./wallet";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function bullAgent(topic: string): Promise<{ argument: string; txHash: string }> {
  console.log("Bull Agent: arguing FOR", topic);

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 400,
    messages: [
      {
        role: "system",
        content: "You are a passionate bull agent. Argue strongly IN FAVOR of the topic with data, logic and conviction. Be persuasive and specific. 3 paragraphs max.",
      },
      {
        role: "user",
        content: "Make the strongest possible bull case for: " + topic,
      },
    ],
  });

  const argument = response.choices[0].message.content ?? "";

  // Bull agent pays Judge Agent
  const judgeAddress = process.env.AGENT3_ADDRESS as `0x${string}`;
  const txHash = await sendUSDC(
    process.env.AGENT1_PRIVATE_KEY!,
    judgeAddress,
    0.002
  );

  console.log("Bull Agent: paid Judge Agent", txHash);
  return { argument, txHash };
}

export async function bearAgent(topic: string): Promise<{ argument: string; txHash: string }> {
  console.log("Bear Agent: arguing AGAINST", topic);

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 400,
    messages: [
      {
        role: "system",
        content: "You are a sharp bear agent. Argue strongly AGAINST the topic with data, logic and skepticism. Be persuasive and specific. 3 paragraphs max.",
      },
      {
        role: "user",
        content: "Make the strongest possible bear case against: " + topic,
      },
    ],
  });

  const argument = response.choices[0].message.content ?? "";

  // Bear agent pays Judge Agent
  const judgeAddress = process.env.AGENT3_ADDRESS as `0x${string}`;
  const txHash = await sendUSDC(
    process.env.AGENT2_PRIVATE_KEY!,
    judgeAddress,
    0.002
  );

  console.log("Bear Agent: paid Judge Agent", txHash);
  return { argument, txHash };
}

export async function judgeAgent(
  topic: string,
  bullArgument: string,
  bearArgument: string
): Promise<{ verdict: string; winner: "bull" | "bear"; reasoning: string }> {
  console.log("Judge Agent: evaluating debate on", topic);

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 400,
    messages: [
      {
        role: "system",
        content: "You are an impartial judge agent. Evaluate both arguments fairly based on logic, data quality, and persuasiveness. Declare a winner and explain why. Be decisive.",
      },
      {
        role: "user",
        content: "Topic: " + topic + "\n\nBull argument:\n" + bullArgument + "\n\nBear argument:\n" + bearArgument + "\n\nWho wins this debate and why? Start your response with either BULL WINS or BEAR WINS then explain.",
      },
    ],
  });

  const verdict = response.choices[0].message.content ?? "";
  const winner = verdict.toUpperCase().includes("BULL WINS") ? "bull" : "bear";
  const reasoning = verdict.replace(/^(BULL WINS|BEAR WINS)/i, "").trim();

  console.log("Judge Agent: verdict =", winner);
  return { verdict, winner, reasoning };
}