import { ogInference } from "@/lib/0g-compute";
import { sendA0GI } from "./wallet";

export async function factCheckAgent(topic: string, research: string): Promise<{ verifiedResearch: string; txHash: string }> {
  const { content: verifiedResearch } = await ogInference(
    "You are the InkGate Fact Check Agent running on 0G Compute Network with TEE/TeeML verification. Your responses are cryptographically verified. Check accuracy and flag any issues.",
    "Fact-check this research about " + topic + ":\n\n" + research + "\n\nReturn the corrected, verified research in 200 words.",
    400
  );

  const txHash = await sendA0GI(
    process.env.AGENT2_PRIVATE_KEY!,
    process.env.AGENT3_ADDRESS as `0x${string}`,
    0.001
  ).catch(() => "0x0");

  return { verifiedResearch, txHash };
}
