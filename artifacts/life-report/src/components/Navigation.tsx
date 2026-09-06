import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { BookOpen, Calendar, Settings, Archive, MessageSquare, Mail, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDialogue } from '@/contexts/DialogueContext';
import { trackEvent } from '@/lib/analytics';

export function Navigation({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { openDialogue } = useDialogue();
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const openAskDrK = (surface: 'desktop' | 'mobile') => {
    trackEvent('ask_dr_k_opened', { surface });
    openDialogue();
  };

  // Record this visit once per page load, then refresh the public count.
  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}api/visit`, { method: 'POST' })
      .then(() => fetch(`${import.meta.env.BASE_URL}api/visits/stats`))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.uniqueVisitors === 'number') {
          setVisitorCount(data.uniqueVisitors);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const navItems = [
    { href: '/', label: 'Dossier', icon: BookOpen },
    { href: '/timeline', label: 'Timeline', icon: Calendar },
    { href: '/manage', label: 'Manage', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border shrink-0 fixed h-full bg-card">
        <div className="p-8 border-b border-border">
          <div className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-primary">
            <Archive className="w-6 h-6" />
            AI-Powered Courses
          </div>
          <a
            href="mailto:jmkuczynski@yahoo.com"
            onClick={() => trackEvent('contact_clicked', { surface: 'desktop' })}
            className="mt-4 flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Contact Me
          </a>
        </div>
        <nav className="flex-1 py-6 px-4 flex flex-col">
          <div className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:text-primary',
                    isActive 
                      ? 'text-primary bg-primary/5 border border-primary/20' 
                      : 'text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="p-4 border-t border-border space-y-3">
          {visitorCount !== null && (
            <div className="flex items-center gap-2 px-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground" title="Unique visitors">
              <Users className="w-3.5 h-3.5 text-primary" />
              {visitorCount.toLocaleString()} unique visitor{visitorCount === 1 ? '' : 's'}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground font-mono text-center">
            Updated {new Date().toLocaleDateString()}
          </p>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2 font-serif text-xl font-bold text-primary">
          <Archive className="w-5 h-5" />
          AI-Powered Courses
        </div>
        <div className="flex items-center gap-2">
          {visitorCount !== null && (
            <span className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono text-muted-foreground border border-border" title="Unique visitors">
              <Users className="w-3.5 h-3.5 text-primary" />
              {visitorCount.toLocaleString()}
            </span>
          )}
          <a
            href="mailto:jmkuczynski@yahoo.com"
            onClick={() => trackEvent('contact_clicked', { surface: 'mobile' })}
            className="p-2 bg-primary text-primary-foreground flex items-center justify-center"
            aria-label="Contact Me"
          >
            <Mail className="w-4 h-4" />
          </a>
          <button onClick={() => openAskDrK('mobile')} className="p-2 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center cursor-pointer">
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      {navItems.length > 0 && (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card flex z-50">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors',
                isActive 
                  ? 'text-primary border-t-2 border-primary -mt-[1px]' 
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      )}

      {/* Ask Dr. K — fixed top right (desktop) */}
      <button
        onClick={() => openAskDrK('desktop')}
        className="hidden md:flex fixed top-6 right-6 z-50 items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest font-bold shadow-lg hover:bg-primary/90 transition-colors cursor-pointer"
      >
        <MessageSquare className="w-4 h-4" />
        Ask Dr. K
      </button>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
