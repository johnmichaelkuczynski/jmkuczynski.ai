export type ChannelStreamEvent =
  | { type: 'status' | 'reset'; message: string }
  | { type: 'delta'; text: string }
  | { type: 'done'; reply: string }
  | { type: 'error'; error: string };

export async function readChannelStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: ChannelStreamEvent) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.trim()) onEvent(JSON.parse(line));
      }
      if (done) {
        if (buffer.trim()) onEvent(JSON.parse(buffer));
        break;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

// Never discard punctuation, whitespace, paragraphs, or the final partial word.
export function nextRevealEnd(text: string, offset: number): number {
  const group = text.slice(offset).match(/^(?:\s*\S+\s*){1,2}/u)?.[0];
  return group ? offset + group.length : text.length;
}