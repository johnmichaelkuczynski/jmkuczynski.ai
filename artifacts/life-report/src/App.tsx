import { type ReactNode } from 'react';
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
