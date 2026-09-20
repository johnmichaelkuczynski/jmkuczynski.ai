import { Router, type IRouter } from "express";
import { ChannelKuczynskiBody, ChannelKuczynskiResponse } from "@workspace/api-zod";
import { LENGTH_RULES, lengthInstruction, measureReply, replyMatchesLength } from "../lib/response-length";
import {
  parseSseData,
  parseProviderStreamEvent,
  PROVIDERS,
  requestProviderAnswer,
  type LlmProvider,
} from "../lib/llm-providers";

const router: IRouter = Router();


// Simple in-memory per-IP rate limiter: protects the shared upstream key quota
// (upstream allows 30 req / 5 min for the whole key).
const WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return false;
}

const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY_ITEMS = 30;
const MAX_HISTORY_CHARS = 40_000;

function extractReply(payload: unknown): string | null {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["reply", "response", "answer", "text", "message", "content", "output"]) {
      const v = obj[key];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return null;
}

type StreamEvent =
  | { type: "status"; message: string }
  | { type: "delta"; text: string }
  | { type: "reset"; message: string }
  | { type: "done"; reply: string }
  | { type: "error"; error: string };

function wantsNdjson(req: { get(name: string): string | undefined }): boolean {
  return req.get("accept")?.split(",").some(value =>
    value.split(";")[0]?.trim().toLowerCase() === "application/x-ndjson"
  ) ?? false;
}

async function readJsonProviderReply(response: Response): Promise<string | null> {
  const raw = await response.text();
  let payload: unknown = raw;
  try { payload = JSON.parse(raw); } catch { /* retain plain text */ }
  return extractReply(payload);
}

async function streamAnswer(
  provider: LlmProvider,
  response: Response,
  emitDelta: (text: string) => void,
): Promise<string> {
  if (provider === "dr-k") {
    const reply = await readJsonProviderReply(response);
    if (!reply) throw new Error("Empty provider response");
    emitDelta(reply);
    return reply;
  }
  if (!response.body) throw new Error("Missing provider response stream");
  let reply = "";
  let completed = false;
  let finishReason: string | undefined;
  for await (const data of parseSseData(response.body)) {
    const event = parseProviderStreamEvent(provider, data);
    if (event.text) {
      reply += event.text;
      emitDelta(event.text);
    }
    if (event.finishReason) {
      finishReason = event.finishReason;
      completed = event.completed;
    }
  }
  if (!reply.trim()) throw new Error("Empty provider response");
  if (!completed) {
    throw new Error(finishReason
      ? `Provider stopped before successful completion (${finishReason})`
      : "Provider stream ended without a completion marker");
  }
  return reply;
}

