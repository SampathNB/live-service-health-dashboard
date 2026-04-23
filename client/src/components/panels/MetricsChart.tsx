import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';
import { useStore } from '@/store';
import { Select, SelectItem, Skeleton } from '@/components';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { MetricDataPoint } from '@shared/types';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useStream } from '@/hooks';
import { Activity } from 'lucide-react';

export function MetricsChart() {
  const { selectedServiceId, timeRange, setTimeRange } = useStore();
  const queryClient = useQueryClient();
  const [liveMetrics, setLiveMetrics] = useState<MetricDataPoint[]>([]);

  // Fetch initial history when service changes
  const { data: history, isLoading } = useQuery({
    queryKey: ['metrics', selectedServiceId],
    queryFn: () => selectedServiceId ? api.getMetrics(selectedServiceId) : Promise.resolve([]),
    enabled: !!selectedServiceId,
  });

  // Sync internal state with history
  useEffect(() => {
    if (history) setLiveMetrics(history);
  }, [history]);

  const onStreamEvent = useCallback((event: any) => {
    if (event.type === 'metric_update' && event.serviceId === selectedServiceId) {
      setLiveMetrics(prev => {
        const next = [...prev, event.data];
        return next.slice(-100); // Only keep last 100 for memory efficiency
      });
    }
  }, [selectedServiceId]);

  // Append new points from steam
  useStream(onStreamEvent);

  const chartData = useMemo(() => {
    return liveMetrics.map(m => ({
      ...m,
      time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latency: Math.round(m.responseTime.p50),
      p95: Math.round(m.responseTime.p95),
      p99: Math.round(m.responseTime.p99),
      errors: m.errorRate
    }));
  }, [liveMetrics]);

  if (!selectedServiceId) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center bg-muted/20 border border-dashed rounded-xl border-border">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
           <Activity className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Select a service</h3>
        <p className="text-xs text-muted-foreground mt-1">Real-time performance metrics will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Time Range:</span>
           <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-32 h-8 text-xs bg-background border-border"
            >
              <SelectItem value="5m">5 Minutes</SelectItem>
              <SelectItem value="15m">15 Minutes</SelectItem>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="6h">6 Hours</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
            </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latency Curve */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight">Response Time (ms)</h3>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">P50</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">P95</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">P99</span>
               </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            {isLoading ? <Skeleton className="h-full w-full rounded-lg" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.1}/>
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeOpacity={0.1} strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    minTickGap={40}
                    tick={{ fill: 'currentColor', opacity: 0.5 }}
                    className="font-medium"
                  />
                  <YAxis 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `${val}ms`}
                    tick={{ fill: 'currentColor', opacity: 0.5 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Area type="monotone" dataKey="latency" name="p50" stroke="var(--primary)" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} isAnimationActive={false} />
                  <Line type="monotone" dataKey="p95" name="p95" stroke="currentColor" strokeWidth={1} dot={false} strokeDasharray="4 4" opacity={0.3} isAnimationActive={false} />
                  <Line type="monotone" dataKey="p99" name="p99" stroke="#f43f5e" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Throughput Mapping */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight">Throughput & Reliability</h3>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Req/s</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Errors</span>
               </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            {isLoading ? <Skeleton className="h-full w-full rounded-lg" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid vertical={false} strokeOpacity={0.1} strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    minTickGap={40}
                    tick={{ fill: 'currentColor', opacity: 0.5 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'currentColor', opacity: 0.5 }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fill: 'currentColor', opacity: 0.5 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="requestRate" name="Req/s" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line yAxisId="right" type="stepAfter" dataKey="errors" name="Errors %" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
