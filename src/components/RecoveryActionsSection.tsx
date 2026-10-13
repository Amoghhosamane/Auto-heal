import React from 'react';
import { RECOVERY_ACTIONS } from '../data/mockData';
import { RefreshCw, TrendingUp, History, Shuffle, BellRing } from 'lucide-react';

const ACTION_ICONS = [RefreshCw, TrendingUp, History, Shuffle, BellRing];

export const RecoveryActionsSection: React.FC = () => {
  return (
    <section id="recovery-actions" className="py-14 border-b border-slate-200 dark:border-midnight-800 bg-slate-50 dark:bg-midnight-950 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-xl mb-10">
          <div className="text-xs font-mono text-healblue-600 dark:text-healblue-400 uppercase tracking-wider mb-1.5">
            Recovery Policies
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
            Targeted remediation in milliseconds.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Eliminates blunt reboots with surgical actions tailored to each failure type.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RECOVERY_ACTIONS.map((action, index) => {
            const Icon = ACTION_ICONS[index];
            return (
              <div
                key={action.title}
                className="p-5 rounded-xl bg-white dark:bg-midnight-900/60 border border-slate-200 dark:border-midnight-800 hover:border-healblue-300 dark:hover:border-healblue-700/80 transition-all flex flex-col justify-between group shadow-sm dark:shadow-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-healblue-50 dark:bg-midnight-850 border border-healblue-200 dark:border-midnight-750 flex items-center justify-center group-hover:border-healblue-400 transition-colors">
                      <Icon className="w-4 h-4 text-healblue-600 dark:text-healblue-400" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">0{index + 1}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5 tracking-tight">
                    {action.title}
                  </h3>
                  <div className="text-[11px] text-healblue-700 dark:text-healblue-300 font-mono bg-healblue-50 dark:bg-midnight-950 px-2 py-1 rounded border border-healblue-100 dark:border-midnight-800 mb-3 truncate">
                    {action.trigger}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {action.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-midnight-800/80">
                  <code className="text-[10px] font-mono text-slate-700 dark:text-slate-300 block truncate bg-slate-50 dark:bg-midnight-950/80 px-2 py-1 rounded border border-slate-200 dark:border-midnight-800">
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
