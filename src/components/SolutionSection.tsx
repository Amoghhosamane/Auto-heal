import React, { useState } from 'react';
import { SOLUTION_STEPS } from '../data/mockData';
import { Eye, ShieldAlert, Cpu, GitFork, RotateCcw, CheckCircle2, ChevronRight, Terminal } from 'lucide-react';

const STEP_ICONS = [Eye, ShieldAlert, Cpu, GitFork, RotateCcw, CheckCircle2];

export const SolutionSection: React.FC = () => {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const activeStep = SOLUTION_STEPS[selectedStepIndex];
  const StepIcon = STEP_ICONS[selectedStepIndex];

  return (
    <section id="solution" className="py-24 border-b border-midnight-800 bg-midnight-900/40 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono text-healblue-400 uppercase tracking-wider mb-2">
            The Autonomous Feedback Loop
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Closed-loop self-healing in six deterministic stages.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            AutoHeal Cloud replaces fragile manual playbooks with a real-time autonomous control loop that continuously verifies cluster state and remedies anomalies in seconds.
          </p>
        </div>

        {/* Visual Step Pipeline Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3 mb-10">
          {SOLUTION_STEPS.map((step, idx) => {
            const Icon = STEP_ICONS[idx];
            const isSelected = idx === selectedStepIndex;
            return (
              <button
                key={step.step}
                onClick={() => setSelectedStepIndex(idx)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-midnight-850 border-healblue-500 shadow-md shadow-healblue-950/60 ring-1 ring-healblue-500/30'
                    : 'bg-midnight-950/60 border-midnight-800 hover:border-healblue-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <span className={`text-[11px] font-mono ${isSelected ? 'text-healblue-300 font-semibold' : 'text-slate-400'}`}>
                    {step.step}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-healblue-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <div className={`text-sm font-medium tracking-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {step.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {step.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Technical Drill-down Panel */}
        <div className="rounded-2xl border border-midnight-800 bg-midnight-900/90 overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-midnight-800">
            
            {/* Left Detail Description */}
            <div className="lg:col-span-7 p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-midnight-800 border border-healblue-700/50 flex items-center justify-center text-healblue-400">
                    <StepIcon className="w-5 h-5 text-healblue-400" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-healblue-400 tracking-wider">STAGE {activeStep.step}</span>
                    <h3 className="text-2xl font-semibold text-white tracking-tight">{activeStep.name}</h3>
                  </div>
                </div>

                <p className="text-base font-medium text-healblue-100 mb-3">
                  {activeStep.summary}
                </p>

                <p className="text-sm text-slate-300 leading-relaxed mb-8">
                  {activeStep.description}
                </p>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                    Telemetry & Actuation Signals
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeStep.signals.map((sig, i) => (
                      <div 
                        key={i} 
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-midnight-950/70 border border-midnight-800 text-xs font-mono text-slate-200"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-healblue-400 shrink-0" />
                        <span className="truncate">{sig}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-midnight-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Deterministic Execution Window</span>
                <span className="text-healblue-300 font-semibold">&lt; 500ms Sub-cycle</span>
              </div>
            </div>

            {/* Right Logic Flow & Payload Simulation */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-midnight-950/70 font-mono text-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-midnight-800 text-slate-400">
                  <span className="flex items-center">
                    <Terminal className="w-3.5 h-3.5 mr-1.5 text-healblue-400" />
                    stage_{activeStep.name.toLowerCase()}_payload.json
                  </span>
                  <span className="text-[10px] text-healblue-400 uppercase">Schema v1.2</span>
                </div>

                {/* Code payload display */}
                <pre className="text-slate-300 overflow-x-auto leading-relaxed p-4 rounded-lg bg-midnight-900 border border-midnight-800">
{`{
  "stage": "${activeStep.name.toUpperCase()}",
  "phase_id": "${activeStep.step}",
  "target_cluster": "k8s-prod-us-east-1",
  "anomaly_window_ms": 1200,
  "telemetry_stream": [
    ${activeStep.signals.slice(0, 3).map(s => `"${s}"`).join(',\n    ')}
  ],
  "verification_policy": "STRICT_SLO",
  "safety_lock": "CIRCUIT_BREAKER_ENABLED"
}`}
                </pre>
              </div>

              <div className="mt-6 pt-4 border-t border-midnight-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Automated Next Transition:</span>
                <span className="text-xs text-healblue-300 font-medium">
                  {selectedStepIndex < SOLUTION_STEPS.length - 1 
                    ? `Proceed to Stage ${SOLUTION_STEPS[selectedStepIndex + 1].step} (${SOLUTION_STEPS[selectedStepIndex + 1].name})`
                    : 'Cycle Complete (Return to Monitor)'}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
