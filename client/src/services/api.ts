import { Service, MetricDataPoint, Alert, DashboardSummary } from '@shared/types';

const API_BASE = '/api';

export const api = {
  getServices: async (): Promise<Service[]> => {
    const res = await fetch(`${API_BASE}/services`);
    return res.json();
  },
  
  getMetrics: async (id: string): Promise<MetricDataPoint[]> => {
    const res = await fetch(`${API_BASE}/services/${id}/metrics`);
    return res.json();
  },
  
  getAlerts: async (params: any): Promise<{ data: Alert[], total: number }> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== 'all') query.append(k, String(v));
    });
    const res = await fetch(`${API_BASE}/alerts?${query.toString()}`);
    return res.json();
  },
  
  updateAlertStatus: async (id: string, status: string): Promise<Alert> => {
    const res = await fetch(`${API_BASE}/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },
  
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    return res.json();
  }
};
