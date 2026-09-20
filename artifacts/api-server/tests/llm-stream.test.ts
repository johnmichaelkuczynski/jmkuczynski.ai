import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractProviderStreamDelta,
  parseProviderStreamEvent,
  parseSseData,
} from "../src/lib/llm-providers.ts";

function chunkedStream(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}

test("SSE parser handles split UTF-8, CRLF, comments, and multiline data", async () => {
  const encoded = new TextEncoder().encode(": ping\r\ndata: one 😀\r\ndata: two\r\n\r\ndata: final\n\n");
  const chunks = [
    encoded.slice(0, 19),
    encoded.slice(19, 22),
    encoded.slice(22, 37),
    encoded.slice(37),
  ];
  const events: string[] = [];
  for await (const event of parseSseData(chunkedStream(chunks))) events.push(event);
  assert.deepEqual(events, ["one 😀\ntwo", "final"]);
});

test("SSE parser flushes a final event without a trailing blank line", async () => {
  const stream = chunkedStream([new TextEncoder().encode("data: last")]);
  const events: string[] = [];
  for await (const event of parseSseData(stream)) events.push(event);
  assert.deepEqual(events, ["last"]);
});

test("provider delta parser extracts Gemini and Perplexity text", () => {
  assert.equal(
    extractProviderStreamDelta("gemini", JSON.stringify({
      candidates: [{ content: { parts: [{ thought: true, text: "hidden" }, { text: "visible" }] } }],
    })),
    "visible",
  );
  assert.equal(
    extractProviderStreamDelta("perplexity", JSON.stringify({ choices: [{ delta: { content: "token" } }] })),
    "token",
  );
  assert.equal(extractProviderStreamDelta("perplexity", "[DONE]"), "");
  assert.throws(() => extractProviderStreamDelta("gemini", "not json"), /Invalid streaming response/);
});

test("provider stream parser only accepts explicit successful finish reasons", () => {
  assert.deepEqual(
    parseProviderStreamEvent("gemini", JSON.stringify({
      candidates: [{ content: { parts: [{ text: "last" }] }, finishReason: "STOP" }],
    })),
    { text: "last", completed: true, finishReason: "STOP" },
  );
  assert.deepEqual(
    parseProviderStreamEvent("gemini", JSON.stringify({
      candidates: [{ finishReason: "MAX_TOKENS" }],
    })),
    { text: "", completed: false, finishReason: "MAX_TOKENS" },
  );
  assert.deepEqual(
    parseProviderStreamEvent("perplexity", JSON.stringify({
      choices: [{ delta: {}, finish_reason: "stop" }],
    })),
    { text: "", completed: true, finishReason: "stop" },
  );
  assert.deepEqual(
    parseProviderStreamEvent("perplexity", JSON.stringify({
      choices: [{ delta: {}, finish_reason: "length" }],
    })),
    { text: "", completed: false, finishReason: "length" },
  );
  assert.deepEqual(
    parseProviderStreamEvent("perplexity", "[DONE]"),
    { text: "", completed: false },
  );
});