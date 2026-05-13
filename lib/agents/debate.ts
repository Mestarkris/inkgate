import { ogInference } from "@/lib/0g-compute";
import { sendA0GI } from "./wallet";

export async function bullAgent(topic: string): Promise<{ argument: string; txHash: string }> {
  const { content: argument } = await ogInference(
    "You are the InkGate Bull Agent. Make the strongest possible bullish case. Be confident and data-driven.",
    "Make a compelling bullish argument for: " + topic + ". Max 150 words.",
    300
  );
  const txHash = await sendA0GI(
    process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
    process.env.AGENT1_ADDRESS as `0x${string}`,
    0.002
  ).catch(() => "0x0");
  return { argument, txHash };
}

export async function bearAgent(topic: string): Promise<{ argument: string; txHash: string }> {
  const { content: argument } = await ogInference(
    "You are the InkGate Bear Agent. Make the strongest possible bearish case. Be confident and data-driven.",
    "Make a compelling bearish argument for: " + topic + ". Max 150 words.",
    300
  );
  const txHash = await sendA0GI(
    process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
    process.env.AGENT2_ADDRESS as `0x${string}`,
    0.002
  ).catch(() => "0x0");
  return { argument, txHash };
}

export async function judgeAgent(topic: string, bullArg: string, bearArg: string): Promise<{ verdict: string; txHash: string }> {
  const { content: verdict } = await ogInference(
    "You are the InkGate Judge Agent on 0G Compute. Evaluate both sides of a debate fairly and give a verdict.",
    "Topic: " + topic + "\n\nBull case:\n" + bullArg + "\n\nBear case:\n" + bearArg + "\n\nGive a balanced verdict in 100 words. Declare a winner.",
    200
  );
  const txHash = await sendA0GI(
    process.env.PAYMENT_RECIPIENT_PRIVATE_KEY!,
    process.env.AGENT3_ADDRESS as `0x${string}`,
    0.002
  ).catch(() => "0x0");
  return { verdict, txHash };
}
