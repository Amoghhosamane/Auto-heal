import React, { useState } from 'react';
import { SYSTEM_METRICS, INITIAL_INCIDENTS, CLUSTER_SERVICES } from '../data/mockData';
import type { IncidentEvent } from '../types';
import {
  Server,
  RotateCcw,
  Play,
  CheckCircle2,
  Terminal,
  Zap,
  Filter
} from 'lucide-react';

interface DashboardPreviewProps {
  isStandalone?: boolean;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ isStandalone = false }) => {
  const [incidents, setIncidents] = useState<IncidentEvent[]>(INITIAL_INCIDENTS);
  const [activeTab, setActiveTab] = useState<'timeline' | 'services'>('timeline');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<string | null>(null);

  const handleSimulateCrash = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    const newId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    setSimulationStep('Simulating: Backend Pod crash detected in payment-gateway-svc...');
    setTimeout(() => setSimulationStep('AutoHeal: Recovery action initiated (Pod replace & traffic shift)...'), 1000);
    setTimeout(() => setSimulationStep('Kubernetes Actuator: Pod replaced on node-worker-02...'), 2000);
    setTimeout(() => {
      setSimulationStep('Synthetic Probe: Health verification passed (200 OK, latency 32ms)');
      setIncidents(prev => [{
        id: newId,
        timestamp: 'Just now (Simulated)',
        service: 'payment-gateway-svc',
        type: 'Pod Crash Detected (OOMKilled)',
        status: 'recovered',
        action: 'Restart & Replace Pod',
        duration: '2.4s',
        details: 'Simulated failure: Autonomous actuator replaced pod and passed synthetic verification.'
      }, ...prev]);
      setIsSimulating(false);
      setSimulationStep(null);
    }, 3200);
  };

  return (
    <section id="dashboard" className={`border-b border-slate-200 dark:border-midnight-800 bg-slate-50 dark:bg-midnight-950 transition-colors duration-200 ${isStandalone ? 'pt-8 pb-20 min-h-screen' : 'py-24'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-healblue-600 dark:text-healblue-400 uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-healblue-500 animate-pulse"></span>
              <span>Production Cluster Monitor</span>
              <span className="text-slate-300 dark:text-midnight-700">•</span>
              <span className="text-slate-500 dark:text-slate-400">Region: us-east-1</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white font-sans">
              AutoHeal Dashboard Preview
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Live telemetry snapshot, automated remediation events, and cluster health metrics.
            </p>
          </div>
          <button
            onClick={handleSimulateCrash}
            disabled={isSimulating}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all border ${
              isSimulating
                ? 'bg-healblue-50 dark:bg-midnight-900 border-healblue-300 dark:border-healblue-700 text-healblue-600 dark:text-healblue-300 animate-pulse'
                : 'bg-healblue-600 hover:bg-healblue-500 text-white border-healblue-500 shadow-md shadow-healblue-200 dark:shadow-healblue-950'
            }`}
          >
            {isSimulating ? (
              <><Zap className="w-3.5 h-3.5 animate-spin" /><span>Healing in Progress...</span></>
            ) : (
              <><Play className="w-3.5 h-3.5 fill-current" /><span>Simulate Failure Recovery</span></>
            )}
          </button>
        </div>

        {/* Simulation banner */}
        {simulationStep && (
          <div className="mb-6 p-3.5 rounded-lg bg-healblue-50 dark:bg-midnight-900 border border-healblue-300 dark:border-healblue-600/80 flex items-center justify-between font-mono text-xs text-healblue-800 dark:text-healblue-200">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-healblue-500 animate-ping"></span>
              <span className="font-semibold text-healblue-900 dark:text-white">Self-Healing Loop:</span>
              <span>{simulationStep}</span>
            </div>
            <span className="text-[11px] text-slate-400">Live Simulation</span>
          </div>
        )}

        {/* Metrics cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {SYSTEM_METRICS.map((metric) => (
            <div key={metric.label} className="p-4 rounded-xl bg-white dark:bg-midnight-900/80 border border-slate-200 dark:border-midnight-800 hover:border-healblue-300 dark:hover:border-healblue-800 transition-colors flex flex-col justify-between shadow-sm dark:shadow-none">
              <div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate mb-1">{metric.label}</span>
                <div className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white font-mono tracking-tight">{metric.value}</div>
              </div>
              <div className="text-[10px] text-healblue-600 dark:text-healblue-300 truncate mt-2 font-mono">{metric.subtext}</div>
            </div>
          ))}
        </div>

        {/* Main table panel */}
        <div className="rounded-xl border border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-900/90 shadow-lg dark:shadow-2xl overflow-hidden">

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
                  {tab === 'timeline' ? `Recent Failure Timeline (${incidents.length})` : `Active Services (${CLUSTER_SERVICES.length})`}
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-healblue-50 dark:bg-midnight-950 border border-healblue-200 dark:border-healblue-800 text-healblue-700 dark:text-healblue-200">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-healblue-500 dark:text-healblue-400" />
                            {inc.status === 'escalated' ? 'Escalated Safe' : 'Self-Healed'}
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
                    <span>Audit Trail Detail: {incidents[0].id}</span>
                  </span>
                  <span className="text-healblue-600 dark:text-healblue-300">Deterministic Closed Loop</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                  {[
                    { step: '01. DETECTED', label: 'Backend Pod Crash', sub: 'Health probe 0/1 failed in 480ms' },
                    { step: '02. INITIATED', label: 'Recovery Action', sub: 'Policy: POD_RESTART_REPLACE' },
                    { step: '03. EXECUTED', label: 'Pod Replaced', sub: 'Spawned clean replica on worker-04' },
                    { step: '04. VERIFIED', label: 'Health Check Passed', sub: 'All synthetic tests 200 OK' },
                  ].map(s => (
                    <div key={s.step} className="p-3 rounded-lg bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800">
                      <div className="text-[10px] text-slate-400 mb-1">{s.step}</div>
                      <div className="text-slate-900 dark:text-white font-medium">{s.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{s.sub}</div>
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
                    {CLUSTER_SERVICES.map((svc) => (
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-healblue-50 dark:bg-midnight-950 border border-healblue-200 dark:border-healblue-800 text-healblue-700 dark:text-healblue-200">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-healblue-500 dark:text-healblue-400" />
                            Healthy
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
