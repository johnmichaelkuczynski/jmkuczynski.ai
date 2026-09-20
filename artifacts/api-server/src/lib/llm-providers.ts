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
  options?: { stream?: boolean; signal?: AbortSignal },
): Promise<Response> {
  const timeout = AbortSignal.timeout(120_000);
  const signal = options?.signal ? AbortSignal.any([timeout, options.signal]) : timeout;
  if (provider === "dr-k") {
    return fetch("https://genius101.xyz/api/external/kuczynski", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ message, history, maxWords, ...(quotes !== undefined ? { quotes } : {}) }),
      signal,
    });
  }
  const response = provider === "gemini"
    ? await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:${options?.stream ? "streamGenerateContent?alt=sse" : "generateContent"}`, {
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
        ...(options?.stream ? { stream: true } : {}),
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
  if (options?.stream) return response;
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

/**
 * Parses an SSE byte stream without assuming that UTF-8 characters, lines, or
 * events align with transport chunks. Only data fields are returned.
 */
export async function* parseSseData(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let dataLines: string[] = [];

  const consumeLine = (line: string): string | undefined => {
    if (line === "") {
      if (dataLines.length === 0) return;
      const data = dataLines.join("\n");
      dataLines = [];
      return data;
    }
    if (line.startsWith(":")) return;
    if (line === "data") dataLines.push("");
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).replace(/^ /, ""));
    return undefined;
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let newline: number;
      while ((newline = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        const event = consumeLine(line);
        if (event !== undefined) yield event;
      }
      if (done) break;
    }
    if (buffer.endsWith("\r")) buffer = buffer.slice(0, -1);
    if (buffer) {
      const event = consumeLine(buffer);
      if (event !== undefined) yield event;
    }
    const finalEvent = consumeLine("");
    if (finalEvent !== undefined) yield finalEvent;
  } finally {
    reader.releaseLock();
  }
}

export type ProviderStreamEvent = {
  text: string;
  completed: boolean;
  finishReason?: string;
};

export function parseProviderStreamEvent(
  provider: Exclude<LlmProvider, "dr-k">,
  data: string,
): ProviderStreamEvent {
  if (data === "[DONE]") return { text: "", completed: false };
  let payload: {
    candidates?: {
      content?: { parts?: { thought?: boolean; text?: string }[] };
      finishReason?: string;
    }[];
    choices?: { delta?: { content?: string }; finish_reason?: string | null }[];
  };
  try {
    payload = JSON.parse(data) as typeof payload;
  } catch {
    throw new Error("Invalid streaming response");
  }
  if (provider === "gemini") {
    const candidate = payload.candidates?.[0];
    const finishReason = candidate?.finishReason;
    const text = candidate?.content?.parts
      ?.filter(part => !part.thought && typeof part.text === "string")
      .map(part => part.text)
      .join("") ?? "";
    return { text, completed: finishReason === "STOP", ...(finishReason ? { finishReason } : {}) };
  }
  const choice = payload.choices?.[0];
  const finishReason = choice?.finish_reason ?? undefined;
  return {
    text: choice?.delta?.content ?? "",
    completed: finishReason === "stop",
    ...(finishReason ? { finishReason } : {}),
  };
}

export function extractProviderStreamDelta(provider: Exclude<LlmProvider, "dr-k">, data: string): string {
  return parseProviderStreamEvent(provider, data).text;
}