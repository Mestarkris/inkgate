import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateArticle(slug: string) {
  const topic = slug.replace(/-/g, " ");

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content: "You are InkGate, an expert research publication. Write sharp, insightful articles based on your knowledge. Sign off as InkGate Research. Real insights only, no filler.",
      },
      {
        role: "user",
        content: "Write a 350-word article about: " + topic + ". Start directly with the content, no title needed.",
      },
    ],
  });

  return response.choices[0].message.content;
}

export async function generateTeaser(slug: string) {
  const topic = slug.replace(/-/g, " ");

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 60,
    messages: [
      {
        role: "user",
        content: "Write exactly one compelling sentence (max 25 words) that teases an article about: " + topic + ". No title, just the hook.",
      },
    ],
  });

  return response.choices[0].message.content;
}