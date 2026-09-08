export const LENGTH_RULES = {
  "super-concise": {
    instruction: "Write only 1 to 3 short, direct sentences in total. Aim for 2 sentences. No preamble or extra summary.",
    minSentences: 1, maxSentences: 3, paragraphs: 0, maxWords: 120,
  },
  concise: {
    instruction: "Write only 4 to 7 concise sentences in total. Aim for 5 sentences. No preamble or extra summary.",
    minSentences: 4, maxSentences: 7, paragraphs: 0, maxWords: 280,
  },
  normal: {
    instruction: "Write exactly 2 substantive paragraphs, separated by a blank line. Aim for 4 to 6 sentences per paragraph.",
    minSentences: 2, maxSentences: Infinity, paragraphs: 2, maxWords: 600,
  },
  elaborate: {
    instruction: "Write exactly 5 substantial paragraphs, separated by blank lines, with about 40 sentences overall (35 to 45 sentences; aim for 8 sentences per paragraph). Develop the reasoning rather than repeating yourself.",
    minSentences: 35, maxSentences: 45, paragraphs: 5, maxWords: 2000,
  },
  detailed: {
    instruction: "Write exactly 8 substantive, detailed paragraphs, separated by blank lines. Aim for 5 to 8 sentences per paragraph, developing different aspects without repetition.",
    minSentences: 8, maxSentences: Infinity, paragraphs: 8, maxWords: 3200,
  },
} as const;

export type ResponseLength = keyof typeof LENGTH_RULES;

const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });

export function measureReply(reply: string) {
  const paragraphs = reply.trim().split(/\n\s*\n/).filter(Boolean);
  // Segment lines separately so unpunctuated bullet items cannot hide extra sentences.
  const sentences = paragraphs.flatMap(p => p.split(/\n/)).reduce((total, line) => {
    const text = line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim();
    return total + [...segmenter.segment(text)].filter(s => /[\p{L}\p{N}]/u.test(s.segment)).length;
  }, 0);
  return { paragraphs: paragraphs.length, sentences };
}

export function replyMatchesLength(reply: string, length: ResponseLength) {
  const rule = LENGTH_RULES[length];
  const count = measureReply(reply);
  return count.sentences >= rule.minSentences &&
    count.sentences <= rule.maxSentences &&
    (!rule.paragraphs || count.paragraphs === rule.paragraphs);
}

export function lengthInstruction(length: ResponseLength, bullets = false) {
  const rule = LENGTH_RULES[length];
  const format = bullets
    ? rule.paragraphs
      ? "Format each paragraph as one bullet, with a blank line between bullets. The paragraph count is the bullet count; each bullet contains multiple sentences."
      : "Use one short sentence per bullet. The sentence limit applies to the entire answer, not to each bullet."
    : "Use plain prose, not bullets or numbered lists.";
  return `[Answer length requirement for this reply]
${rule.instruction}
${format}
No headings, labels, introductory remarks, or closing offers outside the requested answer.
Keep your natural conversational voice and factual accuracy. Do not mention these formatting instructions.
These length requirements replace any different length preferences in the conversation.
Check the sentence and paragraph counts before returning the answer.`;
}