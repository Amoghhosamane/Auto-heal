import React from 'react';
import { Layers, Server, Activity, Cpu, CheckCircle2 } from 'lucide-react';

export const ArchitectureSection: React.FC = () => {
  const architectureNodes = [
    { step: '01', title: 'Workloads', subtitle: 'Target Cluster Workloads', icon: Server, tag: 'Workloads' },
    { step: '02', title: 'Collector', subtitle: 'Prometheus Telemetry', icon: Activity, tag: 'Observability' },
    { step: '03', title: 'Classifier', subtitle: 'Anomaly Recognition', icon: Layers, tag: 'Detection' },
    { step: '04', title: 'Decision', subtitle: 'Policy & Circuit Breaker', icon: Cpu, tag: 'Decision' },
    { step: '05', title: 'Actuators', subtitle: 'K8s Remediation Dispatch', icon: CheckCircle2, tag: 'Actuation' }
  ];

  return (
    <section id="architecture" className="py-14 border-b border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-900/30 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-xl mb-10">
          <div className="text-xs font-mono text-healblue-600 dark:text-healblue-400 uppercase tracking-wider mb-1.5">
            Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
            Non-invasive Kubernetes integration.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Lightweight operator linking metric collectors directly with safe autonomous actuators.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-50 dark:bg-midnight-950 border border-slate-200 dark:border-midnight-800 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {architectureNodes.map((node) => {
              const Icon = node.icon;
              return (
                <div key={node.step} className="p-4 rounded-lg bg-white dark:bg-midnight-900/90 border border-slate-200 dark:border-midnight-800 text-center flex flex-col items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-healblue-50 dark:bg-midnight-850 border border-healblue-200 dark:border-healblue-800/80 flex items-center justify-center mb-2.5">
                    <Icon className="w-4 h-4 text-healblue-600 dark:text-healblue-400" />
                  </div>
                  <div className="text-[10px] font-mono text-healblue-600 dark:text-healblue-400 font-semibold mb-0.5">{node.step} · {node.tag}</div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-0.5">{node.title}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{node.subtitle}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-midnight-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-healblue-500"></span>
              <span>Native Kubernetes Operator</span>
            </span>
            <span className="text-healblue-600 dark:text-healblue-300 font-medium">Sub-second Latency</span>
          </div>
        </div>
      </div>
    </section>
  );
};
