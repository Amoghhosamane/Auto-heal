import React from 'react';
import { ShieldCheck, Activity, Terminal } from 'lucide-react';

interface NavbarProps {
  activeView: 'landing' | 'dashboard';
  setActiveView: (view: 'landing' | 'dashboard') => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, onNavigateSection }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-midnight-800 bg-midnight-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => { setActiveView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-midnight-900 border border-healblue-700/60 flex items-center justify-center text-healblue-400 group-hover:border-healblue-500 transition-colors">
            <ShieldCheck className="w-5 h-5 text-healblue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-base tracking-tight text-white font-sans">AutoHeal</span>
              <span className="text-xs uppercase tracking-wider px-1.5 py-0.5 rounded bg-midnight-850 border border-healblue-800/80 text-healblue-300 font-mono">Cloud</span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">Autonomous Resilience Engine</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm text-slate-300">
          <button 
            onClick={() => { setActiveView('landing'); onNavigateSection('problem'); }}
            className="px-3 py-1.5 rounded-md hover:text-white hover:bg-midnight-850 transition-colors"
          >
            Problem
          </button>
          <button 
            onClick={() => { setActiveView('landing'); onNavigateSection('solution'); }}
            className="px-3 py-1.5 rounded-md hover:text-white hover:bg-midnight-850 transition-colors"
          >
            How It Works
          </button>
          <button 
            onClick={() => { setActiveView('landing'); onNavigateSection('recovery-actions'); }}
            className="px-3 py-1.5 rounded-md hover:text-white hover:bg-midnight-850 transition-colors"
          >
            Recovery Actions
          </button>
          <button 
            onClick={() => { setActiveView('landing'); onNavigateSection('architecture'); }}
            className="px-3 py-1.5 rounded-md hover:text-white hover:bg-midnight-850 transition-colors"
          >
            Architecture
          </button>
          <button 
            onClick={() => { setActiveView('landing'); onNavigateSection('scenarios'); }}
            className="px-3 py-1.5 rounded-md hover:text-white hover:bg-midnight-850 transition-colors"
          >
            Scenarios
          </button>
          <button 
            onClick={() => { setActiveView('landing'); onNavigateSection('benefits'); }}
            className="px-3 py-1.5 rounded-md hover:text-white hover:bg-midnight-850 transition-colors"
          >
            Benefits
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center space-x-3">
          {/* Live Heartbeat status pill */}
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-midnight-900 border border-healblue-900/80 text-xs text-healblue-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-healblue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-healblue-500"></span>
            </span>
            <span className="font-mono text-[11px] tracking-tight text-slate-300">Cluster 99.98% OK</span>
          </div>

          {/* View Mode Toggle Button */}
          {activeView === 'landing' ? (
            <button
              onClick={() => setActiveView('dashboard')}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-healblue-600 hover:bg-healblue-500 text-white text-xs sm:text-sm font-medium transition-all shadow-sm shadow-healblue-900/50"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>View Dashboard</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveView('landing')}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-midnight-850 hover:bg-midnight-800 border border-healblue-800 text-healblue-200 text-xs sm:text-sm font-medium transition-all"
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
