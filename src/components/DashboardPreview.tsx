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
  ChevronDown
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
    category: 'Memory Limit (>90%)',
    description: 'Heap saturates at 96% on payment-gateway-svc',
    icon: Layers
  },
  {
    id: 'scenario-bad-deployment',
    name: 'Bad Deployment',
    category: 'Canary 500 Spikes',
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
              setSimMessage('Resolved: Synthetic healthcheck passed. Zero 502 errors.');
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
            timestamp: 'Just now (Simulated)',
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
    <section id="dashboard" className={`border-b border-slate-200 dark:border-midnight-800 bg-slate-50 dark:bg-midnight-950 transition-colors duration-200 ${isStandalone ? 'pt-8 pb-16 min-h-screen' : 'py-14'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-healblue-600 dark:text-healblue-400 uppercase tracking-wider mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-healblue-500 animate-pulse"></span>
              <span>Production Monitor</span>
              <span className="text-slate-300 dark:text-midnight-700">•</span>
              <span className="text-slate-500 dark:text-slate-400">Mode: {backendHealth?.operating_mode || 'demo'}</span>
              <span className="text-slate-300 dark:text-midnight-700">•</span>
              <span className="text-slate-500 dark:text-slate-400 uppercase">Provider: {backendHealth?.cloud_provider || 'demo'}</span>
              <span className="text-slate-300 dark:text-midnight-700">•</span>
              <span className="flex items-center space-x-1">
                {isConnected ? (
                  <><Wifi className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400 font-medium">API Live</span></>
                ) : (
                  <><WifiOff className="w-3 h-3 text-slate-400" /><span className="text-slate-400">Local Mode</span></>
                )}
              </span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white font-sans">
              AutoHeal Dashboard Preview
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Live telemetry snapshot, automated remediation events, and chaos failure injection.
            </p>
          </div>

          {/* Quick Scenario Runner Bar */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => !isBusy && setSelectorOpen(!selectorOpen)}
                disabled={isBusy}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-900 text-xs font-mono text-slate-800 dark:text-slate-200 hover:border-healblue-400 transition-colors shadow-sm disabled:opacity-50"
              >
                <span>{selectedScenario.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {selectorOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-xl shadow-xl z-30 p-1.5">
                  <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase">Choose Failure Vector</div>
                  {SCENARIOS.map(sc => {
                    const Icon = sc.icon;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => {
                          setActiveScenarioId(sc.id);
                          setSelectorOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-start space-x-2.5 transition-colors ${
                          sc.id === activeScenarioId
                            ? 'bg-healblue-50 dark:bg-midnight-800 text-healblue-700 dark:text-healblue-300 font-medium'
                            : 'hover:bg-slate-50 dark:hover:bg-midnight-850 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 mt-0.5 text-healblue-500 shrink-0" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{sc.name}</div>
                          <div className="text-[10px] text-slate-400">{sc.description}</div>
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
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
                isBusy
                  ? 'bg-healblue-50 dark:bg-midnight-900 border-healblue-300 dark:border-healblue-700 text-healblue-600 dark:text-healblue-300 animate-pulse'
                  : 'bg-healblue-600 hover:bg-healblue-500 text-white border-healblue-500 shadow-sm'
              }`}
            >
              {isBusy ? (
                <><Zap className="w-3.5 h-3.5 animate-spin" /><span>Running Loop...</span></>
              ) : (
                <><Play className="w-3.5 h-3.5 fill-current" /><span>Simulate Failure</span></>
              )}
            </button>
          </div>
        </div>

        {/* 4 Interactive Simulation Quick-Launch Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {SCENARIOS.map(sc => {
            const Icon = sc.icon;
            const isSelected = activeScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setActiveScenarioId(sc.id);
                  if (!isBusy) handleTriggerSimulation(sc.id);
                }}
                disabled={isBusy}
                className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between text-xs font-mono group ${
                  isSelected
                    ? 'border-healblue-400 dark:border-healblue-500 bg-healblue-50/50 dark:bg-midnight-850 shadow-sm'
                    : 'border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-900/60 hover:border-healblue-300'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-6 h-6 rounded-md bg-healblue-50 dark:bg-midnight-800 border border-healblue-200 dark:border-healblue-700/60 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-healblue-600 dark:text-healblue-400" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">{sc.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{sc.category}</div>
                  </div>
                </div>
                <Play className="w-3 h-3 text-slate-400 group-hover:text-healblue-500 shrink-0 ml-1 fill-current" />
              </button>
            );
          })}
        </div>

        {/* Dynamic Simulation State Banner */}
        {simState !== 'idle' && (
          <div className={`mb-4 p-3 rounded-lg border flex items-center justify-between font-mono text-xs transition-all ${
            simState === 'triggering' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200' :
            simState === 'detected' ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200' :
            simState === 'recovering' ? 'bg-healblue-50 dark:bg-midnight-900 border-healblue-300 dark:border-healblue-600 text-healblue-900 dark:text-healblue-200' :
            simState === 'resolved' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200' :
            'bg-slate-50 dark:bg-midnight-900 border-slate-200 dark:border-midnight-800 text-slate-800 dark:text-slate-200'
          }`}>
            <div className="flex items-center space-x-2.5">
              <span className={`w-2 h-2 rounded-full ${
                simState === 'resolved' ? 'bg-emerald-500' : 'bg-healblue-500 animate-ping'
              }`}></span>
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                [{simState.toUpperCase()}]
              </span>
              <span>{simMessage}</span>
            </div>
            {activeSimIncidentId && (
              <span className="text-[11px] font-mono text-slate-400">ID: {activeSimIncidentId}</span>
            )}
          </div>
        )}

        {/* Metrics cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="p-3 rounded-lg bg-white dark:bg-midnight-900/80 border border-slate-200 dark:border-midnight-800 hover:border-healblue-300 transition-colors flex flex-col justify-between shadow-sm dark:shadow-none">
              <div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block truncate mb-0.5">{metric.label}</span>
                <div className="text-base font-semibold text-slate-900 dark:text-white font-mono tracking-tight">{metric.value}</div>
              </div>
              <div className="text-[9px] text-healblue-600 dark:text-healblue-300 truncate mt-1 font-mono">{metric.subtext}</div>
            </div>
          ))}
        </div>

        {/* Main table panel */}
        <div className="rounded-xl border border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-900/90 shadow-md dark:shadow-xl overflow-hidden">

          {/* Tab bar */}
          <div className="px-6 py-3.5 border-b border-slate-200 dark:border-midnight-800 bg-slate-50 dark:bg-midnight-950/70 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              {(['timeline', 'services'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                    activeTab === tab
                      ? 'bg-white dark:bg-midnight-850 text-slate-900 dark:text-white border border-healblue-300 dark:border-healblue-700/80 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'timeline' ? `Recent Failure Timeline (${incidents.length})` : `Active Services (${services.length})`}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-healblue-500"></span>
                <span className="text-slate-700 dark:text-slate-300">AutoHeal Engine: Active</span>
              </span>
              <span className="hidden sm:flex items-center space-x-1">
                <Filter className="w-3 h-3 text-healblue-500" />
                <span>Scope: All Namespaces</span>
              </span>
            </div>
          </div>

          {/* Timeline tab */}
          {activeTab === 'timeline' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-midnight-800 text-slate-400 pb-3">
                      <th className="pb-3 font-normal">INCIDENT ID</th>
                      <th className="pb-3 font-normal">TARGET SERVICE</th>
                      <th className="pb-3 font-normal">FAILURE CLASSIFICATION</th>
                      <th className="pb-3 font-normal">RECOVERY ACTION</th>
                      <th className="pb-3 font-normal">MTTR</th>
                      <th className="pb-3 font-normal">STATUS</th>
                      <th className="pb-3 font-normal text-right">TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-midnight-800/80">
                    {incidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-midnight-850/50 transition-colors">
                        <td className="py-3.5 text-healblue-600 dark:text-healblue-300 font-medium">{inc.id}</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-midnight-800 text-slate-700 dark:text-slate-200">{inc.service}</span>
                        </td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-300">{inc.type}</td>
                        <td className="py-3.5 text-healblue-700 dark:text-healblue-200">
                          <span className="flex items-center space-x-1.5">
                            <RotateCcw className="w-3 h-3 text-healblue-500 shrink-0" />
                            <span>{inc.action}</span>
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-700 dark:text-slate-300 font-semibold">{inc.duration}</td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] ${
                            inc.status === 'recovered' ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' :
                            inc.status === 'recovering' ? 'bg-healblue-50 dark:bg-midnight-950 border border-healblue-200 dark:border-healblue-800 text-healblue-700 dark:text-healblue-200 animate-pulse' :
                            inc.status === 'detected' ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300' :
                            'bg-slate-100 dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                            {inc.status === 'escalated' ? 'Escalated Safe' : inc.status === 'recovering' ? 'Recovering...' : inc.status === 'detected' ? 'Detected' : 'Self-Healed'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right text-slate-400">{inc.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Audit trail */}
              <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-midnight-950/80 border border-slate-200 dark:border-midnight-800">
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
                    <Terminal className="w-3.5 h-3.5 text-healblue-500 dark:text-healblue-400" />
                    <span>Audit Trail Detail: {incidents[0]?.id || 'Active'}</span>
                  </span>
                  <span className="text-healblue-600 dark:text-healblue-300">Deterministic Closed Loop</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                  {[
                    { step: '01. DETECTED', label: 'Anomaly Detected', sub: incidents[0]?.type || 'Health probe failed' },
                    { step: '02. INITIATED', label: 'Recovery Policy', sub: incidents[0]?.action || 'Deterministic actuator' },
                    { step: '03. EXECUTED', label: 'Remediation Run', sub: `Target: ${incidents[0]?.service || 'Cluster'}` },
                    { step: '04. VERIFIED', label: 'Health Confirmed', sub: 'Synthetic probes passed 200 OK' },
                  ].map(s => (
                    <div key={s.step} className="p-3 rounded-lg bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800">
                      <div className="text-[10px] text-slate-400 mb-1">{s.step}</div>
                      <div className="text-slate-900 dark:text-white font-medium">{s.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Services tab */}
          {activeTab === 'services' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-midnight-800 text-slate-400 pb-3">
                      <th className="pb-3 font-normal">SERVICE NAME</th>
                      <th className="pb-3 font-normal">NAMESPACE</th>
                      <th className="pb-3 font-normal">REPLICAS</th>
                      <th className="pb-3 font-normal">CPU USAGE</th>
                      <th className="pb-3 font-normal">MEM USAGE</th>
                      <th className="pb-3 font-normal">STATUS</th>
                      <th className="pb-3 font-normal text-right">LAST HEALED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-midnight-800/80">
                    {services.map((svc) => (
                      <tr key={svc.name} className="hover:bg-slate-50 dark:hover:bg-midnight-850/50 transition-colors">
                        <td className="py-3.5 text-slate-900 dark:text-white font-medium">
                          <span className="flex items-center space-x-2">
                            <Server className="w-3.5 h-3.5 text-healblue-500 dark:text-healblue-400" />
                            <span>{svc.name}</span>
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-500 dark:text-slate-400">{svc.namespace}</td>
                        <td className="py-3.5 text-healblue-600 dark:text-healblue-300">{svc.replicas}</td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-300">{svc.cpuUsage}</td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-300">{svc.memUsage}</td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] ${
                            svc.status === 'healthy' ? 'bg-healblue-50 dark:bg-midnight-950 border border-healblue-200 dark:border-healblue-800 text-healblue-700 dark:text-healblue-200' :
                            'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 animate-pulse'
                          }`}>
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                            {svc.status === 'healthy' ? 'Healthy' : 'Degraded (Healing)'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right text-slate-400">{svc.lastHealed}</td>
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
