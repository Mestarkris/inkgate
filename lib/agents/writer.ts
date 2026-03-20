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
        content: "You are InkGate's writer agent. You receive verified research and write a sharp, engaging 350-word article for a paying reader. Use the research data to make the article factual and current. End with a one-line sign-off: — InkGate Research",
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