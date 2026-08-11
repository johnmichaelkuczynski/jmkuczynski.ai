import { useState, useMemo } from 'react';
import { 
  useGetProfile, 
  useGetSummary, 
  useGetFeatured, 
  useListAccomplishments 
} from '@workspace/api-client-react';
import { Category } from '@workspace/api-client-react';
import { CategoryBadge } from '@/components/CategoryBadge';
import { MapPin, Globe, Mail, Building, TrendingUp, Award, ExternalLink, Search, Link as LinkIcon, Paperclip, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GatedLink } from '@/components/GatedLink';
import { useDialogue } from '@/contexts/DialogueContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export function Home() {
  const { data: profile, isLoading: isProfileLoading } = useGetProfile();
  const { data: summary, isLoading: isSummaryLoading } = useGetSummary();
  const { data: featuredItems, isLoading: isFeaturedLoading } = useGetFeatured();
  const { data: allItems, isLoading: isAllItemsLoading } = useListAccomplishments();

  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { openDialogue } = useDialogue();

  const filteredItems = useMemo(() => {
    if (!allItems) return [];
    return allItems.filter(item => {
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      if (searchQuery) {
         const q = searchQuery.toLowerCase();
         return item.title.toLowerCase().includes(q) || 
                (item.description && item.description.toLowerCase().includes(q)) ||
                (item.venue && item.venue.toLowerCase().includes(q));
      }
      return true;
    });
  }, [allItems, filterCategory, searchQuery]);

  if (isProfileLoading || isSummaryLoading || isFeaturedLoading || isAllItemsLoading) {
    return (
      <div className="p-8 space-y-12">
        <Skeleton className="w-64 h-16" />
        <Skeleton className="w-full h-32" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!profile || !summary || !featuredItems || !allItems) {
    return <div className="p-8 text-destructive">Failed to load dossier data.</div>;
  }

  const categories: (Category | 'all')[] = ['all', 'publication', 'treatise', 'software', 'patent', 'music', 'other'];

  return (
    <div className="min-h-screen">
      {/* Hero Profile Section */}
      <section className="px-6 py-16 md:px-12 md:py-24 border-b border-border bg-card relative overflow-hidden">
        {/* Subtle decorative noise or texture could go here */}
        
        <div className="max-w-4xl space-y-8 relative z-10">
          <div className="space-y-4">
            <img
              src={`${import.meta.env.BASE_URL}avatar.png`}
              alt={profile.fullName}
              className="w-28 h-28 md:w-36 md:h-36 object-cover border-2 border-primary/40 shadow-md animate-in fade-in duration-700"
            />
            <h1 className="font-serif text-6xl md:text-8xl tracking-tight text-primary animate-in fade-in slide-in-from-bottom-8 duration-700">
              {profile.fullName}
            </h1>
            <p className="text-xl md:text-2xl text-foreground font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              {profile.headline}
            </p>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {profile.summary}
          </p>

          <div className="flex flex-wrap gap-6 pt-4 text-sm font-mono text-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            {profile.affiliation && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                {profile.affiliation}
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {profile.location}
              </div>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Globe className="w-4 h-4 text-primary" />
                Website
              </a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-primary" />
                Email
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Summary Metrics */}
      <section className="border-b border-border bg-background">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Total Record</p>
            <p className="font-serif text-5xl text-foreground">{summary.total}</p>
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Years Active</p>
            <p className="font-serif text-5xl text-foreground">
              {summary.firstYear ? `${summary.firstYear}–${summary.latestYear}` : '—'}
            </p>
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Featured</p>
            <p className="font-serif text-5xl text-primary">{summary.featuredCount}</p>
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Added This Year</p>
            <p className="font-serif text-5xl text-foreground flex items-center gap-2">
              {summary.addedThisYear}
              {summary.addedThisYear > 0 && <TrendingUp className="w-6 h-6 text-emerald-600" />}
            </p>
          </div>
        </div>
      </section>

      {/* Dialogue Banner */}
      <section className="px-6 py-16 md:px-12 md:py-24 border-b border-border bg-secondary text-secondary-foreground relative overflow-hidden group cursor-pointer" onClick={openDialogue}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)] pointer-events-none group-hover:opacity-20 transition-opacity duration-700"></div>
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="w-16 h-16 mx-auto border border-primary/30 flex items-center justify-center rotate-45 group-hover:rotate-90 transition-transform duration-700">
             <MessageSquare className="w-6 h-6 text-primary -rotate-45 group-hover:-rotate-90 transition-transform duration-700" />
          </div>
          <h2 className="font-serif text-5xl md:text-7xl text-primary">Dialogue with the Archive</h2>
          <p className="text-lg md:text-xl font-medium text-secondary-foreground/80 max-w-2xl mx-auto">
            Engage directly with an AI channel trained on hundreds of thousands of pages of John-Michael Kuczynski's published treatises, essays, and notes.
          </p>
          <div className="pt-4">
             <button className="bg-primary text-primary-foreground rounded-none px-8 py-6 text-xs font-mono uppercase tracking-widest hover:bg-primary/90 transition-colors inline-flex">
               Initiate Dialogue
             </button>
          </div>
        </div>
      </section>

      {/* Featured Accomplishments */}
      {featuredItems.length > 0 && (
        <section className="px-6 py-16 md:px-12 md:py-20 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-serif text-4xl text-foreground flex items-center gap-4">
              <Award className="w-8 h-8 text-primary" />
              Featured Works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {featuredItems.map((item, i) => (
              <div 
                key={item.id} 
                className="group border border-border bg-background p-6 hover-elevate transition-all duration-300 flex flex-col h-full animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <CategoryBadge category={item.category} />
                  <span className="font-mono text-sm text-muted-foreground">{item.year}</span>
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-3">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                    {item.description}
                  </p>
                )}
                
                <div className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-2">
                  {item.venue && (
                    <div className="text-xs font-medium text-foreground">
                      <span className="text-muted-foreground">Venue: </span>{item.venue}
                    </div>
                  )}
                  {item.metric && (
                    <div className="text-xs font-mono text-primary font-bold bg-primary/5 p-2 rounded-none border border-primary/20 inline-block w-fit">
                      {item.metric}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {item.links?.map((lnk, i) => (
                      <GatedLink key={i} href={lnk.url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                        {lnk.label} <ExternalLink className="w-3 h-3" />
                      </GatedLink>
                    ))}
                    {item.filePath && (
                      <GatedLink href={`/api/storage${item.filePath}`} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-primary font-medium hover:underline transition-colors">
                        <Paperclip className="w-3 h-3" /> Paper (PDF)
                      </GatedLink>
                    )}
                    {/* Fallback legacy link */}
                    {item.link && (!item.links || item.links.length === 0) && (
                      <GatedLink href={item.link} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                        View Source <ExternalLink className="w-3 h-3" />
                      </GatedLink>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* The Full Record */}
      <section className="px-6 py-16 md:px-12 md:py-24 bg-background">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="font-serif text-4xl text-foreground mb-2">The Complete Record</h2>
            <p className="text-muted-foreground">Comprehensive index of all recorded accomplishments.</p>
          </div>
          
          <div className="flex flex-col items-end gap-4 w-full md:w-auto">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search records..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="rounded-none border-border font-mono text-sm bg-card w-full pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1 justify-end">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat as any)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border transition-colors",
                    filterCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {cat === 'all' ? 'All' : cat}
                  {cat !== 'all' && summary.byCategory.find(c => c.category === cat) && (
                    <span className="ml-1.5 opacity-70">
                      ({summary.byCategory.find(c => c.category === cat)?.count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dense Ledger List */}
        <div className="border-t-2 border-border flex flex-col">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="group flex flex-col lg:flex-row lg:items-baseline gap-2 lg:gap-4 py-2.5 border-b border-border/50 hover:bg-card/50 px-3 transition-colors"
            >
              {/* left col: year & category */}
              <div className="flex items-center lg:w-40 shrink-0 gap-3">
                 <span className="font-mono text-xs text-muted-foreground">{item.year}</span>
                 <CategoryBadge category={item.category} className="text-[9px] px-1.5 py-0" />
              </div>
              
              {/* middle col: title & description */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                 <div className="flex items-baseline gap-2">
                    <h3 className="font-serif text-[1.1rem] leading-tight text-foreground">{item.title}</h3>
                    {item.featured && <Award className="w-3.5 h-3.5 text-primary shrink-0 -translate-y-0.5" />}
                 </div>
                 {(item.role || item.description) && (
                    <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 group-hover:line-clamp-none transition-all pr-4">
                      {item.role && <span className="font-medium text-foreground mr-1.5">{item.role}</span>}
                      {item.description}
                    </div>
                 )}
              </div>
              
              {/* right col: meta & links */}
              <div className="flex flex-wrap lg:justify-end items-center gap-x-4 gap-y-2 lg:w-[340px] shrink-0 text-[10px] font-mono uppercase tracking-tight mt-1 lg:mt-0">
                 {item.venue && <span className="text-muted-foreground truncate max-w-[120px] bg-muted/50 px-1.5 py-0.5">{item.venue}</span>}
                 {item.metric && <span className="text-primary font-bold bg-primary/5 px-1.5 py-0.5">{item.metric}</span>}
                 
                 {item.links?.map((lnk, i) => (
                   <GatedLink key={i} href={lnk.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-foreground hover:text-primary hover:underline underline-offset-2">
                     <LinkIcon className="w-3 h-3" />
                     {lnk.label}
                   </GatedLink>
                 ))}
                 {item.filePath && (
                   <GatedLink href={`/api/storage${item.filePath}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline underline-offset-2 font-bold">
                     <Paperclip className="w-3 h-3" />
                     PDF
                   </GatedLink>
                 )}
                 {item.link && (!item.links || item.links.length === 0) && (
                   <GatedLink href={item.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-foreground hover:text-primary hover:underline underline-offset-2">
                     <LinkIcon className="w-3 h-3" />
                     Link
                   </GatedLink>
                 )}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="py-16 text-center text-muted-foreground font-mono">
              No records found for this filter.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
