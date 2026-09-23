import React from 'react';
import { RECOVERY_ACTIONS } from '../data/mockData';
import { RefreshCw, TrendingUp, History, Shuffle, BellRing, Terminal } from 'lucide-react';

const ACTION_ICONS = [RefreshCw, TrendingUp, History, Shuffle, BellRing];

export const RecoveryActionsSection: React.FC = () => {
  return (
    <section id="recovery-actions" className="py-24 border-b border-midnight-800 bg-midnight-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono text-healblue-400 uppercase tracking-wider mb-2">
            Targeted Actuation Policies
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Autonomous recovery actions. <br />
            <span className="text-slate-400 font-normal">Executed in milliseconds.</span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            AutoHeal eliminates blunt, destructive reboots. The engine executes targeted, surgical remedies calibrated to the specific failure classification.
          </p>
        </div>

        {/* 5 Recovery Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RECOVERY_ACTIONS.map((action, index) => {
            const Icon = ACTION_ICONS[index];
            const isWide = index === 3 || index === 4; // layout balance for 5 items
            return (
              <div
                key={action.title}
                className={`p-7 rounded-xl bg-midnight-900/60 border border-midnight-800 hover:border-healblue-700/80 transition-all flex flex-col justify-between group ${
                  isWide ? 'lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-lg bg-midnight-850 border border-midnight-750 flex items-center justify-center text-healblue-400 group-hover:border-healblue-500 transition-colors">
                      <Icon className="w-5 h-5 text-healblue-400" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">ACTION 0{index + 1}</span>
                  </div>

                  <h3 className="text-lg font-medium text-white mb-2 tracking-tight">
                    {action.title}
                  </h3>

                  <div className="mb-4">
                    <span className="text-[11px] font-mono text-slate-400 block mb-1">Trigger Condition:</span>
                    <p className="text-xs text-healblue-200 font-mono bg-midnight-950 px-2.5 py-1.5 rounded border border-midnight-800">
                      {action.trigger}
                    </p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {action.description}
                  </p>
                </div>

                {/* Command Preview */}
                <div className="pt-4 border-t border-midnight-800/80">
                  <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 mb-1.5">
                    <Terminal className="w-3 h-3 text-healblue-400" />
                    <span>Actuator Dispatch</span>
                  </div>
                  <code className="text-[11px] font-mono text-healblue-300 block truncate bg-midnight-950/80 px-2.5 py-1 rounded border border-midnight-800">
                    {action.commandPreview}
                  </code>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
