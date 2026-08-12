import { useGetProfile } from '@workspace/api-client-react';
import { ExternalLink } from 'lucide-react';
import { GatedLink } from '@/components/GatedLink';
import { Skeleton } from '@/components/ui/skeleton';

const PROFESSIONAL_LINKS = [
  { label: 'Google Scholar', url: 'https://scholar.google.com/scholar?hl=en&as_sdt=0%2C34&q=JOHN-MICHAEL+KUCZYNSKI&btnG=' },
  { label: 'PhilPapers', url: 'https://philpeople.org/profiles/john-michael-kuczynski' },
  { label: 'Amazon', url: 'https://www.amazon.com/stores/J.-M.-Kuczynski/author/B001JOP0K6?ref=sr_ntt_srch_lnk_1&qid=1786574135&sr=8-1&shoppingPortalEnabled=true&ccs_id=86d08ffa-691d-49e7-8364-c9009f1fa858' },
  { label: 'Amazon Music', url: 'https://music.amazon.com/artists/B0829CYVWQ/john-michael-kuczynski' },
  { label: 'Quora', url: 'https://www.quora.com/profile/John-Michael-Kuczynski-1' },
];

const AI_COURSES = [
  'AI 101',
  'AI Logic',
  'AI Math',
  'Analytic Philosophy',
  'Biology',
  'Business Ethics',
  'Cognitive Science 101',
  'Computer Systems',
  'Conceptual Mathematics',
  'Conceptual Physics',
  'Constructive Critical Reasoning',
  'Criminal Psychology',
  'Critical Thinking',
  'Data Analytics',
  'Data Structures and Algorithms',
  'Databases and SQL',
  'Developmental Mathematics',
  'Developmental Psychology',
  'Diagonalization and Incompleteness',
  'Discrete Math',
  'Ethics',
  'Evolutionary Psychology',
  'Finance',
  'Financial & Managerial Analytics',
  'Finite Math',
  'Formal Logic',
  'IQ Booster',
  'Infinite Series',
  'Know Thyself',
  'Lambda Calculus',
  'Machine Learning and Applied AI',
  'Marketing Analytics',
  'Math Notation',
  'Operations & Supply Chain Analytics',
  'Personal Finance',
  'Philosophy 101',
  'Portfolio Analysis',
  'Predictive Analytics',
  'Programming (Python-based CS 1 / Computational Thinking)',
  'Prompt Engineering',
  'Psychodynamic Therapy 101',
  'Psychodynamic Treatment of BPD 101',
  'Psychodynamic Treatment of OCD 101',
  'Public Speaking',
  'Quantitative Reasoning',
  'Restaurant & Hospitality Analytics',
  'Revenue Management & Pricing Analytics',
  'Sociology 101',
  'Spatial IQ Booster',
  'Voice Powered Know Thyself',
  'Workforce Analytics',
];

const KEY_APPS: string[] = [];
const KEY_PUBLICATIONS: string[] = [];
const KEY_COMMISSIONED_WORKS: string[] = [];

function Column({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-6 md:p-8">
      <h2 className="font-mono text-xs uppercase tracking-widest text-primary font-bold border-b-2 border-primary/30 pb-3 mb-4">
        {title}
      </h2>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item} className="text-[13px] leading-snug text-foreground">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          To be listed
        </p>
      )}
    </div>
  );
}

export function Home() {
  const { data: profile, isLoading } = useGetProfile();

  if (isLoading) {
    return (
      <div className="p-8 space-y-12">
        <Skeleton className="w-64 h-16" />
        <Skeleton className="w-full h-32" />
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-destructive">Failed to load dossier data.</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Profile Section */}
      <section className="px-6 py-16 md:px-12 md:py-24 border-b border-border bg-card relative overflow-hidden">
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

          <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2 text-sm font-mono uppercase tracking-widest animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {PROFESSIONAL_LINKS.map((lnk) => (
              <GatedLink
                key={lnk.label}
                href={lnk.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
                {lnk.label}
              </GatedLink>
            ))}
          </div>
        </div>
      </section>

      {/* Four-Column Index */}
      <section className="bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 xl:divide-y-0 md:divide-x divide-border">
          <Column title="AI Courses" items={AI_COURSES} />
          <Column title="Key Apps" items={KEY_APPS} />
          <Column title="Key Peer-Reviewed Publications" items={KEY_PUBLICATIONS} />
          <Column title="Key Commissioned Works" items={KEY_COMMISSIONED_WORKS} />
        </div>
      </section>
    </div>
  );
}
