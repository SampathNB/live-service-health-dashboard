import { useQuery } from '@tanstack/react-query';
import { api } from '@/services';
import { useStore } from '@/store';
import { Input } from '@/components';
import { Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib';
import { useState, useMemo } from 'react';

export function ServiceGrid() {
  const { selectedServiceId, setSelectedServiceId, statusFilter, setStatusFilter } = useStore();
  const [search, setSearch] = useState('');

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: api.getServices,
    refetchInterval: 10000
  });

  const filteredServices = useMemo(() => {
    if (!services) return [];
    return services
      .filter(s => {
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [services, statusFilter, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed rounded-xl bg-muted/20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-9 h-9 text-sm rounded-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex bg-muted p-1 rounded-lg">
          {(['all', 'healthy', 'degraded', 'down'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all",
                statusFilter === s
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredServices.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="col-span-full text-center py-12 text-muted-foreground"
            >
              No services found
            </motion.div>
          )}
          {filteredServices.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setSelectedServiceId(service.id)}
              className={cn(
                "p-5 rounded-xl border transition-all cursor-pointer group relative",
                selectedServiceId === service.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:border-primary/50 hover:shadow-md"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{service.group}</p>
                </div>
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full shadow-sm",
                  service.status === 'healthy' ? "bg-emerald-500" :
                    service.status === 'degraded' ? "bg-amber-500" : "bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                )} />
              </div>

              {/* Metrics Display */}
              {service.metrics && (
                <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-border/50">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Latency</span>
                    <div className="text-xs font-bold text-primary">{Math.round(service.metrics.responseTime.p50)}ms</div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Error Rate</span>
                    <div className={cn(
                      "text-xs font-bold",
                      service.metrics.errorRate > 1 ? "text-rose-500" : "text-emerald-500"
                    )}>
                      {service.metrics.errorRate.toFixed(2)}%
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Req/sec</span>
                    <div className="text-xs font-bold text-blue-500">{Math.round(service.metrics.requestRate)}</div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-end pt-2 border-t border-border/50">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">Tier</span>
                  <div className="text-[10px] font-bold uppercase">{service.metadata.tier}</div>
                </div>
                <div className="text-[9px] font-mono text-muted-foreground/40 font-medium">
                  {new Date(service.lastCheckedAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
