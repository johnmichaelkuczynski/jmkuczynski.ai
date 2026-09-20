type ThreadMessage = { role: 'user' | 'assistant'; content: string };

export function formatConversationThread(messages: ThreadMessage[], exportedAt = new Date()) {
  let exchange = 0;
  const entries = messages.map(message => {
    if (message.role === 'user') exchange++;
    const label = message.role === 'user' ? 'YOU' : 'ASK DR. K';
    return `${exchange}. ${label}\n${message.content}`;
  });
  return `ASK DR. K — CONVERSATION THREAD\nExported: ${exportedAt.toISOString()}\n${'='.repeat(40)}\n\n${entries.join('\n\n' + '-'.repeat(40) + '\n\n')}\n`;
}