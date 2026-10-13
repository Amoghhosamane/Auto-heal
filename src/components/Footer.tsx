import React from 'react';
import { ShieldCheck, Terminal, Activity } from 'lucide-react';

interface FooterProps {
  onScrollToSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToSection }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-950 py-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-midnight-800">

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-healblue-50 dark:bg-midnight-900 border border-healblue-200 dark:border-healblue-800/80 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-healblue-600 dark:text-healblue-400" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white tracking-tight text-sm">AutoHeal Cloud</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Autonomous Resilience Engine · Kubernetes Multi-Cloud SRE</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-500 dark:text-slate-400">
            <button
              onClick={() => onScrollToSection ? onScrollToSection('dashboard') : window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-healblue-600 dark:hover:text-healblue-300 transition-colors flex items-center space-x-1"
            >
              <Terminal className="w-3.5 h-3.5 text-healblue-500" />
              <span>Console</span>
            </button>
            <button
              onClick={() => onScrollToSection ? onScrollToSection('sim-controls') : document.getElementById('sim-controls')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-healblue-600 dark:hover:text-healblue-300 transition-colors flex items-center space-x-1"
            >
              <Activity className="w-3.5 h-3.5 text-healblue-500" />
              <span>Simulations</span>
            </button>
            <span>·</span>
            <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-3">
          <div>2026 AutoHeal Cloud. Cloud-Agnostic Self-Healing Platform.</div>
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

