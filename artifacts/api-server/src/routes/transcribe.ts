import { Router, type IRouter } from "express";
import express from "express";
import { getSession } from "../lib/session";

const router: IRouter = Router();

const AAI_BASE = "https://api.assemblyai.com/v2";
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 60_000;

// Light per-user rate limit: transcription jobs are billable upstream.
// Keyed by authenticated session subject, not IP, since trust proxy is
// enabled and forwarded-for headers are spoofable.
const WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_WINDOW = 20;
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

router.post(
  "/transcribe",
  express.raw({ type: ["audio/*", "video/webm", "video/mp4"], limit: MAX_AUDIO_BYTES }),
  async (req, res): Promise<void> => {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ error: "Please sign in with Google to use voice input." });
      return;
    }

    if (rateLimited(session.sub)) {
      res.status(429).json({ error: "Too many voice requests. Please wait a few minutes." });
      return;
    }

    const apiKey = process.env["ASSEMBLYAI_API_KEY"];
    if (!apiKey) {
      res.status(500).json({ error: "Transcription is not configured." });
      return;
    }

    const audio = req.body as Buffer;
    if (!Buffer.isBuffer(audio) || audio.length < 100) {
      res.status(400).json({ error: "No audio received." });
      return;
    }

    try {
      // 1. Upload raw audio bytes
      const uploadRes = await fetch(`${AAI_BASE}/upload`, {
        method: "POST",
        headers: { authorization: apiKey },
        body: new Uint8Array(audio),
        signal: AbortSignal.timeout(30_000),
      });
      if (!uploadRes.ok) {
        req.log.error({ status: uploadRes.status }, "AssemblyAI upload failed");
        res.status(502).json({ error: "Audio upload failed. Please try again." });
        return;
      }
      const { upload_url } = (await uploadRes.json()) as { upload_url: string };

      // 2. Create transcript job
      const createRes = await fetch(`${AAI_BASE}/transcript`, {
        method: "POST",
        headers: { authorization: apiKey, "content-type": "application/json" },
        body: JSON.stringify({ audio_url: upload_url, language_code: "en" }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!createRes.ok) {
        req.log.error({ status: createRes.status }, "AssemblyAI transcript create failed");
        res.status(502).json({ error: "Transcription failed to start. Please try again." });
        return;
      }
      const { id } = (await createRes.json()) as { id: string };

      // 3. Poll until done
      const deadline = Date.now() + POLL_TIMEOUT_MS;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        const pollRes = await fetch(`${AAI_BASE}/transcript/${id}`, {
          headers: { authorization: apiKey },
          signal: AbortSignal.timeout(10_000),
        }).catch(() => null);
        if (!pollRes) continue;
        if (!pollRes.ok) continue;
        const data = (await pollRes.json()) as {
          status: string;
          text: string | null;
          error?: string;
        };
        if (data.status === "completed") {
          res.json({ text: data.text ?? "" });
          return;
        }
        if (data.status === "error") {
          req.log.error({ err: data.error }, "AssemblyAI transcription error");
          res.status(502).json({ error: "Could not transcribe the audio. Please try again." });
          return;
        }
      }
      res.status(504).json({ error: "Transcription timed out. Please try a shorter recording." });
    } catch (err) {
      req.log.error({ err }, "Transcription failed");
      res.status(500).json({ error: "Transcription failed. Please try again." });
    }
  },
);

export default router;