router.post("/channel", async (req, res): Promise<void> => {
  const streaming = wantsNdjson(req);
  const earlyError = (status: number, error: string): void => {
    if (!streaming) {
      res.status(status).json({ error });
      return;
    }
    res.status(status).type("application/x-ndjson").send(`${JSON.stringify({ type: "error", error })}\n`);
  };
  if (rateLimited(req.ip ?? "unknown")) {
    earlyError(429, "Too many inquiries. Please wait a few minutes and try again.");
    return;
  }

  const parsed = ChannelKuczynskiBody.safeParse(req.body);
  if (!parsed.success) {
    earlyError(400, parsed.error.message);
    return;
  }

  if (parsed.data.message.length > MAX_MESSAGE_CHARS) {
    earlyError(400, `Message is too long (max ${MAX_MESSAGE_CHARS} characters).`);
    return;
  }
  if (parsed.data.history) {
    const totalChars = parsed.data.history.reduce((n, m) => n + m.content.length, 0);
    if (parsed.data.history.length > MAX_HISTORY_ITEMS || totalChars > MAX_HISTORY_CHARS) {
      // Trim oldest turns rather than rejecting — long conversations are expected.
      let trimmed = parsed.data.history.slice(-MAX_HISTORY_ITEMS);
      let chars = trimmed.reduce((n, m) => n + m.content.length, 0);
      while (trimmed.length > 0 && chars > MAX_HISTORY_CHARS) {
        chars -= trimmed[0]!.content.length;
        trimmed = trimmed.slice(1);
      }
      parsed.data.history = trimmed;
    }
  }

  const provider = parsed.data.provider ?? "gemini";
  const providerLabel = PROVIDERS[provider].label;
  const apiKey = process.env[PROVIDERS[provider].secret];
  if (!apiKey) {
    earlyError(502, `${providerLabel}'s API key is not configured.`);
    return;
  }

  const { message, history, maxWords, quotes, responseLength, bullets } = parsed.data;
  // Keep legacy callers working, but every request now has an explicit structure.
  const length = responseLength ?? (
    maxWords === 50 ? "super-concise" : maxWords === 150 ? "concise" :
    maxWords === 600 ? "elaborate" : maxWords === 1200 ? "detailed" : "normal"
  );
  const instruction = lengthInstruction(length, bullets);
  const requestAnswer = (prompt: string) => requestProviderAnswer(
    provider, apiKey, prompt, history ?? [], LENGTH_RULES[length].maxWords, quotes,
  );

  if (streaming) {
    const controller = new AbortController();
    let connected = true;
    const emit = (event: StreamEvent): void => {
      if (connected && !res.writableEnded) res.write(`${JSON.stringify(event)}\n`);
    };
    const onClose = (): void => {
      if (!res.writableEnded) {
        connected = false;
        controller.abort();
      }
    };
    res.on("close", onClose);
    res.status(200);
    res.set({
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders();
    emit({ type: "status", message: `Asking ${providerLabel}…` });
    const heartbeat = setInterval(() => emit({ type: "status", message: "Still working…" }), 15_000);

    const streamRequest = (prompt: string) => requestProviderAnswer(
      provider,
      apiKey,
      prompt,
      history ?? [],
      LENGTH_RULES[length].maxWords,
      quotes,
      { stream: true, signal: controller.signal },
    );
    const fail = (error: string): void => {
      emit({ type: "error", error });
      if (connected && !res.writableEnded) res.end();
    };

    try {
      let upstream = await streamRequest(`${message}\n\n${instruction}`);
      if (!upstream.ok) {
        fail(upstream.status === 429
          ? `${providerLabel} is rate-limited or has exhausted its quota. Try again later or select another provider.`
          : `${providerLabel} is unavailable. Please try again.`);
        return;
      }
      let reply = await streamAnswer(provider, upstream, text => emit({ type: "delta", text }));
      if (!replyMatchesLength(reply, length)) {
        const counts = measureReply(reply);
        req.log.info({ length, ...counts }, "Correcting streamed answer length");
        emit({ type: "reset", message: "Refining the answer to match your selected length…" });
        upstream = await streamRequest(
          `${message}\n\n${instruction}\n\nYour previous draft had ${counts.sentences} sentences and ${counts.paragraphs} paragraphs and did not meet the requirement. Rewrite the answer to comply exactly, preserving its important ideas.\n\nPrevious draft:\n${reply}\n\n${instruction}`,
        );
        if (!upstream.ok) {
          fail("The bot could not finish the requested answer length. Please try again shortly.");
          return;
        }
        reply = await streamAnswer(provider, upstream, text => emit({ type: "delta", text }));
        if (!replyMatchesLength(reply, length)) {
          fail("The bot did not meet your selected answer length. Please try again.");
          return;
        }
      }
      emit({ type: "done", reply });
      if (connected && !res.writableEnded) res.end();
    } catch (err) {
      if (!controller.signal.aborted) {
        req.log.error({ err, provider }, "Streaming provider request failed");
        fail(`Could not complete ${providerLabel}'s answer. Please try again.`);
      }
    } finally {
      clearInterval(heartbeat);
      res.off("close", onClose);
      controller.abort();
    }
    return;
  }

  let upstream: Response;
  try {
    upstream = await requestAnswer(`${message}\n\n${instruction}`);
  } catch (err) {
    req.log.error({ provider }, "Failed to reach selected AI provider");
    res.status(502).json({ error: `Could not reach ${providerLabel}. Please try again.` });
    return;
  }

  if (upstream.status === 429) {
    res.status(429).json({
      error: `${providerLabel} is rate-limited or has exhausted its quota. Try again later or select another provider.`,
    });
    return;
  }

  let raw: string;
  try {
    raw = await upstream.text();
  } catch (err) {
    req.log.error({ err }, "Failed reading Genius 101 response body");
    res.status(502).json({ error: "The Kuczynski bot's response was interrupted. Please try again." });
    return;
  }
  let payload: unknown = raw;
  try {
    payload = JSON.parse(raw);
  } catch {
    // keep raw text
  }

  if (!upstream.ok) {
    const upstreamError = extractReply(payload) ??
      (payload && typeof payload === "object" && typeof (payload as Record<string, unknown>).error === "string"
        ? ((payload as Record<string, unknown>).error as string)
        : "Upstream error");
    req.log.error({ status: upstream.status, upstreamError }, "Genius 101 error");
    const hint =
      upstreamError === "Login required"
        ? "The Genius 101 app has not been republished with external API access yet."
        : upstreamError;
    res.status(502).json({ error: `${providerLabel} unavailable: ${hint}` });
    return;
  }

  let reply = extractReply(payload);
  if (!reply) {
    req.log.error({ raw: raw.slice(0, 500) }, "Unrecognized Genius 101 response shape");
    res.status(502).json({ error: "Received an unrecognized response from the Kuczynski bot." });
    return;
  }

  if (!replyMatchesLength(reply, length)) {
    const counts = measureReply(reply);
    req.log.info({ length, ...counts }, "Correcting answer length");
    try {
      // One repair at most, protecting the shared upstream quota. Do not truncate
      // prose or fabricate padding to make a non-compliant answer appear valid.
      const correction = await requestAnswer(
        `${message}\n\n${instruction}\n\nYour previous draft had ${counts.sentences} sentences and ${counts.paragraphs} paragraphs and did not meet the requirement. Rewrite the answer to comply exactly, preserving its important ideas.\n\nPrevious draft:\n${reply}\n\n${instruction}`,
      );
      if (!correction.ok) {
        res.status(correction.status === 429 ? 429 : 502).json({
          error: "The bot could not finish the requested answer length. Please try again shortly.",
        });
        return;
      }
      const correctedRaw = await correction.text();
      let correctedPayload: unknown;
      try { correctedPayload = JSON.parse(correctedRaw); } catch { correctedPayload = correctedRaw; }
      const correctedReply = extractReply(correctedPayload);
      if (!correctedReply || !replyMatchesLength(correctedReply, length)) {
        res.status(502).json({ error: "The bot did not meet your selected answer length. Please try again." });
        return;
      }
      reply = correctedReply;
    } catch (err) {
      req.log.error({ err }, "Failed correcting answer length");
      res.status(502).json({ error: "Could not complete the requested answer length. Please try again." });
      return;
    }
  }
  res.json(ChannelKuczynskiResponse.parse({ reply }));
});

export default router;
