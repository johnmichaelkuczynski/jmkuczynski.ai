import { Router, type IRouter } from "express";
import { ChannelKuczynskiBody, ChannelKuczynskiResponse } from "@workspace/api-zod";
import { getSession } from "../lib/session";

const router: IRouter = Router();

const UPSTREAM_URL = "https://genius101.xyz/api/external/kuczynski";

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

router.post("/channel", async (req, res): Promise<void> => {
  if (!getSession(req)) {
    res.status(401).json({ error: "Please sign in with Google to channel Kuczynski." });
    return;
  }

  if (rateLimited(req.ip ?? "unknown")) {
    res.status(429).json({ error: "Too many inquiries. Please wait a few minutes and try again." });
    return;
  }

  const parsed = ChannelKuczynskiBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.message.length > MAX_MESSAGE_CHARS) {
    res.status(400).json({ error: `Message is too long (max ${MAX_MESSAGE_CHARS} characters).` });
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

  const apiKey = process.env.KUCZYNSKI_BOT_API;
  if (!apiKey) {
    res.status(502).json({ error: "The Kuczynski bot API key is not configured." });
    return;
  }

  const { message, history, maxWords, quotes } = parsed.data;

  let upstream: Response;
  try {
    upstream = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        message,
        ...(history && history.length ? { history } : {}),
        ...(maxWords ? { maxWords } : {}),
        ...(quotes !== undefined ? { quotes } : {}),
      }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to reach Genius 101");
    res.status(502).json({ error: "Could not reach the Kuczynski bot. Please try again." });
    return;
  }

  if (upstream.status === 429) {
    res.status(429).json({
      error: "The Kuczynski bot is rate-limited right now. Wait a moment and try again.",
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
    res.status(502).json({ error: `Kuczynski bot unavailable: ${hint}` });
    return;
  }

  const reply = extractReply(payload);
  if (!reply) {
    req.log.error({ raw: raw.slice(0, 500) }, "Unrecognized Genius 101 response shape");
    res.status(502).json({ error: "Received an unrecognized response from the Kuczynski bot." });
    return;
  }

  res.json(ChannelKuczynskiResponse.parse({ reply }));
});

export default router;
