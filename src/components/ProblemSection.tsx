import React from 'react';
import { AlertCircle, Cpu, GitPullRequestClosed, Clock } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: AlertCircle,
      title: "Cloud services can crash unpredictably",
      subtitle: "Silent process deaths & OOM kills",
      description: "Unhandled exceptions, memory leaks, and thread deadlocks cause pods to enter terminal crash states without warning. Until someone notices, user requests fail with 502 Bad Gateway.",
      impact: "Silent downtime during peak traffic hours"
    },
    {
      icon: Cpu,
      title: "CPU & memory overload degrades health",
      subtitle: "Resource saturation & cascading lag",
      description: "Unanticipated traffic surges and background batch jobs saturate compute nodes. As queue depths spike, services drop connections and degrade downstream microservices.",
      impact: "p99 latency spikes exceeding 10,000ms"
    },
    {
      icon: GitPullRequestClosed,
      title: "Bad deployments break production",
      subtitle: "Silent regressions & schema mismatches",
      description: "Even with thorough CI/CD tests, edge cases slip into production releases. Broken dependencies cause instant canary regression, requiring emergency human intervention.",
      impact: "Immediate revenue loss and degraded customer trust"
    },
    {
      icon: Clock,
      title: "Manual recovery increases downtime",
      subtitle: "Slow human triage & on-call fatigue",
      description: "The traditional on-call cycle—alerting, waking engineers, reading logs, verifying graphs, and running manual kubectl commands—takes an average of 35–45 minutes per incident.",
      impact: "Prolonged mean-time-to-recovery (MTTR)"
    }
  ];

  return (
    <section id="problem" className="py-24 border-b border-slate-200 dark:border-midnight-800 bg-slate-50 dark:bg-midnight-950 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono text-healblue-600 dark:text-healblue-400 uppercase tracking-wider mb-2">
            The Production Reality
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-4">
            Cloud infrastructure is fragile. <br />
            <span className="text-slate-500 dark:text-slate-400 font-normal">Manual triage cannot keep up.</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            Modern distributed architectures have hundreds of interdependent services. When single points of failure cascade, human reaction times are inherently too slow to prevent service degradation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-7 rounded-xl bg-white dark:bg-midnight-900/60 border border-slate-200 dark:border-midnight-800 hover:border-healblue-300 dark:hover:border-healblue-800 transition-colors flex flex-col justify-between group shadow-sm dark:shadow-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-healblue-50 dark:bg-midnight-850 border border-healblue-200 dark:border-midnight-750 flex items-center justify-center group-hover:border-healblue-400 dark:group-hover:border-healblue-600 transition-colors">
                      <Icon className="w-5 h-5 text-healblue-600 dark:text-healblue-400" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-400">0{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1 tracking-tight">
                    {item.title}
                  </h3>
                  <div className="text-xs font-mono text-healblue-600 dark:text-healblue-300 mb-3">
                    {item.subtitle}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-midnight-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-400">SLA Consequence:</span>
                  <span className="font-mono text-healblue-700 dark:text-healblue-200">{item.impact}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
