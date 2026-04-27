import { AlertSeverity, AlertStatus, FeatureFlags, ServiceStatus } from '@shared/types';
import { create } from 'zustand';

interface DashboardState {
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string | null) => void;

  statusFilter: ServiceStatus | 'all';
  setStatusFilter: (status: ServiceStatus | 'all') => void;

  timeRange: string;
  setTimeRange: (range: string) => void;

  alertFilters: {
    status: AlertStatus | 'all';
    severity: AlertSeverity | 'all';
    search: string;
    serviceId: string | 'all';
  };
  setAlertFilters: (filters: Partial<DashboardState['alertFilters']>) => void;

  featureFlags: FeatureFlags;
  setFeatureFlags: (flags: Partial<FeatureFlags>) => void;
}

export const useStore = create<DashboardState>((set) => ({
  selectedServiceId: null,
  setSelectedServiceId: (id) => set({ selectedServiceId: id }),

  statusFilter: 'all',
  setStatusFilter: (status) => set({ statusFilter: status }),

  timeRange: '15m',
  setTimeRange: (range) => set({ timeRange: range }),

  alertFilters: {
    status: 'all',
    severity: 'all',
    search: '',
    serviceId: 'all',
  },
  setAlertFilters: (filters) => set((state) => ({
    alertFilters: { ...state.alertFilters, ...filters }
  })),

  featureFlags: {
    'enable-metrics-panel': true,
    'enable-alert-actions': true,
  },
  setFeatureFlags: (flags) => set((state) => ({
    featureFlags: { ...state.featureFlags, ...flags }
  })),
}));
