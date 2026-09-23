import React from 'react';
import { Layers, Server, Activity, Cpu, ArrowDown, ChevronRight, CheckCircle2 } from 'lucide-react';

export const ArchitectureSection: React.FC = () => {
  const architectureNodes = [
    {
      step: '01', title: 'Application Workloads', subtitle: 'Target Cluster Workloads', icon: Server,
      items: ['Frontend Client Web & Mobile', 'Microservices (Node, Go, Python)', 'Distributed Databases & Redis'],
      tag: 'Workload Plane'
    },
    {
      step: '02', title: 'Prometheus Metrics Collector', subtitle: 'Continuous Telemetry Ingestion', icon: Activity,
      items: ['Scrapes /metrics at 500ms intervals', 'cgroup CPU & memory stats', 'Kubelet container health probes'],
      tag: 'Observability Plane'
    },
    {
      step: '03', title: 'Failure Detector & Classifier', subtitle: 'Anomaly Recognition & Root Cause', icon: Layers,
      items: ['Statistical threshold baseline engine', 'CrashLoopBackOff & OOM detector', 'Canary regression classifier'],
      tag: 'Detection Plane'
    },
    {
      step: '04', title: 'Recovery Decision Engine', subtitle: 'Deterministic Policy Selection', icon: Cpu,
      items: ['Rule-based remediation policy selector', 'Anti-flapping circuit breaker', 'Minimal-blast-radius solver'],
      tag: 'Decision Plane'
    },
    {
      step: '05', title: 'Kubernetes Actuators & Dispatch', subtitle: 'Zero-Downtime Autonomous Remediation', icon: CheckCircle2,
      items: ['Restart / Replace failing pod', 'HPA Horizontal scaling', 'Rollback deployment & Reroute mesh'],
      tag: 'Actuation Plane'
    }
  ];

  return (
    <section id="architecture" className="py-24 border-b border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-900/30 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono text-healblue-600 dark:text-healblue-400 uppercase tracking-wider mb-2">
            System Topology
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-4">
            End-to-end self-healing architecture.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            AutoHeal operates as a lightweight, non-invasive Kubernetes operator that links Prometheus metrics collectors directly with high-confidence remediation actuators.
          </p>
        </div>

        <div className="p-6 sm:p-10 rounded-2xl bg-slate-50 dark:bg-midnight-950 border border-slate-200 dark:border-midnight-800 shadow-lg dark:shadow-2xl relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-50 rounded-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col space-y-4">
            {architectureNodes.map((node, index) => {
              const Icon = node.icon;
              const isLast = index === architectureNodes.length - 1;
              return (
                <React.Fragment key={node.step}>
                  <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-midnight-900/90 border border-slate-200 dark:border-midnight-800 hover:border-healblue-300 dark:hover:border-healblue-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-none">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-healblue-50 dark:bg-midnight-850 border border-healblue-200 dark:border-healblue-800/80 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-healblue-600 dark:text-healblue-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-healblue-600 dark:text-healblue-400 font-semibold">{node.step}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-midnight-850 border border-slate-200 dark:border-midnight-750 text-slate-500 dark:text-slate-400 uppercase">
                            {node.tag}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white tracking-tight mt-0.5">{node.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{node.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 md:max-w-md lg:max-w-lg justify-start md:justify-end">
                      {node.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-50 dark:bg-midnight-950 border border-slate-200 dark:border-midnight-800 text-xs font-mono text-slate-600 dark:text-slate-300">
                          <ChevronRight className="w-3 h-3 text-healblue-500 dark:text-healblue-400" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!isLast && (
                    <div className="flex items-center justify-center py-1">
                      <ArrowDown className="w-3.5 h-3.5 text-healblue-400 dark:text-healblue-400" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-midnight-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-healblue-500 animate-pulse"></span>
              <span>Zero external agent overhead · Native Kubernetes API Integration</span>
            </div>
            <div className="text-healblue-600 dark:text-healblue-300">Sub-second End-to-End Latency</div>
          </div>
        </div>
      </div>
    </section>
  );
};
