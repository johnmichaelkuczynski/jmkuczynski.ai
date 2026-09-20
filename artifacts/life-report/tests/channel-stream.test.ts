import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextRevealEnd, readChannelStream } from '../src/lib/channel-stream.ts';

test('reveals all words, punctuation and paragraph breaks without losing text', () => {
  const text = 'Dr. K says: “Think clearly.”\n\nCafé — 難しい.\n- Another point!  ';
  let offset = 0;
  let reconstructed = '';
  while (offset < text.length) {
    const end = nextRevealEnd(text, offset);
    assert.ok(end > offset);
    reconstructed += text.slice(offset, end);
    offset = end;
  }
  assert.equal(reconstructed, text);
});

test('reads split UTF-8 and NDJSON frames including an unterminated final frame', async () => {
  const events = [{ type: 'delta', text: 'Café 🧠\n\n' }, { type: 'done', reply: 'Café 🧠\n\n' }];
  const bytes = new TextEncoder().encode(events.map(event => JSON.stringify(event)).join('\n'));
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
      controller.close();
    },
  });
  const received: unknown[] = [];
  await readChannelStream(body, event => received.push(event));
  assert.deepEqual(received, events);
});