/**
 * lib/ai.ts — AI inference via 0G Compute Network (TEE-verified)
 * Falls back to Groq if 0G Compute is unavailable
 */
import { ogInference } from "./0g-compute";

export async function generateArticle(slug: string) {
  const topic = slug.replace(/-/g, " ");
  const { content } = await ogInference(
    "You are InkGate, an expert research publication. Write sharp, insightful articles based on your knowledge. Sign off as InkGate Research. Real insights only, no filler.",
    "Write a 350-word article about: " + topic + ". Start directly with the content, no title needed.",
    800
  );
  return content;
}

export async function generateTeaser(slug: string) {
  const topic = slug.replace(/-/g, " ");
  const { content } = await ogInference(
    "You are a sharp editorial assistant.",
    "Write exactly one compelling sentence (max 25 words) that teases an article about: " + topic + ". No title, just the hook.",
    60
  );
  return content;
}
