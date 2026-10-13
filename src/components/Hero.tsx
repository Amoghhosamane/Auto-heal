import React from 'react';
import { ArrowRight, Activity, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface HeroProps {
  onViewDashboard: () => void;
  onSeeHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onViewDashboard, onSeeHowItWorks }) => {
  return (
    <section className="relative pt-12 pb-16 overflow-hidden border-b border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-950 bg-grid-pattern transition-colors duration-200">

      {/* Subtle glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-healblue-200/30 dark:bg-healblue-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

        {/* Category Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-healblue-50 dark:bg-midnight-900 border border-healblue-200 dark:border-healblue-800/80 text-healblue-700 dark:text-healblue-200 text-xs font-mono tracking-wide mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-healblue-500"></span>
          <span>Self-Healing Cloud Application</span>
          <span className="text-healblue-300 dark:text-healblue-700">|</span>
          <span className="text-slate-500 dark:text-slate-400">Automated Failure Recovery</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight mb-4 font-sans">
          Autonomous failure recovery for <span className="text-healblue-600 dark:text-healblue-400">cloud apps</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
          Monitors microservices, detects anomalies in sub-seconds, and executes instant self-healing before downtime impacts users.
        </p>

        {/* CTAs */}
        <div className="flex flex-row items-center justify-center gap-3 mb-10">
          <button
            onClick={onViewDashboard}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-healblue-600 hover:bg-healblue-500 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-healblue-200 dark:shadow-healblue-950"
          >
            <Activity className="w-4 h-4" />
            <span>Live Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          <button
            onClick={onSeeHowItWorks}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-slate-100 dark:bg-midnight-900 hover:bg-slate-200 dark:hover:bg-midnight-850 border border-slate-200 dark:border-healblue-800/80 text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm transition-all"
          >
            <span>How It Works</span>
          </button>
        </div>

        {/* Terminal preview card */}
        <div className="max-w-3xl mx-auto rounded-xl border border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-900/90 shadow-lg dark:shadow-2xl overflow-hidden text-left">

          {/* Top bar */}
          <div className="px-4 py-2.5 border-b border-slate-200 dark:border-midnight-800 bg-slate-50 dark:bg-midnight-950/80 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-midnight-700"></span>
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-midnight-700"></span>
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-midnight-700"></span>
              <span className="font-mono text-slate-500 dark:text-slate-400 ml-1.5 text-[11px]">autoheal-daemon.k8s</span>
            </div>
            <span className="font-mono text-[11px] text-healblue-600 dark:text-healblue-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-healblue-500 animate-pulse"></span>
              Telemetry Live
            </span>
          </div>

          {/* Telemetry snippet */}
          <div className="p-4 font-mono text-xs space-y-2 bg-slate-50 dark:bg-midnight-900/70">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <span className="text-healblue-600 dark:text-healblue-400 select-none text-[11px]">09:14:02</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center shrink-0">
                <ShieldAlert className="w-3 h-3 mr-1" />
                [DETECT]
              </span>
              <span className="truncate">OOM crash in <span className="text-slate-900 dark:text-white font-semibold">payment-svc</span></span>
            </div>

            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <span className="text-healblue-600 dark:text-healblue-400 select-none text-[11px]">09:14:03</span>
              <span className="text-healblue-700 dark:text-healblue-300 font-medium flex items-center shrink-0">
                <Cpu className="w-3 h-3 mr-1 text-healblue-600 dark:text-healblue-400" />
                [RECOVER]
              </span>
              <span className="truncate">Actuator replaced container on worker-04</span>
            </div>

            <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
              <span className="text-healblue-600 dark:text-healblue-400 select-none text-[11px]">09:14:04</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center shrink-0">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                [VERIFY]
              </span>
              <span className="truncate font-medium">Restored in <span className="text-healblue-600 dark:text-healblue-300 font-bold">2.5s</span>. Zero 502 errors.</span>
            </div>
          </div>

          {/* Metrics ticker */}
          <div className="grid grid-cols-4 border-t border-slate-200 dark:border-midnight-800 bg-slate-50 dark:bg-midnight-950/60 divide-x divide-slate-200 dark:divide-midnight-800 text-center py-2.5">
            {[
              { val: '1.4s', lbl: 'MTTD' },
              { val: '3.8s', lbl: 'MTTR' },
              { val: '100%', lbl: 'Auto-Resolved' },
              { val: '0m', lbl: 'Manual Triage' },
            ].map(m => (
              <div key={m.lbl} className="px-2">
                <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white font-mono">{m.val}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{m.lbl}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
