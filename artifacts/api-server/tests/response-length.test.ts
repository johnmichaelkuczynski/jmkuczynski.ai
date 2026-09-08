import assert from "node:assert/strict";
import { test } from "node:test";
import { lengthInstruction, measureReply, replyMatchesLength } from "../src/lib/response-length.ts";

const paragraph = (sentences: number) => Array.from({ length: sentences }, () => "This is a complete sentence.").join(" ");
const paragraphs = (count: number, sentences: number) => Array.from({ length: count }, () => paragraph(sentences)).join("\n\n");

test("Super Concise accepts only 1–3 sentences", () => {
  for (const count of [1, 2, 3]) assert.ok(replyMatchesLength(paragraph(count), "super-concise"));
  assert.equal(replyMatchesLength("", "super-concise"), false);
  assert.equal(replyMatchesLength(paragraph(4), "super-concise"), false);
});

test("Concise accepts only 4–7 sentences, including bullet points", () => {
  for (const count of [4, 5, 6, 7]) assert.ok(replyMatchesLength(paragraph(count), "concise"));
  assert.equal(replyMatchesLength(paragraph(3), "concise"), false);
  assert.equal(replyMatchesLength(paragraph(8), "concise"), false);
  assert.ok(replyMatchesLength("- One point.\n- Another point.\n- Third point.\n- Last point.", "concise"));
});

test("Normal requires exactly two paragraphs", () => {
  assert.ok(replyMatchesLength(paragraphs(2, 5), "normal"));
  assert.equal(replyMatchesLength(paragraphs(1, 10), "normal"), false);
  assert.equal(replyMatchesLength(paragraphs(3, 4), "normal"), false);
});

test("Elaborated requires five paragraphs and around forty sentences", () => {
  for (const count of [7, 8, 9]) assert.ok(replyMatchesLength(paragraphs(5, count), "elaborate"));
  assert.equal(replyMatchesLength(paragraphs(5, 3), "elaborate"), false);
  assert.equal(replyMatchesLength(paragraphs(5, 10), "elaborate"), false);
  assert.equal(replyMatchesLength(paragraphs(4, 10), "elaborate"), false);
});

test("Super Detailed requires exactly eight paragraphs", () => {
  assert.ok(replyMatchesLength(paragraphs(8, 6), "detailed"));
  assert.equal(replyMatchesLength(paragraphs(7, 6), "detailed"), false);
  assert.equal(replyMatchesLength(paragraphs(9, 6), "detailed"), false);
});

test("Quoted punctuation, blank lines and multi-sentence bullets are counted", () => {
  assert.deepEqual(measureReply('He said, “Be careful.” Then he left.\r\n\r\nThis is the next paragraph.'), { sentences: 3, paragraphs: 2 });
  assert.ok(replyMatchesLength(`- ${paragraph(4)}\n\n- ${paragraph(4)}`, "normal"));
  assert.match(lengthInstruction("normal", true), /each paragraph as one bullet/);
  assert.match(lengthInstruction("concise", true), /entire answer/);
});