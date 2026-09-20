import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { ChannelRequest } from '@workspace/api-client-react';
import { nextRevealEnd, readChannelStream } from '@/lib/channel-stream';

const THINKING = 'Dr. K is deep in thought… Please do not disturb the neurons.';

export function useStreamingChannel() {
  const [streamedReply, setStreamedReply] = useState('');
  const [streamStatus, setStreamStatus] = useState(THINKING);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  const mutation = useMutation({
    mutationFn: async ({ data }: { data: ChannelRequest }) => {
      const controller = new AbortController();
      active.current = controller;
      const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(300_000)]);
      let target = '';
      let revealed = 0;
      let finalReply: string | undefined;
      setStreamedReply('');
      setStreamStatus(THINKING);
      // Even a provider or proxy that delivers one large chunk is shown gradually.
      const timer = window.setInterval(() => {
        if (signal.aborted || revealed >= target.length) return;
        revealed = nextRevealEnd(target, revealed);
        setStreamedReply(target.slice(0, revealed));
      }, 25);
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}api/channel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
          body: JSON.stringify(data),
          signal,
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error || 'Dr. K could not answer just now. Please try again.');
        }
        if (!response.body || !response.headers.get('content-type')?.includes('application/x-ndjson')) {
          throw new Error('The streaming connection is unavailable. Please refresh and try again.');
        }
        await readChannelStream(response.body, event => {
          if (event.type === 'error') throw new Error(event.error);
          if (event.type === 'reset') {
            target = '';
            revealed = 0;
            setStreamedReply('');
            setStreamStatus(event.message);
          } else if (event.type === 'delta') {
            target += event.text;
          } else if (event.type === 'done') {
            finalReply = event.reply;
            // Preserve the authoritative answer, including any final whitespace.
            if (!event.reply.startsWith(target.slice(0, revealed))) {
              revealed = 0;
              setStreamedReply('');
            }
            target = event.reply;
          }
        });
        if (finalReply === undefined) throw new Error('The answer was interrupted. Please try again.');
        while (revealed < target.length) {
          signal.throwIfAborted();
          await new Promise(resolve => window.setTimeout(resolve, 25));
        }
        return { reply: finalReply };
      } finally {
        window.clearInterval(timer);
        active.current = null;
      }
    },
    retry: false,
  });
  return { ...mutation, streamedReply, streamStatus };
}