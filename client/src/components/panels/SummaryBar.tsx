import { useQuery } from '@tanstack/react-query';
import { api } from '@/services';
import { Activity, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib';

export function SummaryBar() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: api.getSummary,
    refetchInterval: 5000
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="panel h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = [
    { label: 'Total Services', value: summary?.totalServices, icon: Activity, color: 'text-primary', sub: 'Monitoring active' },
    { label: 'System Uptime', value: `${((summary?.healthyCount || 0) / (summary?.totalServices || 1) * 100).toFixed(1)}%`, icon: ShieldCheck, color: 'text-emerald-500', sub: 'Last 24h' },
    { label: 'Active Alerts & Info', value: (summary?.activeAlerts?.critical || 0) + (summary?.activeAlerts?.warning || 0) + (summary?.activeAlerts?.info || 0), icon: AlertTriangle, color: 'text-rose-500', sub: `${summary?.activeAlerts.critical} Critical, ${summary?.activeAlerts.warning} Warning, ${summary?.activeAlerts.info} Info` },
    { label: 'Avg Latency', value: `${summary?.avgResponseTime.toFixed(0)}ms`, icon: Zap, color: 'text-primary', sub: 'Global average' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="panel p-5 flex flex-col justify-between group hover:border-primary/50 transition-colors cursor-default"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={cn("p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors", stat.color)}>
              <stat.icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {stat.value}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {stat.sub}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
