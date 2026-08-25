import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { Navigation } from '@/components/Navigation';

// Import pages
import { Home } from '@/pages/Home';
import { Timeline } from '@/pages/Timeline';
import { Manage } from '@/pages/Manage';
import { DialogueProvider } from '@/contexts/DialogueContext';
import { DialogueWindow } from '@/components/DialogueWindow';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const SITE_URL = 'https://jmkuczynski.ai';
const HOME_TITLE = 'AI Courses & Apps — John-Michael Kuczynski PhD';
const HOME_DESCRIPTION = 'Explore 54 AI-powered courses and 40 AI applications by John-Michael Kuczynski PhD in logic, philosophy, math, psychology, analytics, writing, and education.';

function setMetaContent(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function RouteMetadata() {
  const [location] = useLocation();

  useEffect(() => {
    const metadata = location === '/timeline'
      ? {
          title: 'Academic & Creative Timeline — John-Michael Kuczynski',
          description: 'Explore the chronological academic, philosophical, creative, and software record of John-Michael Kuczynski PhD.',
          robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        }
      : location === '/manage'
        ? {
            title: 'Manage Dossier — John-Michael Kuczynski PhD',
            description: 'Manage the public academic and creative dossier.',
            robots: 'noindex, nofollow',
          }
        : location === '/'
          ? {
              title: HOME_TITLE,
              description: HOME_DESCRIPTION,
              robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
            }
          : {
              title: 'Page Not Found — John-Michael Kuczynski PhD',
              description: 'The requested page could not be found.',
              robots: 'noindex, nofollow',
            };

    const canonicalUrl = `${SITE_URL}${location === '/' ? '/' : location}`;
    document.title = metadata.title;
    setMetaContent('name', 'description', metadata.description);
    setMetaContent('name', 'robots', metadata.robots);
    setMetaContent('property', 'og:title', metadata.title);
    setMetaContent('property', 'og:description', metadata.description);
    setMetaContent('property', 'og:url', canonicalUrl);
    setMetaContent('name', 'twitter:title', metadata.title);
    setMetaContent('name', 'twitter:description', metadata.description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [location]);

  return null;
}

function Router() {
  return (
    <Navigation>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/timeline" component={Timeline} />
          <Route path="/manage" component={Manage} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Navigation>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DialogueProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <RouteMetadata />
            <Router />
          </WouterRouter>
          <DialogueWindow />
          <Toaster />
        </DialogueProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
