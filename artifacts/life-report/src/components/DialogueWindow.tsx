import React, { useRef, useEffect, useState } from 'react';
import { useDialogue } from '@/contexts/DialogueContext';
import { X, ArrowLeft, Maximize2, Minimize2, GripHorizontal, Download, Mic, MicOff, Volume2, VolumeX, List, MessageSquare, RotateCcw } from 'lucide-react';
import { useStreamingChannel } from '@/hooks/use-streaming-channel';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { trackEvent } from '@/lib/analytics';
import { formatConversationThread } from '@/lib/conversation-thread';

function MessageText({ content }: { content: string }) {
  const paragraphs = content.split(/\n+/).filter(p => p.trim() !== '');
  return (
    <div className="space-y-6">
      {paragraphs.map((p, i) => {
        const isQuote = p.startsWith('"') || p.startsWith('“') || p.startsWith("'") || p.startsWith('‘');
        return (
          <p 
            key={i} 
            className={cn(
              "leading-relaxed", 
              isQuote && "pl-6 border-l-2 border-primary/30 italic text-muted-foreground"
            )}
          >
            {p}
          </p>
        );
      })}
    </div>
  );
}

type LengthKey = 'super-concise' | 'concise' | 'normal' | 'elaborate' | 'detailed';

const LENGTH_OPTIONS: { key: LengthKey; label: string; description: string }[] = [
  { key: 'super-concise', label: 'Super Concise', description: '1–3 sentences' },
  { key: 'concise', label: 'Concise', description: '4–7 sentences' },
  { key: 'normal', label: 'Normal', description: '2 paragraphs' },
  { key: 'elaborate', label: 'Elaborated', description: '5 paragraphs · about 40 sentences' },
  { key: 'detailed', label: 'Super Detailed', description: '8 paragraphs' },
];

