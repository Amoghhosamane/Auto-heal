import React from 'react';
import { ShieldCheck, Radio } from 'lucide-react';

interface NavbarProps {
  onScrollToSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onScrollToSection
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/90 bg-white/90 dark:bg-midnight-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

        {/* Brand & Workspace Context */}
        <div className="flex items-center space-x-3">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-md bg-blue-600 dark:bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white font-sans">
                AutoHeal
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 font-medium">
                Cloud
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-sans">production</span>
            <span>/</span>
            <span className="font-mono text-[11px]">us-east-1</span>
          </div>
        </div>

        {/* Nav Links - Enterprise Linear Style */}
        <nav className="hidden md:flex items-center space-x-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          {[
            { label: 'Overview', id: 'dashboard' },
            { label: 'Simulations', id: 'sim-controls' },
            { label: 'Telemetry', id: 'telemetry-metrics' },
            { label: 'Incidents', id: 'incident-timeline' },
          ].map(link => (
            <button
              key={link.id}
              onClick={() => {
                if (onScrollToSection) {
                  onScrollToSection(link.id);
                } else {
                  document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-3 py-1.5 rounded-md hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors font-sans text-xs"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Cluster Status Pill */}
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-sans text-xs font-medium text-slate-700 dark:text-slate-300">99.98% SLO</span>
          </div>

          {/* SRE Loop Status */}
          <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-medium font-sans">
            <Radio className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Autonomous Engine Active</span>
          </div>
        </div>

      </div>
    </header>
  );
};


