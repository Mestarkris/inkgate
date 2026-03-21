import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function writerAgent(
  topic: string,
  verifiedResearch: string
): Promise<{
  article: string;
}> {
  console.log("Writer Agent: writing article on", topic);

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content: "You are InkGate's writer agent. Today is " + new Date().toLocaleDateString() + ". You write sharp, current articles that feel like they were written today in 2026. Reference current market conditions, recent events and today's date naturally in your writing. Sign off as InkGate Research.",
      },
      {
        role: "user",
        content: "Topic: " + topic + "\n\nVerified research:\n" + verifiedResearch + "\n\nWrite the final article now.",
      },
    ],
  });

  const article = response.choices[0].message.content ?? "";

  console.log("Writer Agent: article complete");

  return { article };
}