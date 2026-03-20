import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function predictorAgent(symbol: string, currentPrice: number): Promise<{
  prediction: string;
  targetPrice: number;
  direction: "up" | "down";
  confidence: number;
  reasoning: string;
}> {
  console.log("Predictor Agent: analyzing", symbol, "at $" + currentPrice);

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 400,
    messages: [
      {
        role: "system",
        content: "You are a crypto price prediction agent. Analyze the token and make a 24-hour price prediction. Always respond in this exact JSON format: {\"direction\": \"up\" or \"down\", \"targetPrice\": number, \"confidence\": number between 50-95, \"reasoning\": \"brief explanation\"}. Nothing else.",
      },
      {
        role: "user",
        content: symbol + " current price: $" + currentPrice + ". Predict where it will be in 24 hours. Respond only with JSON.",
      },
    ],
  });

  const text = response.choices[0].message.content ?? "{}";

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return {
      prediction: parsed.direction === "up"
        ? symbol + " will rise above $" + parsed.targetPrice + " in 24 hours"
        : symbol + " will fall below $" + parsed.targetPrice + " in 24 hours",
      targetPrice: parsed.targetPrice,
      direction: parsed.direction,
      confidence: parsed.confidence ?? 70,
      reasoning: parsed.reasoning ?? "",
    };
  } catch {
    return {
      prediction: symbol + " price movement predicted",
      targetPrice: currentPrice,
      direction: "up",
      confidence: 60,
      reasoning: "Based on current market conditions",
    };
  }
}