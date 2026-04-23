import { useEffect } from 'react';
import { useStore } from '@/store';
import { ServiceStatus, AlertSeverity, AlertStatus } from '@shared/types';

export function useUrlState() {
  const { 
    selectedServiceId, setSelectedServiceId,
    statusFilter, setStatusFilter,
    timeRange, setTimeRange,
    alertFilters, setAlertFilters
  } = useStore();

  // Initial load from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('serviceId')) setSelectedServiceId(params.get('serviceId'));
    if (params.has('status')) setStatusFilter(params.get('status') as ServiceStatus | 'all');
    if (params.has('range')) setTimeRange(params.get('range')!);
    
    const alertStatus = params.get('alertStatus') as AlertStatus | 'all';
    const alertSeverity = params.get('alertSeverity') as AlertSeverity | 'all';
    const alertSearch = params.get('search') || '';
    
    if (alertStatus || alertSeverity || alertSearch) {
      setAlertFilters({
        status: alertStatus || 'all',
        severity: alertSeverity || 'all',
        search: alertSearch
      });
    }
  }, []);

  // Sync to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedServiceId) params.set('serviceId', selectedServiceId);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (timeRange !== '15m') params.set('range', timeRange);
    if (alertFilters.status !== 'all') params.set('alertStatus', alertFilters.status);
    if (alertFilters.severity !== 'all') params.set('alertSeverity', alertFilters.severity);
    if (alertFilters.search) params.set('search', alertFilters.search);

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedServiceId, statusFilter, timeRange, alertFilters]);
}
