import React from 'react';
import { Layers, Server, Activity, Cpu, ArrowDown, ChevronRight, CheckCircle2 } from 'lucide-react';

export const ArchitectureSection: React.FC = () => {
  const architectureNodes = [
    {
      step: '01',
      title: 'Application Workloads',
      subtitle: 'Target Cluster Workloads',
      icon: Server,
      items: ['Frontend Client Web & Mobile', 'Microservices (Node, Go, Python)', 'Distributed Databases & Redis'],
      tag: 'Workload Plane'
    },
    {
      step: '02',
      title: 'Prometheus Metrics Collector',
      subtitle: 'Continuous Telemetry Ingestion',
      icon: Activity,
      items: ['Scrapes /metrics at 500ms intervals', 'cgroup CPU & memory stats', 'Kubelet container health probes'],
      tag: 'Observability Plane'
    },
    {
      step: '03',
      title: 'Failure Detector & Classifier',
      subtitle: 'Anomaly Recognition & Root Cause',
      icon: Layers,
      items: ['Statistical threshold baseline engine', 'CrashLoopBackOff & OOM detector', 'Canary regression classifier'],
      tag: 'Detection Plane'
    },
    {
      step: '04',
      title: 'Recovery Decision Engine',
      subtitle: 'Deterministic Policy Selection',
      icon: Cpu,
      items: ['Rule-based remediation policy selector', 'Anti-flapping circuit breaker', 'Minimal-blast-radius solver'],
      tag: 'Decision Plane'
    },
    {
      step: '05',
      title: 'Kubernetes Actuators & Dispatch',
      subtitle: 'Zero-Downtime Autonomous Remediation',
      icon: CheckCircle2,
      items: ['Restart / Replace failing pod', 'HPA Horizontal scaling', 'Rollback deployment & Reroute mesh'],
      tag: 'Actuation Plane'
    }
  ];

  return (
    <section id="architecture" className="py-24 border-b border-midnight-800 bg-midnight-900/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono text-healblue-400 uppercase tracking-wider mb-2">
            System Topology
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            End-to-end self-healing architecture.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            AutoHeal operates as a lightweight, non-invasive Kubernetes operator that links Prometheus metrics collectors directly with high-confidence remediation actuators.
          </p>
        </div>

        {/* Visual Diagram UI Container */}
        <div className="p-6 sm:p-10 rounded-2xl bg-midnight-950 border border-midnight-800 shadow-2xl relative">
          
          {/* Subtle diagram grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-50 rounded-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col space-y-4">
            {architectureNodes.map((node, index) => {
              const Icon = node.icon;
              const isLast = index === architectureNodes.length - 1;

              return (
                <React.Fragment key={node.step}>
                  <div className="p-5 sm:p-6 rounded-xl bg-midnight-900/90 border border-midnight-800 hover:border-healblue-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left node identity */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-midnight-850 border border-healblue-800/80 flex items-center justify-center text-healblue-400 shrink-0">
                        <Icon className="w-6 h-6 text-healblue-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-healblue-400 font-semibold">{node.step}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-midnight-850 border border-midnight-750 text-slate-400 uppercase">
                            {node.tag}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-white tracking-tight mt-0.5">
                          {node.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {node.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right items list */}
                    <div className="flex flex-wrap gap-2 md:max-w-md lg:max-w-lg justify-start md:justify-end">
                      {node.items.map((item, itemIdx) => (
                        <div 
                          key={itemIdx}
                          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-midnight-950 border border-midnight-800 text-xs font-mono text-slate-300"
                        >
                          <ChevronRight className="w-3 h-3 text-healblue-400" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Flow Connector Arrow */}
                  {!isLast && (
                    <div className="flex items-center justify-center py-1">
                      <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                        <div className="w-px h-6 bg-healblue-800/60 flex items-center justify-center">
                          <ArrowDown className="w-3.5 h-3.5 text-healblue-400 my-auto" />
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Diagram footer note */}
          <div className="mt-8 pt-6 border-t border-midnight-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-healblue-400 animate-pulse"></span>
              <span>Zero external agent overhead • Native Kubernetes API Integration</span>
            </div>
            <div className="text-healblue-300">
              Sub-second End-to-End Latency
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
