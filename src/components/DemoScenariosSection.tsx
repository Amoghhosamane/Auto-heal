import React, { useState } from 'react';
import { DEMO_SCENARIOS } from '../data/mockData';
import { AlertOctagon, CheckCircle2, Clock, Zap } from 'lucide-react';

export const DemoScenariosSection: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState(DEMO_SCENARIOS[0].id);
  const activeScenario = DEMO_SCENARIOS.find(s => s.id === activeScenarioId) || DEMO_SCENARIOS[0];

  return (
    <section id="scenarios" className="py-14 border-b border-slate-200 dark:border-midnight-800 bg-slate-50 dark:bg-midnight-950 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-xl mb-10">
          <div className="text-xs font-mono text-healblue-600 dark:text-healblue-400 uppercase tracking-wider mb-1.5">
            Simulations
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
            Tested against production chaos.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Real-world failure recovery benchmarks across four common outage scenarios.
          </p>
        </div>

        {/* Scenario tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {DEMO_SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === activeScenarioId;
            return (
              <button
                key={scenario.id}
                onClick={() => setActiveScenarioId(scenario.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-healblue-50 dark:bg-midnight-850 border-healblue-400 dark:border-healblue-500 shadow-sm ring-1 ring-healblue-200 dark:ring-healblue-500/30'
                    : 'bg-white dark:bg-midnight-900/60 border-slate-200 dark:border-midnight-800 hover:border-healblue-300'
                }`}
              >
                <div className="text-[10px] font-mono text-healblue-600 dark:text-healblue-400 mb-0.5">SCENARIO</div>
                <h3 className={`text-xs font-semibold tracking-tight truncate mb-1 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  {scenario.title}
                </h3>
                <div className="text-[11px] font-mono text-healblue-700 dark:text-healblue-300 truncate">
                  {scenario.action}
                </div>
              </button>
            );
          })}
        </div>

        {/* Scenario detail */}
        <div className="rounded-xl border border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-900/90 p-6 shadow-md dark:shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-midnight-800 gap-3">
            <div>
              <span className="text-[10px] font-mono text-healblue-600 dark:text-healblue-400 uppercase tracking-wider">Failure Vector</span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">{activeScenario.title}</h3>
            </div>
            <div className="flex items-center space-x-3 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-slate-50 dark:bg-midnight-950 border border-slate-200 dark:border-midnight-800">
                MTTD: <strong className="text-slate-900 dark:text-white">{activeScenario.mttd}</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-healblue-50 dark:bg-midnight-950 border border-healblue-200 dark:border-midnight-800 text-healblue-700 dark:text-healblue-300">
                MTTR: <strong>{activeScenario.mttr}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-midnight-950/70 border border-slate-200 dark:border-midnight-800 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 font-mono mb-1">
                <AlertOctagon className="w-3.5 h-3.5 text-healblue-500" />
                <span>Trigger</span>
              </div>
              <p className="text-slate-700 dark:text-slate-200">{activeScenario.trigger}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-midnight-950/70 border border-slate-200 dark:border-midnight-800 text-xs">
              <div className="flex items-center space-x-1.5 text-healblue-600 dark:text-healblue-300 font-mono mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Action Path</span>
              </div>
              <p className="text-slate-700 dark:text-slate-200">{activeScenario.flowDescription}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-midnight-800 gap-2">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Manual SRE triage: ~35–45m</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>AutoHeal MTTR: {activeScenario.mttr} (99% faster)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
