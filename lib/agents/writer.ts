import { ogInference } from "@/lib/0g-compute";

export async function writerAgent(topic: string, research: string): Promise<{ article: string }> {
  const { content: article } = await ogInference(
    "You are the InkGate Writer Agent. You produce sharp, insightful articles. Sign off as InkGate Research. Powered by 0G Compute Network.",
    "Write a 350-word article about " + topic + " using this verified research:\n\n" + research + "\n\nStart directly with content, no title needed.",
    800
  );
  return { article };
}
