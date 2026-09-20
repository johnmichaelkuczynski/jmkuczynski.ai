import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatConversationThread } from '../src/lib/conversation-thread.ts';

test('exports every turn in order with matching exchange numbers and unmodified content', () => {
  const messages = [
    { role: 'user' as const, content: 'First question?' },
    { role: 'assistant' as const, content: 'First answer.\n\nAnother paragraph.' },
    { role: 'user' as const, content: 'Follow-up?' },
    { role: 'assistant' as const, content: 'A reply with “quotes” and Unicode: café.' },
  ];
  const result = formatConversationThread(messages, new Date('2026-09-20T12:00:00Z'));
  let last = -1;
  for (const [index, message] of messages.entries()) {
    const label = message.role === 'user' ? 'YOU' : 'ASK DR. K';
    const pos = result.indexOf(`${Math.floor(index / 2) + 1}. ${label}\n${message.content}`);
    assert.ok(pos > last);
    last = pos;
  }
  assert.ok(result.includes('2026-09-20T12:00:00.000Z'));
});