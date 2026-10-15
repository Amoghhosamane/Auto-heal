import React, { useState, useEffect } from 'react';
import { SYSTEM_METRICS, INITIAL_INCIDENTS, CLUSTER_SERVICES } from '../data/mockData';
import { api, type HealthStatus } from '../api/client';
import type { IncidentEvent, ServiceStatus, TelemetryMetric } from '../types';
import {
  Server,
  RotateCcw,
  Play,
  CheckCircle2,
  Terminal,
  Zap,
  Filter,
  Wifi,
  WifiOff,
  Cpu,
  AlertOctagon,
  Layers,
  ChevronDown,
  ArrowRight,
  Trash2
} from 'lucide-react';

interface DashboardPreviewProps {
  isStandalone?: boolean;
}

type SimulationState = 'idle' | 'triggering' | 'detected' | 'recovering' | 'resolved' | 'failed';

interface ScenarioOption {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
}

const SCENARIOS: ScenarioOption[] = [
  {
    id: 'scenario-pod-crash',
    name: 'Pod Crash',
    category: 'CrashLoopBackOff',
    description: 'Exit code 137 OOMKill on payment-gateway-svc',
    icon: AlertOctagon
  },
  {
    id: 'scenario-cpu-overload',
    name: 'High CPU',
    category: 'Compute Saturation',
    description: 'CPU spikes to 94% on auth-session-worker',
    icon: Cpu
  },
  {
    id: 'scenario-memory-saturation',
    name: 'Memory Saturation',
    category: 'Memory Ceiling (>90%)',
    description: 'Heap saturates at 96% on payment-gateway-svc',
    icon: Layers
  },
  {
    id: 'scenario-bad-deployment',
    name: 'Bad Deployment',
    category: 'HTTP 500 Spike',
    description: 'Error rate reaches 14.8% on checkout-api-v2',
    icon: Zap
  }
];

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ isStandalone = false }) => {
  const [incidents, setIncidents] = useState<IncidentEvent[]>(INITIAL_INCIDENTS);
  const [services, setServices] = useState<ServiceStatus[]>(CLUSTER_SERVICES);
  const [metrics, setMetrics] = useState<TelemetryMetric[]>(SYSTEM_METRICS);
  const [backendHealth, setBackendHealth] = useState<HealthStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'services'>('timeline');

  // Simulation controls state
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario-pod-crash');
  const [simState, setSimState] = useState<SimulationState>('idle');
  const [simMessage, setSimMessage] = useState<string | null>(null);
  const [activeSimIncidentId, setActiveSimIncidentId] = useState<string | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);

  // Fetch initial data from backend and listen on WebSocket
  useEffect(() => {
    let ws: WebSocket | null = null;

    const loadData = async () => {
      try {
        const [healthData, metricsData, incidentsData, servicesData] = await Promise.all([
          api.getHealth(),
          api.getMetrics(),
          api.getIncidents(),
          api.getServices()
        ]);
        setBackendHealth(healthData);
        if (metricsData.metrics && metricsData.metrics.length > 0) {
          setMetrics(metricsData.metrics);
        }
        if (incidentsData && incidentsData.length > 0) {
          setIncidents(incidentsData);
        }
        if (servicesData && servicesData.length > 0) {
          setServices(servicesData);
        }
        setIsConnected(true);
      } catch (err) {
        console.warn('Backend not reachable, operating in standalone demo mode:', err);
        setIsConnected(false);
      }
    };

    loadData();

    // Setup WebSocket connection
    try {
      ws = api.createWebSocket();
      ws.onopen = () => setIsConnected(true);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'metrics_tick' && payload.data?.metrics) {
            setMetrics(payload.data.metrics);
          } else if (payload.event === 'services_update' && Array.isArray(payload.data)) {
            setServices(payload.data);
          } else if (payload.event === 'incidents_cleared') {
            setIncidents([]);
          } else if (payload.event === 'new_incident' && payload.data) {
            setIncidents(prev => [payload.data, ...prev]);
            setSimState('detected');
            setSimMessage(`Detected: ${payload.data.type} on ${payload.data.service}`);
            setActiveSimIncidentId(payload.data.id);
          } else if (payload.event === 'incident_update' && payload.data) {
            setIncidents(prev => prev.map(inc => 
              inc.id === payload.data.id ? { ...inc, status: payload.data.status } : inc
            ));
            if (payload.data.status === 'recovering') {
              setSimState('recovering');
              setSimMessage(`Recovering: Executing ${payload.data.action || 'policy'}...`);
            } else if (payload.data.status === 'recovered') {
              setSimState('resolved');
              setSimMessage('Resolved: Synthetic healthcheck passed. Endpoint healthy.');
              setTimeout(() => {
                setSimState('idle');
                setSimMessage(null);
                setActiveSimIncidentId(null);
              }, 4000);
            } else if (payload.data.status === 'escalated') {
              setSimState('failed');
              setSimMessage('Escalated: Circuit breaker triggered or limit reached.');
              setTimeout(() => {
                setSimState('idle');
                setSimMessage(null);
                setActiveSimIncidentId(null);
              }, 4000);
            }
          }
        } catch {
          // ignore parsing error
        }
      };
      ws.onerror = () => setIsConnected(false);
      ws.onclose = () => setIsConnected(false);
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const handleTriggerSimulation = async (scenarioIdToRun?: string) => {
    if (simState !== 'idle') return; // Prevent duplicate requests
    const targetId = scenarioIdToRun || activeScenarioId;
    const targetScenario = SCENARIOS.find(s => s.id === targetId) || SCENARIOS[0];

    setSimState('triggering');
    setSimMessage(`Triggering synthetic chaos: ${targetScenario.name}...`);

    try {
      if (isConnected) {
        // Call backend POST /api/simulations
        await api.triggerSimulation(targetId);
      } else {
        // Fallback local mode if backend isn't running
        setTimeout(() => {
          setSimState('detected');
          setSimMessage(`Detected: ${targetScenario.name} on target service`);
        }, 800);
        setTimeout(() => {
          setSimState('recovering');
          setSimMessage('Recovering: Autonomous actuator dispatched...');
        }, 1800);
        setTimeout(() => {
          const newId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
          setIncidents(prev => [{
            id: newId,
            timestamp: 'Just now',
            service: targetId === 'scenario-cpu-overload' ? 'auth-session-worker' : 'payment-gateway-svc',
            type: targetScenario.name,
            status: 'recovered',
            action: 'Restart & Replace Pod',
            duration: '2.4s',
            details: `Simulated ${targetScenario.name} self-healed.`
          }, ...prev]);
          setSimState('resolved');
          setSimMessage('Resolved: Healthcheck 200 OK. Restored.');
          setTimeout(() => {
            setSimState('idle');
            setSimMessage(null);
          }, 3500);
        }, 3200);
      }
    } catch (err) {
      console.error('Simulation error:', err);
      setSimState('failed');
      setSimMessage('Failed to trigger simulation. Check backend connection.');
      setTimeout(() => {
        setSimState('idle');
        setSimMessage(null);
      }, 3500);
    }
  };

  const selectedScenario = SCENARIOS.find(s => s.id === activeScenarioId) || SCENARIOS[0];
  const isBusy = simState !== 'idle';

  return (
    <section id="dashboard" className={`bg-slate-50 dark:bg-midnight-950 transition-colors ${isStandalone ? 'py-8 lg:py-10 min-h-screen' : 'py-10'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Dashboard Title & Metadata Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-200/80 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-sans text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">Operations Console</span>
              <span>•</span>
              <span>Mode: <strong className="font-mono text-slate-900 dark:text-white uppercase">{backendHealth?.operating_mode || 'demo'}</strong></span>
              <span>•</span>
              <span>Provider: <strong className="font-mono text-slate-900 dark:text-white uppercase">{backendHealth?.cloud_provider || 'demo'}</strong></span>
              <span>•</span>
              <span className="inline-flex items-center space-x-1">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live Telemetry</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-400">Offline / Demo Mode</span>
                  </>
                )}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white font-sans">
              AutoHeal Command Center
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Provider-independent resilience engine: failure detection, policy actuation, and verified recovery.
            </p>
          </div>

          {/* Quick Runner Action Toolbar */}
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => !isBusy && setSelectorOpen(!selectorOpen)}
                disabled={isBusy}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-sans text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs disabled:opacity-50"
              >
                <span className="font-medium">{selectedScenario.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {selectorOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-30 p-1">
                  <div className="text-[11px] font-sans font-medium text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Select Chaos Vector
                  </div>
                  {SCENARIOS.map(sc => {
                    const Icon = sc.icon;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => {
                          setActiveScenarioId(sc.id);
                          setSelectorOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-md text-xs flex items-start space-x-2.5 transition-colors ${
                          sc.id === activeScenarioId
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                        <div>
                          <div className="font-sans font-medium text-slate-900 dark:text-white">{sc.name}</div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{sc.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => handleTriggerSimulation()}
              disabled={isBusy}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-sans font-medium transition-colors shadow-xs ${
                isBusy
                  ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isBusy ? (
                <>
                  <Zap className="w-3.5 h-3.5 animate-spin" />
                  <span>Healing in Progress...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Chaos Vector</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 1: Failure Simulation Controls (Linear/Stripe Style Cards) */}
        <div id="sim-controls" className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Automated Failure Simulation Controls
              </h2>
            </div>
            <span className="text-[11px] font-sans text-slate-400">
              Deterministic injection • Zero production impact
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SCENARIOS.map(sc => {
              const Icon = sc.icon;
              const isSelected = activeScenarioId === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => setActiveScenarioId(sc.id)}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 dark:border-blue-500 bg-white dark:bg-slate-900 ring-1 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {sc.category}
                      </span>
                    </div>
                    <div className="font-sans font-semibold text-sm text-slate-900 dark:text-white">
                      {sc.name}
                    </div>
                    <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {sc.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-sans text-slate-400">
                      {isSelected ? 'Ready to trigger' : 'Click to select'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveScenarioId(sc.id);
                        if (!isBusy) handleTriggerSimulation(sc.id);
                      }}
                      disabled={isBusy}
                      className="inline-flex items-center space-x-1 text-xs font-sans font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                    >
                      <span>Simulate</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Simulation State Banner (Linear Activity Bar) */}
        {simState !== 'idle' && (
          <div className={`mb-6 p-3.5 rounded-lg border font-sans text-xs transition-all ${
            simState === 'triggering' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200' :
            simState === 'detected' ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200' :
            simState === 'recovering' ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200' :
            simState === 'resolved' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' :
            'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <span className={`w-2 h-2 rounded-full ${
                  simState === 'resolved' ? 'bg-emerald-500' :
                  simState === 'detected' ? 'bg-rose-500' :
                  simState === 'triggering' ? 'bg-amber-500' : 'bg-blue-500 animate-pulse'
                }`}></span>
                <span className="font-mono font-semibold uppercase text-[11px] tracking-wider">
                  [{simState.toUpperCase()}]
                </span>
                <span className="font-sans font-medium">{simMessage}</span>
              </div>
              {activeSimIncidentId && (
                <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Incident:</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">{activeSimIncidentId}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 2: Telemetry Metrics Cards (Stripe / Vercel Grade Grid) */}
        <div id="telemetry-metrics" className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cluster Telemetry & Performance Metrics
            </h2>
            <span className="text-[11px] font-sans text-slate-400">Updated in real-time</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
              >
                <div className="text-xs font-sans font-medium text-slate-500 dark:text-slate-400">
                  {metric.label}
                </div>
                <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white font-mono tracking-tight mt-1.5">
                  {metric.value}
                </div>
                <div className="text-[11px] font-sans text-slate-400 dark:text-slate-500 mt-1">
                  {metric.subtext}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Data Table Panel (Linear / Stripe Grade Tables) */}
        <div id="incident-timeline" className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">

          {/* Table Header & Tab Control */}
          <div className="px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-md p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-sans">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'timeline'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Recent Failure Timeline ({incidents.length})
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'services'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Cluster Services ({services.length})
              </button>
            </div>

            <div className="flex items-center space-x-3 text-xs font-sans text-slate-500 dark:text-slate-400">
              {incidents.length > 0 && (
                <button
                  onClick={async () => {
                    try {
                      await api.clearIncidents();
                      setIncidents([]);
                    } catch (e) {
                      setIncidents([]);
                    }
                  }}
                  className="inline-flex items-center space-x-1 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 transition-colors"
                  title="Clear all recorded incidents"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              )}
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active Protection</span>
              </span>
              <span>•</span>
              <span className="hidden sm:inline-flex items-center space-x-1">
                <Filter className="w-3 h-3 text-slate-400" />
                <span>All Namespaces</span>
              </span>
            </div>
          </div>

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5 font-medium">Incident ID</th>
                      <th className="pb-2.5 font-medium">Service</th>
                      <th className="pb-2.5 font-medium">Failure Classification</th>
                      <th className="pb-2.5 font-medium">Remediation Action</th>
                      <th className="pb-2.5 font-medium">MTTR</th>
                      <th className="pb-2.5 font-medium">Status</th>
                      <th className="pb-2.5 font-medium text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {incidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {inc.id}
                        </td>
                        <td className="py-3 font-mono text-xs">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                            {inc.service}
                          </span>
                        </td>
                        <td className="py-3 text-slate-700 dark:text-slate-300 font-sans">
                          {inc.type}
                        </td>
                        <td className="py-3 font-sans text-slate-800 dark:text-slate-200 font-medium">
                          <span className="flex items-center space-x-1.5">
                            <RotateCcw className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>{inc.action}</span>
                          </span>
                        </td>
                        <td className="py-3 font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                          {inc.duration}
                        </td>
                        <td className="py-3 font-sans">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                            inc.status === 'recovered'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              : inc.status === 'recovering'
                              ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 animate-pulse'
                              : inc.status === 'detected'
                              ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                              : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}>
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                            {inc.status === 'escalated' ? 'Escalated' : inc.status === 'recovering' ? 'Recovering...' : inc.status === 'detected' ? 'Active Alert' : 'Self-Healed'}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-[11px] text-slate-400">
                          {inc.timestamp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Audit Trail Detail Pipeline (Linear Issue Timeline Style) */}
              <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3 text-xs font-sans text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Terminal className="w-3.5 h-3.5 text-blue-500" />
                    <span>Audit Trail Pipeline: {incidents[0]?.id || 'Active Incident'}</span>
                  </div>
                  <span className="text-[11px] font-sans text-blue-600 dark:text-blue-400 font-medium">
                    Deterministic Closed-Loop Execution
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[
                    { step: '01. DETECTED', title: 'Threshold Breach', desc: incidents[0]?.type || 'Health probe failed' },
                    { step: '02. CLASSIFIED', title: 'Policy Selected', desc: incidents[0]?.action || 'Remediation matched' },
                    { step: '03. EXECUTED', title: 'Actuator Dispatched', desc: `Target: ${incidents[0]?.service || 'Workload'}` },
                    { step: '04. VERIFIED', title: 'Health Confirmed', desc: 'Synthetic probes passed 200 OK' },
                  ].map(item => (
                    <div
                      key={item.step}
                      className="p-3 rounded-md bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
                    >
                      <div className="text-[10px] font-mono text-slate-400 font-medium">{item.step}</div>
                      <div className="font-sans font-medium text-xs text-slate-900 dark:text-white mt-0.5">{item.title}</div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5 font-medium">Service Name</th>
                      <th className="pb-2.5 font-medium">Namespace</th>
                      <th className="pb-2.5 font-medium">Replicas</th>
                      <th className="pb-2.5 font-medium">CPU Usage</th>
                      <th className="pb-2.5 font-medium">Mem Usage</th>
                      <th className="pb-2.5 font-medium">Status</th>
                      <th className="pb-2.5 font-medium text-right">Last Healed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {services.map((svc) => (
                      <tr key={svc.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 font-sans font-medium text-slate-900 dark:text-white">
                          <span className="flex items-center space-x-2">
                            <Server className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{svc.name}</span>
                          </span>
                        </td>
                        <td className="py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{svc.namespace}</td>
                        <td className="py-3 font-mono text-xs font-medium text-slate-700 dark:text-slate-300">{svc.replicas}</td>
                        <td className="py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{svc.cpuUsage}</td>
                        <td className="py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{svc.memUsage}</td>
                        <td className="py-3 font-sans">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                            svc.status === 'healthy'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 animate-pulse'
                          }`}>
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                            {svc.status === 'healthy' ? 'Healthy' : 'Healing'}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-[11px] text-slate-400">{svc.lastHealed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

