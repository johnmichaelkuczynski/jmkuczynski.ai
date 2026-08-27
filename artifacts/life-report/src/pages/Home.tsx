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

interface ColumnItem { label: string; url?: string }

const AI_COURSES: ColumnItem[] = [
  { label: 'AI 101', url: 'https://ai101.ink' },
  { label: 'AI Integration Ethical AI & Governance Technology', url: 'https://aigovernance.ink' },
  { label: 'AI Logic', url: 'https://ailogiccourse.xyz' },
  { label: 'AI Math', url: 'https://babyaimath.xyz' },
  { label: 'Analytic Philosophy', url: 'https://analyticphilosophy101.ink' },
  { label: 'Biology', url: 'https://biology101.xyz' },
  { label: 'Business Ethics', url: 'https://businessethics101.ink' },
  { label: 'Cloud Architecture', url: 'https://cloudarchitecture.ink' },
  { label: 'Cognitive Science 101', url: 'https://babycognitivescience101.xyz' },
  { label: 'Computer Systems', url: 'https://computersystems101.xyz' },
  { label: 'Conceptual Mathematics', url: 'https://conceptualmath.ink' },
  { label: 'Conceptual Physics', url: 'https://conceptualphysics.ink' },
  { label: 'Constructive Critical Reasoning', url: 'https://constructivereasoning.xyz' },
  { label: 'Criminal Psychology', url: 'https://babycrimpsych.xyz' },
  { label: 'Critical Thinking', url: 'https://criticalthinking.ink' },
  { label: 'Data Analytics', url: 'https://babyanalytics.xyz' },
  { label: 'Data Structures and Algorithms', url: 'https://datastructures101.xyz' },
  { label: 'Databases and SQL', url: 'https://databases101.xyz' },
  { label: 'Developmental Mathematics', url: 'https://developmentalmath.ink' },
  { label: 'Developmental Psychology', url: 'https://babydevelopmentalpsychology.xyz' },
  { label: 'Diagonalization and Incompleteness', url: 'https://diagonalization.xyz' },
  { label: 'Discrete Math', url: 'https://basicdiscretemath.xyz' },
  { label: 'Ethics', url: 'https://ethics101.ink' },
  { label: 'Evolutionary Psychology', url: 'https://evopsych.xyz' },
  { label: 'Finance', url: 'https://finance101.xyz' },
  { label: 'Financial & Managerial Analytics', url: 'https://babyfinancialanalytics.xyz' },
  { label: 'Finite Math', url: 'https://babyfinitemath.xyz' },
  { label: 'Formal Logic', url: 'https://formallogic.xyz' },
  { label: 'IQ Booster', url: 'https://iqbooster.xyz' },
  { label: 'Infinite Series', url: 'https://babyinfiniteseries.xyz' },
  { label: 'Know Thyself', url: 'https://knowthyself101.xyz' },
  { label: 'Lambda Calculus', url: 'https://basiclambdacalculus.xyz' },
  { label: 'Machine Learning and Applied AI', url: 'https://machinelearning101.xyz' },
  { label: 'Machine Learning Operations', url: 'https://mlops.ink' },
  { label: 'Marketing Analytics', url: 'https://babymarketinganalytics.xyz' },
  { label: 'Math Notation', url: 'https://mathnotation.ink' },
  { label: 'Operations & Supply Chain Analytics', url: 'https://babysupplychain.xyz' },
  { label: 'Personal Finance', url: 'https://personalfinance101.xyz' },
  { label: 'Philosophy 101', url: 'https://philosophy101.xyz' },
  { label: 'Portfolio Analysis', url: 'https://portfolioanalysis101.ink' },
  { label: 'Predictive Analytics', url: 'https://babypredictiveanalytics.xyz' },
  { label: 'Programming (Python-based CS 1 / Computational Thinking)', url: 'https://python101.xyz' },
  { label: 'Prompt Engineering', url: 'https://promptengineering.ink' },
  { label: 'Prompt Engineering for AI Generative', url: 'https://generativeai.ink' },
  { label: 'Psychodynamic Therapy 101', url: 'https://psychodynamictherapy.xyz' },
  { label: 'Psychodynamic Treatment of BPD 101', url: 'https://psychodynamicbpdtherapy.xyz' },
  { label: 'Psychodynamic Treatment of OCD 101', url: 'https://psychodynamicocdtherapy.xyz' },
  { label: 'Public Speaking', url: 'https://publicspeaking101.xyz' },
  { label: 'Quantitative Reasoning', url: 'https://quantitativereasoning.ink' },
  { label: 'Restaurant & Hospitality Analytics', url: 'https://babyrestaurantanalytics.xyz' },
  { label: 'Revenue Management & Pricing Analytics', url: 'https://basicrevenuemanagement.xyz' },
  { label: 'Sociology 101', url: 'https://sociology101.ink' },
  { label: 'Spatial IQ Booster', url: 'https://spatialiqbooster.xyz' },
  { label: 'Voice Powered Know Thyself', url: 'https://voicepoweredknowthyself.xyz' },
  { label: 'Workforce Analytics', url: 'https://babyworkforceanalytics.xyz' },
];

