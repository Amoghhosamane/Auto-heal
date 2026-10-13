import React from 'react';
import { TrendingDown, Zap, UserX, ShieldCheck } from 'lucide-react';

export const KeyBenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: TrendingDown,
      title: "Reduced Downtime",
      stat: "99.4%",
      statLabel: "Downtime prevented",
      description: "Isolates and remediates anomalies within seconds to prevent cascading failures."
    },
    {
      icon: Zap,
      title: "Sub-Second MTTR",
      stat: "< 3.8s",
      statLabel: "Mean recovery time",
      description: "Reduces recovery time from 40+ minutes of manual SRE paging down to seconds."
    },
    {
      icon: UserX,
      title: "90% Fewer Alerts",
      stat: "90%",
      statLabel: "Less on-call fatigue",
      description: "Eliminates repetitive midnight alerts for ephemeral pod crashes and spikes."
    },
    {
      icon: ShieldCheck,
      title: "Production SLO",
      stat: "99.99%",
      statLabel: "Consistent availability",
      description: "Built-in anti-flapping circuit breakers ensure stability without continuous restarts."
    }
  ];

  return (
    <section id="benefits" className="py-14 border-b border-slate-200 dark:border-midnight-800 bg-white dark:bg-midnight-950 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-xl mb-10">
          <div className="text-xs font-mono text-healblue-600 dark:text-healblue-400 uppercase tracking-wider mb-1.5">
            Outcomes
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">
            Measurable resilience for cloud apps.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Turns reactive incident management into a silent, autonomous control loop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="p-5 rounded-xl bg-white dark:bg-midnight-900/60 border border-slate-200 dark:border-midnight-800 hover:border-healblue-300 transition-all flex flex-col justify-between group shadow-sm dark:shadow-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg bg-healblue-50 dark:bg-midnight-850 border border-healblue-200 dark:border-midnight-750 flex items-center justify-center group-hover:border-healblue-400 transition-colors">
                      <Icon className="w-4 h-4 text-healblue-600 dark:text-healblue-400" />
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold font-mono text-slate-900 dark:text-white tracking-tight">{benefit.stat}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{benefit.statLabel}</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5 tracking-tight">{benefit.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