export function DialogueWindow() {
  const {
    isOpen,
    isMinimized,
    closeDialogue,
    minimizeDialogue,
    restoreDialogue,
    history,
    setHistory,
  } = useDialogue();
  const channel = useStreamingChannel();
  const [, setLocation] = useLocation();
  
  const [input, setInput] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Response preferences
  const [length, setLength] = useState<LengthKey>('concise');
  const [provider, setProvider] = useState<'gemini' | 'perplexity' | 'dr-k'>('gemini');
  const [bullets, setBullets] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined';

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ''));
    utter.rate = 1.0;
    window.speechSynthesis.speak(utter);
  };

  const transcribeAudio = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': blob.type || 'audio/webm' },
        body: blob,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || 'Could not transcribe your voice. Please try again.');
        return;
      }
      const text = (data?.text || '').trim();
      if (text) {
        setInput((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
        trackEvent('voice_transcription_completed');
      } else {
        setError('No speech detected. Please try again.');
      }
    } catch {
      setError('Could not transcribe your voice. Please try again.');
    } finally {
      setTranscribing(false);
    }
  };

  const toggleListening = async () => {
    if (listening) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      rec.onstop = () => {
        setListening(false);
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        if (blob.size > 1000) {
          void transcribeAudio(blob);
        } else {
          setError('Recording was too short. Hold the mic on a bit longer and speak clearly.');
        }
      };
      rec.onerror = () => {
        setListening(false);
        stream.getTracks().forEach((t) => t.stop());
        setError('Recording failed. Please try again.');
      };
      mediaRecorderRef.current = rec;
      setError(null);
      setListening(true);
      rec.start();
      trackEvent('voice_question_started');
    } catch {
      setError('Microphone access was denied. Please allow microphone access and try again.');
      setListening(false);
    }
  };

  const downloadTranscript = () => {
    if (!history.length || channel.isPending) return;
    const text = formatConversationThread(history);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ask-dr-k-thread-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    trackEvent('dialogue_transcript_downloaded', {
      message_count: history.length,
    });
  };

  const clearConversation = () => {
    if (channel.isPending || listening || transcribing) return;
    if (!window.confirm('Clear this conversation and refresh the page? All messages and any unsent draft will be removed. Download the thread first if you want to keep it.')) return;
    window.speechSynthesis?.cancel();
    setHistory([]);
    window.location.reload();
  };

  const windowRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [isMobile, setIsMobile] = useState(false);

  // Stop any active recording when the dialogue closes or unmounts so the
  // microphone is never left on invisibly.
  useEffect(() => {
    if (isOpen) return;
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      rec.stream.getTracks().forEach((t) => t.stop());
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
    }
    mediaRecorderRef.current = null;
    setListening(false);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      const rec = mediaRecorderRef.current;
      if (rec && rec.state !== 'inactive') {
        rec.stream.getTracks().forEach((t) => t.stop());
        try {
          rec.stop();
        } catch {
          /* already stopped */
        }
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, channel.isPending, channel.streamedReply]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768 && position.x === 0 && position.y === 0) {
        const w = Math.min(800, window.innerWidth - 64);
        const h = Math.min(600, window.innerHeight - 64);
        setSize({ w, h });
        setPosition({ x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2 });
      } else if (window.innerWidth >= 768) {
        // Re-clamp on viewport changes so the window (and its resize handle) stays reachable
        setSize(s => ({ w: Math.min(s.w, window.innerWidth), h: Math.min(s.h, window.innerHeight) }));
        setPosition(p => ({
          x: Math.max(0, Math.min(p.x, window.innerWidth - 200)),
          y: Math.max(0, Math.min(p.y, window.innerHeight - 100)),
        }));
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [position.x, position.y]);

  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const onDragPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMaximized || isMobile) return;
    if ((e.target as HTMLElement).closest('button, a, input, textarea, select')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, posX: position.x, posY: position.y };
  };
  const onDragPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const newX = Math.max(-size.w + 100, Math.min(window.innerWidth - 100, dragStart.current.posX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, dragStart.current.posY + dy));
      setPosition({ x: newX, y: newY });
    }
  };
  const onDragPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const resizeStart = useRef({ x: 0, y: 0, startW: 0, startH: 0 });
  const onResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMaximized || isMobile) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeStart.current = { x: e.clientX, y: e.clientY, startW: size.w, startH: size.h };
  };
  const onResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      setSize({
        w: Math.min(window.innerWidth - position.x, Math.max(400, resizeStart.current.startW + dx)),
        h: Math.min(window.innerHeight - position.y, Math.max(300, resizeStart.current.startH + dy)),
      });
    }
  };
  const onResizePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  if (!isOpen) return null;

  const returnToMainPage = () => {
    closeDialogue();
    setLocation('/');
  };

  if (isMinimized) {
    return (
      <div className="fixed top-3 left-3 z-[100] flex items-center border border-border bg-card text-foreground shadow-xl">
        <button
          type="button"
          onClick={restoreDialogue}
          className="flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
          aria-label="Restore Ask Dr. K chat"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask Dr. K</span>
        </button>
        <button
          type="button"
          onClick={returnToMainPage}
          className="flex items-center gap-1 border-l border-border px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          aria-label="Return to main page"
          title="Return to main page"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Main page</span>
        </button>
      </div>
    );
  }

  const isFullScreen = isMobile || isMaximized;
  const style: React.CSSProperties = isFullScreen
    ? { top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }
    : { top: position.y, left: position.x, width: size.w, height: size.h };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || channel.isPending) return;
    const userMessage = input.trim();
    setInput('');
    setError(null);
    
    setHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    channel.mutate({
      data: {
        message: userMessage,
        history,
        responseLength: length,
        provider,
        bullets,
      }
    }, {
      onSuccess: (res) => {
        setHistory(prev => [...prev, { role: 'assistant', content: res.reply }]);
        trackEvent('ask_dr_k_response_received', {
          requested_length: length,
          provider,
          bullet_points: bullets,
          voice_reply: speakReplies,
          response_characters: res.reply.length,
        });
        if (speakReplies) speak(res.reply);
      },
      onError: (err: any) => {
        const errorMsg = err?.data?.error || err?.error || err?.message || 'An error occurred while consulting the archive.';
        setError(errorMsg);
        setHistory(prev => prev.slice(0, -1));
        setInput(userMessage);
      }
    });
  };

  return (
    <div 
      ref={windowRef}
      style={style}
      className={cn(
        "fixed z-[100] flex flex-col bg-card border-border shadow-2xl overflow-hidden",
        isFullScreen ? "border-0" : "border"
      )}
    >
      <div 
        className={cn(
          "flex items-center justify-between px-4 py-3 bg-secondary text-secondary-foreground border-b border-border select-none",
          !isFullScreen && "cursor-move"
        )}
        onPointerDown={onDragPointerDown}
        onPointerMove={onDragPointerMove}
        onPointerUp={onDragPointerUp}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={returnToMainPage}
            className="flex items-center gap-1.5 border border-primary/30 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors shrink-0"
            aria-label="Return to main page"
            title="Return to main page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Main page</span>
          </button>
          <GripHorizontal className="w-4 h-4 opacity-50" />
          <img
            src={`${import.meta.env.BASE_URL}avatar.png`}
            alt="Kuczynski"
            className="w-7 h-7 object-cover border border-primary/40"
          />
          <span className="font-mono text-xs uppercase tracking-widest font-bold text-primary">Channel: Kuczynski</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (speakReplies) window.speechSynthesis?.cancel();
              setSpeakReplies(!speakReplies);
            }}
            title={speakReplies ? 'Voice replies: on' : 'Voice replies: off'}
            className={cn('p-1 transition-colors', speakReplies ? 'text-primary bg-primary/10' : 'hover:bg-secondary-foreground/10')}
          >
            {speakReplies ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMaximized(false);
              minimizeDialogue();
            }}
            className="p-1 hover:bg-secondary-foreground/10 transition-colors"
            aria-label="Minimize chat"
            title="Minimize chat"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          {!isMobile && (
            <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 hover:bg-secondary-foreground/10 transition-colors">
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          <button onClick={closeDialogue} className="p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-background relative">
        {history.length === 0 && !channel.isPending && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4 opacity-50 absolute inset-0 m-auto">
            <p className="font-serif text-3xl">"The record is open."</p>
            <p className="font-mono text-xs uppercase tracking-widest">Submit your inquiry to the digital corpus.</p>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto space-y-12 pb-8">
          {history.map((msg, i) => (
            <div key={i} className={cn("flex flex-col", msg.role === 'user' ? "ml-auto items-end max-w-2xl" : "mr-auto items-start w-full")}>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                {msg.role === 'assistant' && (
                  <img
                    src={`${import.meta.env.BASE_URL}avatar.png`}
                    alt="Kuczynski"
                    className="w-6 h-6 object-cover border border-primary/40"
                  />
                )}
                {msg.role === 'user' ? 'Inquiry' : 'Archive'}
              </span>
              <div className={cn(
                "p-5 md:p-8",
                msg.role === 'user' 
                  ? "bg-card border border-border text-foreground font-sans text-sm md:text-base w-full" 
                  : "bg-transparent text-foreground font-serif text-lg md:text-xl tracking-tight w-full"
              )}>
                <MessageText content={msg.content} />
              </div>
            </div>
          ))}
          
          {channel.isPending && (
            <div className="flex flex-col mr-auto items-start w-full" aria-busy="true">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                <img
                  src={`${import.meta.env.BASE_URL}avatar.png`}
                  alt="Kuczynski"
                  className="w-6 h-6 object-cover border border-primary/40"
                />
                Archive
              </span>
              <div className="p-5 md:p-8 font-serif text-lg md:text-xl tracking-tight text-foreground w-full">
                {channel.streamedReply ? (
                  <>
                    <MessageText content={channel.streamedReply} />
                    <span aria-hidden="true" className="inline-block w-2 h-4 mt-2 bg-primary animate-pulse" />
                  </>
                ) : (
                  <div role="status" className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-2 h-2 shrink-0 bg-primary animate-pulse" aria-hidden="true" />
                    <span className="italic">{channel.streamStatus}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="px-6 py-3 bg-destructive/10 border-t border-destructive text-destructive text-sm font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="w-4 h-4"/></button>
        </div>
      )}

      <div className="px-4 py-2 border-t border-border bg-card flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={downloadTranscript}
          disabled={!history.length || channel.isPending}
          title="Download the complete question-and-answer thread as a text file"
          className="flex items-center gap-2 px-2 py-1 text-xs font-mono text-primary border border-primary/30 hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Download thread
        </button>
        <button
          type="button"
          onClick={clearConversation}
          disabled={channel.isPending || listening || transcribing}
          title="Remove all messages and refresh the page"
          className="flex items-center gap-2 px-2 py-1 text-xs font-mono text-muted-foreground border border-border hover:text-primary hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          Clear conversation
        </button>
      </div>

      {/* Response preferences */}
      <div className="px-4 py-2 border-t border-border bg-card flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          AI
          <select
            value={provider}
            disabled={channel.isPending}
            onChange={(e) => setProvider(e.target.value as typeof provider)}
            className="bg-background border border-border px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-foreground focus:outline-none focus:border-primary"
          >
            <option value="gemini">Gemini</option>
            <option value="perplexity">Perplexity</option>
            <option value="dr-k">Dr. K Original</option>
          </select>
        </label>
        <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Length
          <select
            value={length}
            onChange={(e) => setLength(e.target.value as LengthKey)}
            className="bg-background border border-border px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-foreground focus:outline-none focus:border-primary"
          >
            {LENGTH_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </label>
        <span className="text-[11px] text-muted-foreground">
          {LENGTH_OPTIONS.find((o) => o.key === length)?.description}
        </span>
        <button
          type="button"
          onClick={() => setBullets(!bullets)}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest border transition-colors',
            bullets
              ? 'text-primary border-primary/40 bg-primary/10'
              : 'text-muted-foreground border-border hover:border-primary/30'
          )}
        >
          <List className="w-3.5 h-3.5" />
          Bullet Points {bullets ? 'On' : 'Off'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 pt-2 border-t border-border bg-card flex gap-3 items-end">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Pose a philosophical inquiry..."
          className="flex-1 max-h-48 min-h-[60px] bg-background border border-border p-3 font-sans text-sm focus:outline-none focus:border-primary resize-y"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        {speechSupported && (
          <button
            type="button"
            onClick={toggleListening}
            disabled={transcribing}
            title={
              transcribing
                ? 'Transcribing…'
                : listening
                  ? 'Stop recording'
                  : 'Speak your question'
            }
            className={cn(
              'h-[60px] w-[52px] flex items-center justify-center border transition-colors shrink-0',
              listening
                ? 'bg-destructive text-destructive-foreground border-destructive animate-pulse'
                : transcribing
                  ? 'bg-background text-muted-foreground border-border animate-pulse cursor-wait'
                  : 'bg-background text-primary border-border hover:border-primary'
            )}
          >
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}
        <Button type="submit" disabled={!input.trim() || channel.isPending} className="h-[60px] px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-widest text-xs rounded-none">
          Send
        </Button>
      </form>

      {!isFullScreen && (
        <div 
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1 text-muted-foreground opacity-50 hover:opacity-100"
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
             <path d="M12 12H0L12 0V12Z" fill="currentColor" opacity="0.5"/>
          </svg>
        </div>
      )}
    </div>
  );
}
