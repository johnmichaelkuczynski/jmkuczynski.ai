import { useAuth } from '@/contexts/AuthContext';
import { X } from 'lucide-react';

export function LoginPrompt() {
  const { promptOpen, closePrompt, login } = useAuth();

  if (!promptOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-foreground/40 p-4"
      onClick={closePrompt}
    >
      <div
        className="bg-card border border-border shadow-2xl max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closePrompt}
          className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3">
          The archive requests your name
        </p>
        <h2 className="font-serif text-3xl tracking-tight mb-3">One moment, reader.</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          You are welcome to browse the record freely. To open the works themselves or to
          channel Kuczynski in dialogue, please sign in with Google first — it takes a few
          seconds.
        </p>
        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-primary/90 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M21.35 11.1H12v2.9h5.35c-.5 2.5-2.6 4.3-5.35 4.3a5.8 5.8 0 1 1 0-11.6c1.45 0 2.75.5 3.8 1.5l2.15-2.15A8.7 8.7 0 1 0 12 20.7c5 0 8.7-3.5 8.7-8.7 0-.3 0-.6-.05-.9z"
            />
          </svg>
          Sign in with Google
        </button>
        <button
          onClick={closePrompt}
          className="w-full mt-3 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          Continue browsing
        </button>
      </div>
    </div>
  );
}
