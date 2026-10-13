import React, { useState } from 'react';
import { SOLUTION_STEPS } from '../data/mockData';
import { Eye, ShieldAlert, Cpu, GitFork, RotateCcw, CheckCircle2, ChevronRight } from 'lucide-react';

const STEP_ICONS = [Eye, ShieldAlert, Cpu, GitFork, RotateCcw, CheckCircle2];

export const SolutionSection: React.FC = () => {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const activeStep = SOLUTION_STEPS[selectedStepIndex];
  const StepIcon = STEP_ICONS[selectedStepIndex];

  return (
    <section id="solution" className="py-14 border-b border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-900/40 transition-colors duration-200 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-xl mb-10">
          <div className="text-xs font-mono text-healblue-600 dark:text-healblue-400 uppercase tracking-wider mb-1.5">
            How It Works
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
            Deterministic 6-stage self-healing loop.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Replaces static runbooks with a continuous, closed-loop control system that monitors and remedies anomalies in seconds.
          </p>
        </div>

        {/* Step selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {SOLUTION_STEPS.map((step, idx) => {
            const Icon = STEP_ICONS[idx];
            const isSelected = idx === selectedStepIndex;
            return (
              <button
                key={step.step}
                onClick={() => setSelectedStepIndex(idx)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-healblue-50 dark:bg-midnight-850 border-healblue-400 dark:border-healblue-500 shadow-sm ring-1 ring-healblue-300 dark:ring-healblue-500/30'
                    : 'bg-white dark:bg-midnight-950/60 border-slate-200 dark:border-midnight-800 hover:border-healblue-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-healblue-600 dark:text-healblue-300 font-bold' : 'text-slate-400'}`}>
                    {step.step}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-healblue-600 dark:text-healblue-400' : 'text-slate-400'}`} />
                </div>
                <div className={`text-xs font-semibold truncate ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  {step.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Step detail panel */}
        <div className="rounded-xl border border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-900/90 p-6 shadow-md dark:shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-midnight-800 gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-healblue-50 dark:bg-midnight-800 border border-healblue-200 dark:border-healblue-700/50 flex items-center justify-center shrink-0">
                <StepIcon className="w-4 h-4 text-healblue-600 dark:text-healblue-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-healblue-600 dark:text-healblue-400 tracking-wider">STAGE {activeStep.step}</span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">{activeStep.name} — {activeStep.summary}</h3>
              </div>
            </div>
            <span className="text-xs font-mono text-healblue-600 dark:text-healblue-300 bg-healblue-50 dark:bg-midnight-950 px-2.5 py-1 rounded border border-healblue-200 dark:border-midnight-800 shrink-0">
              Latency: &lt;500ms
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            {activeStep.description}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase mr-1">Signals:</span>
            {activeStep.signals.map((sig, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-midnight-950 border border-slate-200 dark:border-midnight-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 flex items-center space-x-1">
                <ChevronRight className="w-3 h-3 text-healblue-500 shrink-0" />
                <span>{sig}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
