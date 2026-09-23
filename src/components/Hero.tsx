import React from 'react';
import { ArrowRight, Activity, Terminal, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface HeroProps {
  onViewDashboard: () => void;
  onSeeHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onViewDashboard, onSeeHowItWorks }) => {
  return (
    <section className="relative pt-20 pb-24 overflow-hidden border-b border-midnight-800 bg-grid-pattern">
      
      {/* Subtle blue glow accent strictly using dark blue / healblue */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[340px] bg-healblue-600/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Subtle Category Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-midnight-900 border border-healblue-800/80 text-healblue-200 text-xs font-mono tracking-wide mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-healblue-400"></span>
          <span>Self-Healing Cloud Application</span>
          <span className="text-healblue-700">|</span>
          <span className="text-slate-400">Automated Failure Detection & Recovery</span>
        </div>

        {/* Project Name and Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6 font-sans">
          AutoHeal <span className="text-healblue-400 font-normal">Cloud</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl font-medium text-healblue-100 max-w-2xl mx-auto mb-4 tracking-tight">
          Self-Healing Cloud Application for Automated Failure Detection and Recovery
        </p>

        {/* 2-3 line concise explanation */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          An autonomous infrastructure control loop that monitors microservices, detects anomalies in sub-seconds, and executes instant deterministic self-healing before downtime impacts customers.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16">
          <button
            onClick={onViewDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-healblue-600 hover:bg-healblue-500 text-white font-medium text-sm transition-all shadow-md shadow-healblue-950"
          >
            <Activity className="w-4 h-4" />
            <span>View Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          
          <button
            onClick={onSeeHowItWorks}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-midnight-900 hover:bg-midnight-850 border border-healblue-800/80 text-slate-200 font-medium text-sm transition-all"
          >
            <span>See How It Works</span>
          </button>
        </div>

        {/* Interactive Self-Healing Loop Visual Preview */}
        <div className="max-w-4xl mx-auto rounded-xl border border-midnight-800 bg-midnight-900/90 shadow-2xl overflow-hidden text-left">
          
          {/* Terminal / telemetry bar */}
          <div className="px-4 py-3 border-b border-midnight-800 bg-midnight-950/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-midnight-700"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-midnight-700"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-midnight-700"></span>
              <span className="text-xs font-mono text-slate-400 ml-2">autoheal-daemon.k8s.internal</span>
            </div>
            <div className="flex items-center space-x-2 font-mono text-xs text-healblue-300">
              <Terminal className="w-3.5 h-3.5" />
              <span>Telemetry Engine Live</span>
            </div>
          </div>

          {/* Telemetry Loop Walkthrough Snippet */}
          <div className="p-5 font-mono text-xs sm:text-sm space-y-3 bg-midnight-900/70">
            <div className="flex items-start space-x-3 text-slate-400">
              <span className="text-healblue-400 select-none">09:14:02.108</span>
              <span className="text-healblue-300 flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 mr-1 text-healblue-400" />
                [DETECT]
              </span>
              <span className="text-slate-300">
                CrashLoop detected in <span className="text-white underline decoration-healblue-700">payment-svc-78bd4f</span> (ExitCode 137 OOM)
              </span>
            </div>

            <div className="flex items-start space-x-3 text-slate-400">
              <span className="text-healblue-400 select-none">09:14:02.450</span>
              <span className="text-healblue-300 flex items-center">
                <Cpu className="w-3.5 h-3.5 mr-1 text-healblue-400" />
                [DECIDE]
              </span>
              <span className="text-slate-300">
                Remediation Policy: <span className="text-healblue-200">POD_EVICT_AND_SPAWN_NEW</span> (Circuit breaker nominal 0/3)
              </span>
            </div>

            <div className="flex items-start space-x-3 text-slate-400">
              <span className="text-healblue-400 select-none">09:14:03.920</span>
              <span className="text-healblue-300 flex items-center">
                <Activity className="w-3.5 h-3.5 mr-1 text-healblue-400" />
                [RECOVER]
              </span>
              <span className="text-slate-300">
                Actuator scheduled clean pod <span className="text-white">payment-svc-91bc2a</span> on node-worker-04
              </span>
            </div>

            <div className="flex items-start space-x-3 text-slate-400">
              <span className="text-healblue-400 select-none">09:14:04.620</span>
              <span className="text-healblue-200 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-healblue-300" />
                [VERIFY]
              </span>
              <span className="text-white font-medium">
                Healthcheck 200 OK. Restored in <span className="text-healblue-300 bg-midnight-950 px-1.5 py-0.5 rounded border border-healblue-900">2.512s</span>. Zero 502 errors observed.
              </span>
            </div>
          </div>

          {/* Quick Stats Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-midnight-800 bg-midnight-950/60 divide-y sm:divide-y-0 sm:divide-x divide-midnight-800 text-center py-3">
            <div>
              <div className="text-base sm:text-lg font-semibold text-white font-mono">1.4s</div>
              <div className="text-[11px] text-slate-400">Mean Time to Detect (MTTD)</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-semibold text-white font-mono">3.8s</div>
              <div className="text-[11px] text-slate-400">Mean Time to Recover (MTTR)</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-semibold text-white font-mono">100%</div>
              <div className="text-[11px] text-slate-400">Automated Resolution Rate</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-semibold text-white font-mono">0 hrs</div>
              <div className="text-[11px] text-slate-400">Manual On-Call Triage</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
