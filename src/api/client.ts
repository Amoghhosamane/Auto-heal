import type { IncidentEvent, ServiceStatus, TelemetryMetric } from '../types';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');
const API_BASE_URL = (rawBaseUrl || 'http://localhost:8000').replace(/\/+$/, '');

export interface HealthStatus {
  status: string;
  version: string;
  operating_mode: string;
  cloud_provider: string;
  cluster_target: string;
  database_connected: boolean;
  prometheus_available: boolean;
  kubernetes_available: boolean;
  live_recovery_enabled: boolean;
}

export interface MetricsSummary {
  system_health: string;
  active_services: number;
  healthy_pods: string;
  incidents_24h: number;
  recovery_rate: string;
  mttd: string;
  mttr: string;
  downtime_prevented: string;
  cpu_utilization_pct: number;
  memory_utilization_pct: number;
  p99_latency_ms: number;
  error_rate_pct: number;
  metrics: TelemetryMetric[];
}

export interface SimulationResult {
  status: string;
  incident_id: string;
  scenario_id: string;
  service: string;
  action: string;
  message: string;
}

export const api = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async getMetrics(): Promise<MetricsSummary> {
    const res = await fetch(`${API_BASE_URL}/api/metrics`);
    if (!res.ok) throw new Error(`Failed to load metrics: ${res.statusText}`);
    return res.json();
  },

  async getServices(): Promise<ServiceStatus[]> {
    const res = await fetch(`${API_BASE_URL}/api/services`);
    if (!res.ok) throw new Error(`Failed to load services: ${res.statusText}`);
    return res.json();
  },

  async getIncidents(): Promise<IncidentEvent[]> {
    const res = await fetch(`${API_BASE_URL}/api/incidents`);
    if (!res.ok) throw new Error(`Failed to load incidents: ${res.statusText}`);
    const data = await res.json();
    return data.incidents || [];
  },

  async triggerSimulation(scenarioId: string, serviceName?: string): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE_URL}/api/simulations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: scenarioId, service_name: serviceName })
    });
    if (!res.ok) throw new Error(`Failed to trigger simulation: ${res.statusText}`);
    return res.json();
  },

  async recoverIncident(incidentId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/incidents/${incidentId}/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force: true })
    });
    if (!res.ok) throw new Error(`Recovery execution failed: ${res.statusText}`);
    return res.json();
  },

  createWebSocket(): WebSocket {
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/ws/dashboard';
    return new WebSocket(wsUrl);
  }
};
