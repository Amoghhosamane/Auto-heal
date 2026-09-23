import React from 'react';
import { ShieldCheck, Terminal, Cpu } from 'lucide-react';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onViewDashboard: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection, onViewDashboard }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-950 py-16 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-200 dark:border-midnight-800">

          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-healblue-50 dark:bg-midnight-900 border border-healblue-200 dark:border-healblue-800/80 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-healblue-600 dark:text-healblue-400" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white tracking-tight">AutoHeal Cloud</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Self-Healing Cloud Application for Automated Failure Detection and Recovery. Built for high-availability enterprise Kubernetes and microservice workloads.
            </p>
            <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-healblue-500"></span>
              <span>All Systems Operational · Kubernetes v1.28+</span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Architecture</div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {[
                { label: 'Telemetry & 6-Step Loop', id: 'solution' },
                { label: 'Actuation Policies', id: 'recovery-actions' },
                { label: 'Prometheus & Actuators', id: 'architecture' },
                { label: 'Simulated Chaos Scenarios', id: 'scenarios' },
              ].map(link => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigateSection(link.id)}
                    className="hover:text-healblue-600 dark:hover:text-healblue-300 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Console & Operations</div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li>
                <button
                  onClick={onViewDashboard}
                  className="hover:text-healblue-600 dark:hover:text-healblue-300 transition-colors flex items-center space-x-1.5"
                >
                  <Terminal className="w-3.5 h-3.5 text-healblue-500 dark:text-healblue-400" />
                  <span>Interactive Cluster Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('benefits')}
                  className="hover:text-healblue-600 dark:hover:text-healblue-300 transition-colors flex items-center space-x-1.5"
                >
                  <Cpu className="w-3.5 h-3.5 text-healblue-500 dark:text-healblue-400" />
                  <span>SLO & MTTR Reduction Benchmarks</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-4">
          <div>2026 AutoHeal Cloud. Self-Healing Cloud Application.</div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Deterministic Reliability</span>
            <span>·</span>
            <span>Autonomous SRE</span>
            <span>·</span>
            <span>Zero-Downtime</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
