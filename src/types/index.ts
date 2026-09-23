export interface TelemetryMetric {
  label: string;
  value: string;
  subtext: string;
  change?: string;
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  service: string;
  type: string;
  status: 'monitoring' | 'detected' | 'recovering' | 'recovered' | 'escalated';
  action: string;
  duration: string;
  details: string;
}

export interface ServiceStatus {
  name: string;
  namespace: string;
  replicas: string;
  cpuUsage: string;
  memUsage: string;
  status: 'healthy' | 'degraded' | 'healing';
  lastHealed: string;
}

export interface Scenario {
  id: string;
  title: string;
  trigger: string;
  action: string;
  mttd: string;
  mttr: string;
  flowDescription: string;
  details: string[];
}
