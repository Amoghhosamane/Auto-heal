import React from 'react';
import { ShieldCheck, Terminal, Activity } from 'lucide-react';

interface FooterProps {
  onScrollToSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToSection }) => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-midnight-950 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">

          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white tracking-tight text-xs font-sans">
                AutoHeal Cloud
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                Autonomous Cloud Resilience Engine · Multi-Cloud Kubernetes
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-sans text-slate-500 dark:text-slate-400">
            <button
              onClick={() => onScrollToSection ? onScrollToSection('dashboard') : window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center space-x-1"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-500" />
              <span>Console</span>
            </button>
            <button
              onClick={() => onScrollToSection ? onScrollToSection('sim-controls') : document.getElementById('sim-controls')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center space-x-1"
            >
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>Simulations</span>
            </button>
            <span>•</span>
            <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>All Systems Operational</span>
            </div>
          </div>

        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-sans gap-2">
          <div>© 2026 AutoHeal Cloud. Cloud-Agnostic Self-Healing Application.</div>
          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400 dark:text-slate-500">
            <span>Deterministic Reliability</span>
            <span>•</span>
            <span>Autonomous SRE</span>
            <span>•</span>
            <span>Zero-Downtime</span>
          </div>
        </div>
      </div>
    </footer>
  );
};


