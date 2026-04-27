import {
  Button,
  FeatureFlag,
  Input,
  Select,
  SelectItem
} from '@/components';
import { useStream } from '@/hooks';
import { cn } from '@/lib';
import { api } from '@/services';
import { useStore } from '@/store';
import { Alert, AlertStatus } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, ChevronLeft, ChevronRight, Clock, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function AlertsTable() {
  const queryClient = useQueryClient();
  const { alertFilters, setAlertFilters } = useStore();
  const [page, setPage] = useState(1);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const highlightTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pageSize = 25;

  // Fetch services for filter dropdown
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: api.getServices,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['alerts', alertFilters, page],
    queryFn: () => api.getAlerts({ ...alertFilters, page, pageSize }),
  });

  // Handle live alerts from WebSocket
  const onStreamEvent = (event: any) => {
    if (event.type === 'alert_created') {
      const newAlert = event.data;

      // Add to highlighted IDs
      setHighlightedIds(prev => new Set([...prev, newAlert.id]));

      // Remove highlight after 3 seconds
      const timeout = setTimeout(() => {
        setHighlightedIds(prev => {
          const next = new Set(prev);
          next.delete(newAlert.id);
          return next;
        });
        highlightTimeoutsRef.current.delete(newAlert.id);
      }, 3000);

      highlightTimeoutsRef.current.set(newAlert.id, timeout);

      // Reset to page 1 to show new alert at top
      setPage(1);

      // Invalidate and refetch alerts to include new one
      queryClient.invalidateQueries({ queryKey: ['alerts'] });

      // Show subtle notification
      toast.success(`New alert: ${newAlert.message}`, {
        duration: 4000,
        position: 'bottom-right'
      });
    }
  };

  useStream(onStreamEvent);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      highlightTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: AlertStatus }) => api.updateAlertStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['alerts'] });
      const previous = queryClient.getQueryData(['alerts', alertFilters, page]);
      queryClient.setQueryData(['alerts', alertFilters, page], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((a: Alert) => a.id === id ? { ...a, status } : a)
        };
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success('Alert updated successfully');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['alerts', alertFilters, page], context?.previous);
      toast.error('Failed to update alert');
    }
  });

  const alerts = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={alertFilters.search}
            onChange={(e) => setAlertFilters({ search: e.target.value })}
            className="pl-9 h-10 rounded-md border-border bg-background"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Select
            value={alertFilters.severity}
            onChange={(e) => setAlertFilters({ severity: e.target.value as any })}
            className="h-9 text-xs rounded-md bg-background"
          >
            <SelectItem value="all">Priority: All</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </Select>
          <Select
            value={alertFilters.status}
            onChange={(e) => setAlertFilters({ status: e.target.value as any })}
            className="h-9 text-xs rounded-md bg-background"
          >
            <SelectItem value="all">Status: All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </Select>
          <Select
            value={alertFilters.serviceId}
            onChange={(e) => setAlertFilters({ serviceId: e.target.value as any })}
            className="h-9 text-xs rounded-md bg-background"
          >
            <SelectItem value="all">Service: All</SelectItem>
            {services.map(service => (
              <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide border border-border rounded-lg bg-background">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-muted w-1/3 rounded" />
                <div className="h-4 bg-muted w-full rounded" />
              </div>
            ))}
          </div>
        ) : alerts.length > 0 ? (
          <div className="divide-y divide-border">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-4 flex flex-col gap-2 transition-colors rounded",
                  highlightedIds.has(alert.id)
                    ? "animate-highlight-alert border-l-4 border-yellow-500"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                      alert.severity === 'critical' ? "bg-destructive/10 text-destructive border border-destructive/20" :
                        alert.severity === 'warning' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                          "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                    )}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {alert.serviceName}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(alert.triggeredAt))} ago
                  </span>
                </div>
                <p className="text-sm font-medium leading-tight text-foreground">{alert.message}</p>

                <div className="flex items-center justify-between mt-1">
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Status: {alert.status}
                  </div>
                  <FeatureFlag name="enable-alert-actions">
                    {alert.status === 'open' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] px-3 font-semibold"
                          onClick={() => updateMutation.mutate({ id: alert.id, status: 'acknowledged' })}
                        >
                          Ack
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 text-[10px] px-3 font-semibold"
                          onClick={() => updateMutation.mutate({ id: alert.id, status: 'resolved' })}
                        >
                          Resolve
                        </Button>
                      </div>
                    )}
                  </FeatureFlag>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <CheckCircle className="w-8 h-8 mb-2 opacity-20 text-emerald-500" />
            <p className="text-xs font-medium">No active alerts found.</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-[11px] font-medium text-muted-foreground uppercase">
          {total} Total Alerts
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-bold w-12 text-center">{page} / {totalPages || 1}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}