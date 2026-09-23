import React from 'react';
import { ShieldCheck, Activity, Terminal, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  activeView: 'landing' | 'dashboard';
  setActiveView: (view: 'landing' | 'dashboard') => void;
  onNavigateSection: (sectionId: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView, setActiveView, onNavigateSection, isDark, onToggleTheme
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-midnight-800 bg-white/95 dark:bg-midnight-950/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand */}
        <div
          onClick={() => { setActiveView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-midnight-900 border border-healblue-200 dark:border-healblue-700/60 flex items-center justify-center group-hover:border-healblue-500 transition-colors">
            <ShieldCheck className="w-5 h-5 text-healblue-600 dark:text-healblue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white font-sans">AutoHeal</span>
              <span className="text-xs uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-midnight-850 border border-healblue-200 dark:border-healblue-800/80 text-healblue-700 dark:text-healblue-300 font-mono">Cloud</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block tracking-wide">Autonomous Resilience Engine</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm text-slate-600 dark:text-slate-300">
          {[
            { label: 'Problem', id: 'problem' },
            { label: 'How It Works', id: 'solution' },
            { label: 'Recovery', id: 'recovery-actions' },
            { label: 'Architecture', id: 'architecture' },
            { label: 'Scenarios', id: 'scenarios' },
            { label: 'Benefits', id: 'benefits' },
          ].map(link => (
            <button
              key={link.id}
              onClick={() => { setActiveView('landing'); onNavigateSection(link.id); }}
              className="px-3 py-1.5 rounded-md hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-midnight-850 transition-colors text-sm"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">

          {/* Cluster status pill */}
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-midnight-900 border border-healblue-200 dark:border-healblue-900/80 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-healblue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-healblue-500"></span>
            </span>
            <span className="font-mono text-[11px] tracking-tight text-slate-600 dark:text-slate-300">Cluster 99.98% OK</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-midnight-800 bg-slate-100 dark:bg-midnight-900 hover:border-healblue-400 transition-colors"
          >
            {isDark
              ? <Sun className="w-4 h-4 text-healblue-400" />
              : <Moon className="w-4 h-4 text-healblue-600" />
            }
          </button>

          {/* Dashboard / Back CTA */}
          {activeView === 'landing' ? (
            <button
              onClick={() => setActiveView('dashboard')}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-healblue-600 hover:bg-healblue-500 text-white text-xs sm:text-sm font-medium transition-all shadow-sm shadow-healblue-200 dark:shadow-healblue-950"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>View Dashboard</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveView('landing')}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-slate-100 dark:bg-midnight-850 hover:bg-slate-200 dark:hover:bg-midnight-800 border border-slate-200 dark:border-healblue-800 text-slate-700 dark:text-healblue-200 text-xs sm:text-sm font-medium transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
