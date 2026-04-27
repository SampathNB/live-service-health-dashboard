import { useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStream, useUrlState } from '@/hooks';
import { useStore } from '@/store';
import { 
  MetricsChart, 
  ServiceGrid, 
  AlertsTable, 
  SummaryBar, 
  ErrorBoundary, 
  FeatureFlag, 
  AppLayout 
} from '@/components';
// Local wrapper to fix next-themes type issues with React 18
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';
const ThemeProvider = (props: ThemeProviderProps) => <NextThemesProvider {...props} />;

import { toast } from 'sonner';
import type { StreamEvent } from '@shared/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});

export default function App() {
  useUrlState();
  useStore();

  const handleStreamEvent = useCallback((event: StreamEvent) => {
    // Invalidate relevant queries based on events
    if (event.type === 'status_change') {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
    if (event.type === 'alert_created') {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.error(`New Alert: ${event.data.message}`, {
        description: `${event.data.serviceName} - ${event.data.severity}`
      });
    }
  }, []);

  const { isConnected } = useStream(handleStreamEvent);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <QueryClientProvider client={queryClient}>
        <AppLayout isConnected={isConnected}>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          </div>

          <ErrorBoundary title="Global Health Summary">
            <SummaryBar />
          </ErrorBoundary>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 space-y-8">
              <div className="panel p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Service Lattice</h2>
                </div>
                <ErrorBoundary title="Service Health Lattice">
                  <ServiceGrid />
                </ErrorBoundary>
              </div>

              <FeatureFlag name="enable-metrics-panel">
                <div className="panel p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Performance Curve</h2>
                  </div>
                  <ErrorBoundary title="Real-Time Performance Curve">
                    <MetricsChart />
                  </ErrorBoundary>
                </div>
              </FeatureFlag>
            </div>

            <div className="xl:col-span-4 h-full">
              <div className="panel h-full flex flex-col">
                <div className="p-6 border-b border-border bg-muted/10">
                  <h2 className="text-lg font-semibold">Intelligence Alerts</h2>
                </div>
                <div className="p-6 flex-1 overflow-hidden">
                  <ErrorBoundary title="Intelligence Alerts">
                    <AlertsTable />
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </div>
        </AppLayout>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

