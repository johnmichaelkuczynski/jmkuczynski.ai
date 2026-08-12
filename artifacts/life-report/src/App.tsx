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
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginPrompt } from '@/components/LoginPrompt';

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
          <Route path="/timeline">
            <AdminOnly>
              <Timeline />
            </AdminOnly>
          </Route>
          <Route path="/manage">
            <AdminOnly>
              <Manage />
            </AdminOnly>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Navigation>
  );
}

function AdminOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user?.isAdmin) return <NotFound />;
  return <>{children}</>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
        <DialogueProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <DialogueWindow />
          <LoginPrompt />
          <Toaster />
        </DialogueProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
