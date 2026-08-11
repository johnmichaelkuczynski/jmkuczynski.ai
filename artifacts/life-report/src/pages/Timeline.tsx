import { useState, useMemo } from 'react';
import { useGetTimeline } from '@workspace/api-client-react';
import { CategoryBadge } from '@/components/CategoryBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, Link as LinkIcon, Paperclip } from 'lucide-react';
import { GatedLink } from '@/components/GatedLink';

export function Timeline() {
  const { data: timeline, isLoading } = useGetTimeline();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTimeline = useMemo(() => {
    if (!timeline) return [];
    if (!searchQuery) return timeline;
    const q = searchQuery.toLowerCase();
    
    return timeline.map(yearGroup => {
      const filteredItems = yearGroup.items.filter(item => 
        item.title.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.venue && item.venue.toLowerCase().includes(q))
      );
      return { ...yearGroup, items: filteredItems };
    }).filter(group => group.items.length > 0);
  }, [timeline, searchQuery]);

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-12">
        <Skeleton className="w-48 h-12" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-8">
            <Skeleton className="w-24 h-8 shrink-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="w-full h-24" />
              <Skeleton className="w-full h-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!timeline) {
    return <div className="p-8 text-destructive">Failed to load timeline data.</div>;
  }

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <h1 className="font-serif text-5xl md:text-6xl text-foreground tracking-tight mb-4">
            Chronological Record
          </h1>
          <p className="text-lg text-muted-foreground">
            The continuous evolution of a life's work, year by year.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search records..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="rounded-none border-border font-mono text-sm bg-card w-full pl-9"
          />
        </div>
      </div>

      <div className="relative border-l border-border/40 ml-4 md:ml-8 pl-6 md:pl-12 space-y-16">
        {filteredTimeline.map((yearData) => (
          <div key={yearData.year} className="relative group">
            {/* Year Marker */}
            <div className="absolute -left-[45px] md:-left-[69px] top-0 bg-background text-foreground font-serif text-xl md:text-2xl pt-1">
              {yearData.year}
            </div>

            <div className="flex flex-col border-t-2 border-border">
              {yearData.items.map((item) => (
                <div 
                  key={item.id} 
                  className="group/item flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 py-3 border-b border-border/50 hover:bg-card/40 px-3 transition-colors"
                >
                   <div className="w-24 shrink-0 pt-0.5">
                     <CategoryBadge category={item.category} className="text-[9px] px-1.5 py-0" />
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <div className="flex items-baseline gap-2">
                       <h3 className="font-serif text-[1.1rem] leading-none text-foreground">{item.title}</h3>
                       {item.featured && <span className="text-[9px] font-mono text-primary border border-primary/20 bg-primary/5 px-1 tracking-wider">FEATURED</span>}
                     </div>
                     {(item.role || item.description) && (
                       <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug pr-4">
                         {item.role && <span className="font-medium text-foreground mr-1.5">{item.role}</span>}
                         {item.description}
                       </div>
                     )}
                   </div>

                   <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:w-[280px] shrink-0 text-[10px] font-mono uppercase tracking-tight mt-1 md:mt-0">
                     {item.venue && <span className="text-muted-foreground truncate max-w-[100px] bg-muted/50 px-1.5 py-0.5">{item.venue}</span>}
                     {item.metric && <span className="text-primary font-bold bg-primary/5 px-1.5 py-0.5">{item.metric}</span>}
                     
                     {item.links?.map((lnk, i) => (
                       <GatedLink key={i} href={lnk.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-foreground hover:text-primary">
                         <LinkIcon className="w-3 h-3" />
                         {lnk.label}
                       </GatedLink>
                     ))}
                     {item.filePath && (
                       <GatedLink href={`/api/storage${item.filePath}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary font-bold">
                         <Paperclip className="w-3 h-3" />
                         PDF
                       </GatedLink>
                     )}
                     {item.link && (!item.links || item.links.length === 0) && (
                       <GatedLink href={item.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-foreground hover:text-primary">
                         <LinkIcon className="w-3 h-3" />
                         Link
                       </GatedLink>
                     )}
                   </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {filteredTimeline.length === 0 && (
        <div className="py-24 text-center text-muted-foreground font-mono">
          No records found in the timeline.
        </div>
      )}
    </div>
  );
}
