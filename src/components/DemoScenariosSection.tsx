import React, { useState } from 'react';
import { DEMO_SCENARIOS } from '../data/mockData';
import { AlertOctagon, CheckCircle2, Clock, Zap } from 'lucide-react';

export const DemoScenariosSection: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState(DEMO_SCENARIOS[0].id);
  const activeScenario = DEMO_SCENARIOS.find(s => s.id === activeScenarioId) || DEMO_SCENARIOS[0];

  return (
    <section id="scenarios" className="py-24 border-b border-midnight-800 bg-midnight-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono text-healblue-400 uppercase tracking-wider mb-2">
            Real-World Failure Simulations
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Proven failure scenarios. <br />
            <span className="text-slate-400 font-normal">Tested against production chaos.</span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            See how AutoHeal Cloud reacts autonomously across the four most common and disruptive cloud failure scenarios.
          </p>
        </div>

        {/* 4 Scenario Selector Tabs/Rows */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          {DEMO_SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === activeScenarioId;
            return (
              <button
                key={scenario.id}
                onClick={() => setActiveScenarioId(scenario.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-midnight-850 border-healblue-500 shadow-md shadow-healblue-950/60 ring-1 ring-healblue-500/30'
                    : 'bg-midnight-900/60 border-midnight-800 hover:border-healblue-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-[11px] font-mono text-healblue-400 mb-1">
                  SCENARIO
                </div>
                <h3 className={`text-sm font-medium tracking-tight mb-2 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {scenario.title}
                </h3>
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <span>Action:</span>
                  <span className="text-healblue-300 truncate">{scenario.action}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Scenario Deep Dive Card */}
        <div className="rounded-2xl border border-midnight-800 bg-midnight-900/90 overflow-hidden shadow-xl p-7 sm:p-9">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-8 border-b border-midnight-800 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-healblue-400 uppercase tracking-wider mb-1">
                <span>Failure Vector</span>
                <span>•</span>
                <span className="text-slate-400">Autonomous Mitigation</span>
              </div>
              <h3 className="text-2xl font-semibold text-white tracking-tight">
                {activeScenario.title}
              </h3>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center space-x-4 font-mono text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-midnight-950 border border-midnight-800">
                <span className="text-slate-400 block text-[10px]">DETECTION (MTTD)</span>
                <span className="text-white font-semibold text-sm">{activeScenario.mttd}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-midnight-950 border border-midnight-800">
                <span className="text-slate-400 block text-[10px]">RECOVERY (MTTR)</span>
                <span className="text-healblue-300 font-semibold text-sm">{activeScenario.mttr}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-midnight-950 border border-midnight-800">
                <span className="text-slate-400 block text-[10px]">RESULT</span>
                <span className="text-healblue-200 font-semibold text-sm">Autonomous Fix</span>
              </div>
            </div>
          </div>

          {/* Trigger & Flow comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* The Trigger */}
            <div className="p-5 rounded-xl bg-midnight-950/70 border border-midnight-800">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-2">
                <AlertOctagon className="w-4 h-4 text-healblue-400" />
                <span>Trigger Event Condition</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed mb-4">
                {activeScenario.trigger}
              </p>
              <div className="text-xs font-mono text-slate-400 bg-midnight-900 p-3 rounded border border-midnight-800">
                <span className="text-healblue-300">Action Path: </span>
                <span className="text-white">{activeScenario.action}</span>
              </div>
            </div>

            {/* The AutoHeal Autonomous Resolution */}
            <div className="p-5 rounded-xl bg-midnight-950/70 border border-midnight-800">
              <div className="flex items-center space-x-2 text-xs font-mono text-healblue-300 mb-2">
                <Zap className="w-4 h-4 text-healblue-400" />
                <span>Deterministic Sequence</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed mb-4">
                {activeScenario.flowDescription}
              </p>
              <div className="text-xs font-mono text-slate-400 bg-midnight-900 p-3 rounded border border-midnight-800">
                <span className="text-healblue-300">Verification: </span>
                <span className="text-white">Liveness & Readiness Probes Verified</span>
              </div>
            </div>

          </div>

          {/* Detailed Verification Steps */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">
              Execution Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeScenario.details.map((detail, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-lg bg-midnight-950 border border-midnight-800/90 text-xs font-mono flex flex-col justify-between"
                >
                  <div className="text-healblue-400 mb-2 font-semibold">0{idx + 1}.</div>
                  <p className="text-slate-300 leading-relaxed">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Manual vs AutoHeal Comparison Bar */}
          <div className="mt-8 pt-6 border-t border-midnight-800 flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-4">
            <div className="flex items-center space-x-3 text-slate-400">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Traditional On-Call Triage: ~35–45 minutes of downtime</span>
            </div>
            <div className="flex items-center space-x-2 text-healblue-200">
              <CheckCircle2 className="w-4 h-4 text-healblue-400" />
              <span className="font-semibold">AutoHeal Autonomous MTTR: {activeScenario.mttr} (99.8% Faster)</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