const KEY_APPS: ColumnItem[] = [
  { label: 'Living Book Creator', url: 'https://livingbookcreator.xyz' },
  { label: 'Book Builder', url: 'https://bookbuilder.ink' },
  { label: 'Black Jesus', url: 'https://blackjesus.ink' },
  { label: 'Metaethics', url: 'https://metaethics.ink' },
  { label: 'Genius Dictation', url: 'https://geniusdictation.com' },
  { label: 'EZ Reader', url: 'https://ezreader.ai' },
  { label: 'Classic EZ Reader', url: 'https://classicezreader.ink' },
  { label: 'EZ Story', url: 'https://ezstory.xyz' },
  { label: 'NeuroText', url: 'https://neurotext.ink' },
  { label: 'Text Surgeon Plus', url: 'https://textsurgeonplus.xyz' },
  { label: 'Rewrite Plus', url: 'https://rewriteplus.xyz' },
  { label: 'GPTByPass', url: 'https://gptbypass.ink' },
  { label: 'Forensic Document Verifier', url: 'https://forensicdocumentverifier.com' },
  { label: 'Cognitive Career Profiler', url: 'https://cognitivecareer.xyz' },
  { label: 'Chess Tutor', url: 'https://chesstutor.xyz' },
  { label: 'College AI Match', url: 'https://collegeaimatch.xyz' },
  { label: 'EZ Homework', url: 'https://ezhw.ink' },
  { label: 'EZGrader', url: 'https://ezgrader.ai' },
  { label: 'Judge Evaluator', url: 'https://judge101.ink' },
  { label: 'Texas Bar Prep', url: 'https://texasbarprep.ink' },
  { label: 'Genius 101', url: 'https://genius101.xyz' },
  { label: 'Freud GPT', url: 'https://freudgpt.me' },
  { label: 'Model Builder', url: 'https://modelwiz.xyz' },
  { label: 'Originality Meter', url: 'https://originality.ink' },
  { label: 'Intelligence Meter', url: 'https://intelmeter.ink' },
  { label: 'Mind Profiler', url: 'https://mindprofiler.ink' },
  { label: 'Mind Probe', url: 'https://mindprobe.ink' },
  { label: 'Smart Goal Tracker', url: 'https://smartgoaltracker.xyz' },
  { label: 'Psychology Pro', url: 'https://psychologypro.xyz' },
  { label: 'Model Transformer', url: 'https://modeltransformer.ink' },
  { label: 'LLM Plus', url: 'https://llmplus.ink' },
  { label: 'FrameWise', url: 'https://framewise.ink' },
  { label: 'Frame Shot', url: 'https://frameshot.xyz' },
  { label: 'Graphic Novel Creator', url: 'https://graphicnovelcreator.ink' },
  { label: 'OCR Pro', url: 'https://ocrman.shop' },
  { label: 'Photo Psychoanalysis', url: 'https://photopsychoanalysis.ink' },
  { label: 'Multiple Video Viewer', url: 'https://multivideo.ink' },
  { label: 'Audio Transcriber Plus', url: 'https://audiotranscriber.ink' },
  { label: 'Podcast Creator', url: 'https://ezpodcast.ink' },
  { label: 'Forex Edge', url: 'https://usdhkd.ink' },
  { label: 'SOXL Options Pro', url: 'https://soxlpro.xyz' },
  { label: 'SOXL Options Edge', url: 'https://soxledge.xyz' },
];

function Column({ title, items }: { title: string; items: ColumnItem[] }) {
  return (
    <div className="p-6 md:p-8">
      <h2 className="font-mono text-xs uppercase tracking-widest text-primary font-bold border-b-2 border-primary/30 pb-3 mb-4">
        {title}
      </h2>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.label} className="text-[13px] leading-snug">
              {item.url ? (
                <GatedLink
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors"
                >
                  {item.label}
                </GatedLink>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
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
              alt={`${profile.fullName}, AI courseware developer`}
              width={144}
              height={144}
              fetchPriority="high"
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
                rel="noopener noreferrer"
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
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          <Column title="AI Courses" items={AI_COURSES} />
          <Column title="Key Apps" items={KEY_APPS} />
        </div>
      </section>
    </div>
  );
}
