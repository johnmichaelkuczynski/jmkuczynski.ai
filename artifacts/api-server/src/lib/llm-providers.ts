export type LlmProvider = "gemini" | "perplexity" | "dr-k";
type Turn = { role: "user" | "assistant"; content: string };

export const PROVIDERS = {
  gemini: { label: "Gemini", secret: "GEMINI_API_KEY" },
  perplexity: { label: "Perplexity", secret: "PERPLEXITY_API_KEY" },
  "dr-k": { label: "Dr. K Original", secret: "KUCZYNSKI_BOT_API" },
} as const;

const SYSTEM = "You are the AI assistant in Ask Dr. K. Answer naturally, thoughtfully and accurately. Do not claim to be Dr. Kuczynski or to have access to his private writings or a specialized corpus. Never invent quotations or attribute your own words to him. Follow the requested sentence and paragraph structure precisely.";

export async function requestProviderAnswer(
  provider: LlmProvider,
  apiKey: string,
  message: string,
  history: Turn[],
  maxWords: number,
  quotes?: number,
): Promise<Response> {
  const signal = AbortSignal.timeout(120_000);
  if (provider === "dr-k") {
    return fetch("https://genius101.xyz/api/external/kuczynski", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ message, history, maxWords, ...(quotes !== undefined ? { quotes } : {}) }),
      signal,
    });
  }
  const response = provider === "gemini"
    ? await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [...history, { role: "user", content: message }].map(turn => ({
          role: turn.role === "assistant" ? "model" : "user",
          parts: [{ text: turn.content }],
        })),
        generationConfig: { maxOutputTokens: 8192 },
      }),
      signal,
    })
    : await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "system", content: SYSTEM }, ...history, { role: "user", content: message }],
        max_tokens: 8192,
      }),
      signal,
    });
  // Never expose provider response bodies: they can contain credential details.
  if (!response.ok) {
    const reason = response.status === 401 || response.status === 403
      ? "rejected the API key or its permissions"
      : response.status === 429
        ? "is rate-limited or has exhausted its quota"
        : `returned an error (HTTP ${response.status})`;
    return Response.json({ error: `${PROVIDERS[provider].label} ${reason}.` }, { status: response.status });
  }
  const data = await response.json() as {
    candidates?: { content?: { parts?: { thought?: boolean; text?: string }[] } }[];
    choices?: { message?: { content?: string } }[];
  };
  const reply = provider === "gemini"
    ? data.candidates?.[0]?.content?.parts?.filter(part => !part.thought && part.text).map(part => part.text).join("\n")
    : data.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || !reply.trim()) {
    return Response.json({ error: `${PROVIDERS[provider].label} returned no answer. The request may have been blocked.` }, { status: 502 });
  }
  return Response.json({ reply });
}